"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewerResolvers = void 0;
const crypto_1 = __importDefault(require("crypto"));
const utils_1 = require("../../../lib/utils");
const api_1 = require("../../../lib/api");
const { NODE_ENV } = process.env;
const cookieOptions = {
    signed: true,
    httpOnly: true,
    sameSite: true,
    secure: NODE_ENV === "development" ? false : true,
};
const logInViaGoogle = (code, token, db, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const { user } = yield api_1.Google.logIn(code);
    if (!user) {
        throw Error("Google login error");
    }
    const userNamesList = user.names || null;
    const userPhotosList = user.photos || null;
    const userEmailsList = user.emailAddresses || null;
    const userAvatar = ((_a = userPhotosList === null || userPhotosList === void 0 ? void 0 : userPhotosList[0]) === null || _a === void 0 ? void 0 : _a.url) || null;
    const userEmail = ((_b = userEmailsList === null || userEmailsList === void 0 ? void 0 : userEmailsList[0]) === null || _b === void 0 ? void 0 : _b.value) || null;
    const userName = ((_c = userNamesList === null || userNamesList === void 0 ? void 0 : userNamesList[0]) === null || _c === void 0 ? void 0 : _c.displayName) || null;
    const userId = ((_f = (_e = (_d = userNamesList === null || userNamesList === void 0 ? void 0 : userNamesList[0]) === null || _d === void 0 ? void 0 : _d.metadata) === null || _e === void 0 ? void 0 : _e.source) === null || _f === void 0 ? void 0 : _f.id) || null;
    if (!userAvatar || !userEmail || !userName || !userId) {
        throw Error("Google login error");
    }
    const updateRes = yield db.users.findOneAndUpdate({ _id: userId }, { $set: { name: userName, avatar: userAvatar, contact: userEmail, token } }, { returnOriginal: false });
    let viewer = updateRes.value;
    if (!viewer) {
        const insertResult = yield db.users.insertOne({
            token,
            income: 0,
            _id: userId,
            bookings: [],
            listings: [],
            name: userName,
            avatar: userAvatar,
            contact: userEmail,
        });
        viewer = insertResult.ops[0];
    }
    res.cookie("viewer", userId, Object.assign(Object.assign({}, cookieOptions), { maxAge: 365 * 24 * 60 * 60 * 1000 }));
    return viewer;
});
const logInViaCookie = (token, db, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updateRes = yield db.users.findOneAndUpdate({ _id: req.signedCookies.viewer }, { $set: { token } }, { returnOriginal: false });
    let viewer = updateRes.value;
    if (!viewer) {
        res.clearCookie("viewer", cookieOptions);
    }
    return viewer;
});
exports.viewerResolvers = {
    Query: {
        authUrl: () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return api_1.Google.authUrl;
            }
            catch (error) {
                throw Error(`Failed to query Google Auth Url: ${error}`);
            }
        }),
    },
    Mutation: {
        connectStripe: (_root, { input }, { db, req }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { code } = input;
                let viewer = yield utils_1.authorize(db, req);
                if (!viewer) {
                    throw Error("viewer can not be found");
                }
                const wallet = yield api_1.Stripe.connect(code);
                if (!wallet) {
                    throw Error("stripe grant error");
                }
                const updateRes = yield db.users.findOneAndUpdate({ _id: viewer._id }, { $set: { walletId: wallet.stripe_user_id } }, { returnOriginal: false });
                if (!updateRes.value) {
                    throw Error("viewer could not be updated");
                }
                viewer = updateRes.value;
                return {
                    _id: viewer._id,
                    didRequest: true,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    walletId: viewer.walletId || "",
                };
            }
            catch (error) {
                throw Error(`Failed to connect with Stripe: ${error}`);
            }
        }),
        disconnectStripe: (_root, _args, { db, req }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let viewer = yield utils_1.authorize(db, req);
                if (!viewer) {
                    throw Error("viewer can not be found");
                }
                const updateRes = yield db.users.findOneAndUpdate({ _id: viewer._id }, { $set: { walletId: null } }, { returnOriginal: false });
                if (!updateRes.value) {
                    throw Error("viewer could not be updated");
                }
                return {
                    _id: viewer._id,
                    didRequest: true,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    walletId: viewer.walletId || "",
                };
            }
            catch (error) {
                throw Error(`Failed to disconnect with Stripe: ${error}`);
            }
        }),
        logIn: (_root, { input }, { db, res, req }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const code = input ? input.code : null;
                const token = crypto_1.default.randomBytes(16).toString("hex");
                const viewer = code
                    ? yield logInViaGoogle(code, token, db, res)
                    : yield logInViaCookie(token, db, req, res);
                if (!viewer) {
                    return { didRequest: true };
                }
                return {
                    _id: viewer._id,
                    didRequest: true,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    walletId: viewer.walletId || "",
                };
            }
            catch (error) {
                throw Error(`Failed to log in: ${error}`);
            }
        }),
        logOut: (_root, _args, { res }) => {
            try {
                res.clearCookie("viewer", cookieOptions);
                return { didRequest: true };
            }
            catch (error) {
                throw Error(`Failed to log out: ${error}`);
            }
        },
    },
    Viewer: {
        id: (v) => v._id,
        hasWallet: (v) => (v.walletId ? true : undefined),
    },
};
