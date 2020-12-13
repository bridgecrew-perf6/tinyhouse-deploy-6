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
exports.bookingsResolvers = void 0;
const mongodb_1 = require("mongodb");
const api_1 = require("../../../lib/api");
const utils_1 = require("../../../lib/utils");
const resolveBookingsIndex = (bookingsIndex, checkInDate, checkOutDate) => {
    let dateCursor = new Date(checkInDate);
    let checkOut = new Date(checkOutDate);
    const newBookingsIndex = Object.assign({}, bookingsIndex);
    while (dateCursor <= checkOut) {
        const d = dateCursor.getUTCDay();
        const m = dateCursor.getUTCMonth();
        const y = dateCursor.getUTCFullYear();
        if (!newBookingsIndex[y]) {
            newBookingsIndex[y] = {};
        }
        if (!newBookingsIndex[y][m]) {
            newBookingsIndex[y][m] = {};
        }
        if (!newBookingsIndex[y][m][d]) {
            newBookingsIndex[y][m][d] = true;
        }
        else {
            throw Error("selected dates can not overlap dates that have already been booked");
        }
        dateCursor = new Date(dateCursor.getTime() + 86400000);
    }
    return newBookingsIndex;
};
exports.bookingsResolvers = {
    Mutation: {
        createBooking: (_root, { input }, { db, req }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { checkIn, checkOut, id, source } = input;
                let viewer = yield utils_1.authorize(db, req);
                if (!viewer) {
                    throw Error("viewer can not be found");
                }
                const listing = yield db.listings.findOne({ _id: new mongodb_1.ObjectId(id) });
                if (!listing) {
                    throw Error("listing can not be found");
                }
                if (listing.host === viewer._id) {
                    throw Error("viewer can not book own listing");
                }
                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);
                if (checkInDate > checkOutDate) {
                    throw Error("checkout date can not be before checkin date");
                }
                const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);
                const totalPrice = listing.price *
                    ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);
                const host = yield db.users.findOne({ _id: listing.host });
                if (!host || !host.walletId) {
                    throw Error("the host either can not be found or is not connected with Stripe");
                }
                yield api_1.Stripe.charge(totalPrice, source, host.walletId);
                const insertRes = yield db.bookings.insertOne({
                    checkIn,
                    checkOut,
                    tenant: viewer._id,
                    _id: new mongodb_1.ObjectId(),
                    listing: listing._id,
                });
                const insertedBooking = insertRes.ops[0];
                yield db.users.updateOne({ _id: host._id }, { $inc: { income: totalPrice } });
                yield db.users.updateOne({ _id: viewer._id }, { $push: { bookings: insertedBooking._id } });
                yield db.listings.updateOne({ _id: listing._id }, {
                    $set: { bookingsIndex },
                    $push: { bookings: insertedBooking._id },
                });
                return insertedBooking;
            }
            catch (error) {
                throw Error(`Failed to create a booking: ${error}`);
            }
        }),
    },
    Booking: {
        id: (booking) => booking._id.toHexString(),
        listing: (booking, _args, { db }) => db.listings.findOne({ _id: booking.listing }),
        tenant: (booking, _args, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const user = yield db.users.findOne({ _id: booking.tenant });
                if (!user) {
                    throw Error("no tenant found");
                }
                return user;
            }
            catch (error) {
                throw Error(`Failed while fetching the booking: ${error}`);
            }
        }),
    },
};
