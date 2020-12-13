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
exports.connectDB = void 0;
const mongodb_1 = require("mongodb");
const { DB_CLUSTER, DB_NAME, DB_USER, DB_USER_PASSWORD } = process.env;
const url = `mongodb+srv://${DB_USER}:${DB_USER_PASSWORD}@${DB_CLUSTER}.iybrf.mongodb.net/
            ${DB_NAME}?retryWrites=true&w=majority`;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield mongodb_1.MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = client.db("main");
    return {
        db,
        users: db.collection("users"),
        listings: db.collection("listings"),
        bookings: db.collection("bookings"),
    };
});
exports.connectDB = connectDB;
