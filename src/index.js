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
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const db_1 = require("./db");
const graphql_1 = require("./graphql");
const { PORT, SECRET } = process.env;
const mount = (app) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield db_1.connectDB();
    app.use(express_1.default.json({ limit: "2mb" }));
    app.use(cookie_parser_1.default(SECRET));
    app.use(compression_1.default());
    app.use(express_1.default.static(`${__dirname}/client`));
    app.get("/*", (_req, res) => res.sendFile(`${__dirname}/client/index.html`));
    const server = new apollo_server_express_1.ApolloServer({
        typeDefs: graphql_1.typeDefs,
        resolvers: graphql_1.resolvers,
        context: ({ req, res }) => ({ req, res, db }),
    });
    server.applyMiddleware({ app, path: "/api" });
    app.listen(PORT);
    console.log(`[app]: http://localhost:${PORT}`);
});
mount(express_1.default());
