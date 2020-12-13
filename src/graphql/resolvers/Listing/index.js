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
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingsResolvers = void 0;
const mongodb_1 = require("mongodb");
const types_1 = require("./types");
const utils_1 = require("../../../lib/utils");
const api_1 = require("../../../lib/api");
const types_2 = require("../../../lib/types");
const listing = (_root, { id }, { db, req }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listing = yield db.listings.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!listing) {
            throw Error("listing can't be found");
        }
        const viewer = yield utils_1.authorize(db, req);
        if ((viewer === null || viewer === void 0 ? void 0 : viewer._id) === listing.host) {
            listing.authorized = true;
        }
        return listing;
    }
    catch (error) {
        throw Error(`Failed to query listing: ${error}`);
    }
});
const listings = (_root, { filter, limit, page, location }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = {};
        const data = { total: 0, result: [], region: null };
        if (location) {
            const { admin, city, country } = yield api_1.Google.geocode(location);
            if (city)
                query.city = city;
            if (admin)
                query.admin = admin;
            if (country) {
                query.country = country;
            }
            else {
                throw Error("no country found");
            }
            const cityText = city ? `${city}, ` : "";
            const countryText = country ? country : "";
            const adminText = admin ? `${admin}, ` : "";
            data.region = `${cityText}${adminText}${countryText}`;
        }
        let cursor = db.listings.find(query);
        if (filter === types_1.ListingsFilter.PRICE_LOW_TO_HIGH) {
            cursor = cursor.sort({ price: 1 });
        }
        if (filter === types_1.ListingsFilter.PRICE_HIGH_TO_LOW) {
            cursor = cursor.sort({ price: -1 });
        }
        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);
        data.total = yield cursor.count();
        data.result = yield cursor.toArray();
        return data;
    }
    catch (error) {
        throw Error(`Failed to query listings: ${error}`);
    }
});
const verifyHostListingInput = (input) => {
    const { title, description, type, price } = input;
    const { Apartment, House } = types_2.ListingType;
    if (title.length > 100) {
        throw Error("listing title must be under 100 characters");
    }
    if (description.length > 5000) {
        throw Error("listing description must be under 5000 characters");
    }
    if (type !== Apartment && type !== House) {
        throw Error("listing type must be either an apartment or house");
    }
    if (price < 0) {
        throw Error("listing price must be greater than 0");
    }
};
const hostListing = (_root, { input }, { db, req }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        verifyHostListingInput(input);
        const viewer = yield utils_1.authorize(db, req);
        if (!viewer) {
            throw Error("viewer can not be found");
        }
        const { admin, city, country } = yield api_1.Google.geocode(input.address);
        if (!admin || !city || !country) {
            throw Error("invalid address input");
        }
        const imageUrl = yield api_1.Cloudinary.upload(input.image);
        input.image = imageUrl;
        const insertResult = yield db.listings.insertOne(Object.assign(Object.assign({ _id: new mongodb_1.ObjectId() }, input), { city,
            admin,
            country, bookings: [], host: viewer._id, bookingsIndex: {} }));
        const [insertedListing] = insertResult.ops;
        yield db.users.updateOne({ _id: viewer._id }, { $push: { listings: insertedListing._id } });
        return insertedListing;
    }
    catch (error) {
        throw Error(`failed to create a new listing: ${error}`);
    }
});
exports.listingsResolvers = {
    Query: {
        listing,
        listings,
    },
    Mutation: { hostListing },
    Listing: {
        id: (listing) => listing._id.toHexString(),
        host: (listing, _args, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            const host = db.users.findOne({ _id: listing.host });
            if (!host) {
                throw Error("host can't be found");
            }
            return host;
        }),
        bookingsIndex: (listing) => JSON.stringify(listing.bookingsIndex),
        bookings: (listing, { limit, page }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (!listing.authorized) {
                    return null;
                }
                const data = { total: 0, result: [] };
                let cursor = db.bookings.find({ _id: { $in: listing.bookings } });
                cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
                cursor = cursor.limit(limit);
                data.total = yield cursor.count();
                data.result = yield cursor.toArray();
                return data;
            }
            catch (error) {
                throw Error(`Failed to query listing bookings: ${error}`);
            }
        }),
    },
};
