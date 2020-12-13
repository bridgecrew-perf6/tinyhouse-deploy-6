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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = require("../db");
const clear = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("[clear]: deleting all collections...");
        const db = yield db_1.connectDB();
        const collections = yield db.db.listCollections().toArray();
        if (collections.some((c) => (c === null || c === void 0 ? void 0 : c.name) === "users")) {
            yield db.users.drop();
        }
        if (collections.some((c) => (c === null || c === void 0 ? void 0 : c.name) === "bookings")) {
            yield db.bookings.drop();
        }
        if (collections.some((c) => (c === null || c === void 0 ? void 0 : c.name) === "listings")) {
            yield db.listings.drop();
        }
        console.log("[clear]: all collections deleted");
        process.exit(0);
    }
    catch (error) {
        console.log(error);
        throw Error("[clear]: failed to delete all collections");
    }
});
clear();
