"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const User_1 = require("./User");
const Viewer_1 = require("./Viewer");
const Booking_1 = require("./Booking");
const Listing_1 = require("./Listing");
exports.resolvers = lodash_merge_1.default(User_1.userResolvers, Viewer_1.viewerResolvers, Listing_1.listingsResolvers, Booking_1.bookingsResolvers);
