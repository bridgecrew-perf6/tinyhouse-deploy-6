"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.typeDefs = apollo_server_express_1.gql `
  schema {
    query: Query
    mutation: Mutation
  }
  type Query {
    authUrl: String!
    user(id: ID!): User!
    listing(id: ID!): Listing!
    listings(
      page: Int!
      limit: Int!
      location: String
      filter: ListingFilter!
    ): Listings!
  }

  type Mutation {
    logOut: Viewer!
    disconnectStripe: Viewer!
    logIn(input: LogInInput): Viewer!
    hostListing(input: HostListingInput!): Listing!
    connectStripe(input: ConnectStripeInput!): Viewer!
    createBooking(input: CreateBookingInput!): Booking!
  }

  input CreateBookingInput {
    id: ID!
    source: String!
    checkIn: String!
    checkOut: String!
  }

  input HostListingInput {
    price: Int!
    type: String!
    title: String!
    image: String!
    address: String!
    numOfGuests: Int!
    description: String!
  }

  input ConnectStripeInput {
    code: String!
  }

  input LogInInput {
    code: String!
  }

  type Viewer {
    id: ID
    token: String
    avatar: String
    hasWallet: Boolean
    didRequest: Boolean!
  }

  type User {
    id: ID!
    income: Int
    name: String!
    avatar: String!
    contact: String!
    hasWallet: Boolean!
    bookings(limit: Int!, page: Int!): Bookings
    listings(limit: Int!, page: Int!): Listings!
  }

  type Bookings {
    total: Int!
    result: [Booking!]!
  }

  type Booking {
    id: ID!
    tenant: User!
    checkIn: String!
    listing: Listing!
    checkOut: String!
  }

  type Listings {
    total: Int!
    region: String
    result: [Listing!]!
  }

  type Listing {
    id: ID!
    price: Int!
    host: User!
    city: String!
    title: String!
    image: String!
    country: String!
    address: String!
    numOfGuests: Int!
    type: ListingType!
    description: String!
    bookingsIndex: String!
    bookings(limit: Int!, page: Int!): Bookings
  }

  enum ListingType {
    HOUSE
    APARTMENT
  }

  enum ListingFilter {
    PRICE_LOW_TO_HIGH
    PRICE_HIGH_TO_LOW
  }
`;
