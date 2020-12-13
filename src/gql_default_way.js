"use strict";
// import {
//   GraphQLID,
//   GraphQLInt,
//   GraphQLList,
//   GraphQLSchema,
//   GraphQLString,
//   GraphQLNonNull,
//   GraphQLObjectType,
// } from "graphql";
// const Listing = new GraphQLObjectType({
//   name: "Listing",
//   fields: {
//     id: { type: GraphQLNonNull(GraphQLID) },
//     price: { type: GraphQLNonNull(GraphQLInt) },
//     rating: { type: GraphQLNonNull(GraphQLInt) },
//     title: { type: GraphQLNonNull(GraphQLString) },
//     image: { type: GraphQLNonNull(GraphQLString) },
//     numOfBeds: { type: GraphQLNonNull(GraphQLInt) },
//     numOfBaths: { type: GraphQLNonNull(GraphQLInt) },
//     address: { type: GraphQLNonNull(GraphQLString) },
//     numOfGuests: { type: GraphQLNonNull(GraphQLInt) },
//   },
// });
// const query = new GraphQLObjectType({
//   name: "Query",
//   fields: {
//     listings: {
//       type: GraphQLNonNull(GraphQLList(GraphQLNonNull(Listing))),
//       resolve: () => listings,
//     },
//   },
// });
// const mutation = new GraphQLObjectType({
//   name: "Mutation",
//   fields: {
//     deleteListing: {
//       type: GraphQLNonNull(Listing),
//       args: {
//         id: { type: GraphQLNonNull(GraphQLID) },
//       },
//       resolve: (_root, { id }) => {
//         for (const [i, item] of listings.entries()) {
//           if (item.id === id) {
//             listings.splice(i, 1);
//             return item;
//           } else {
//             throw Error("failed to delete listing");
//           }
//         }
//       },
//     },
//   },
// });
// export const schema = new GraphQLSchema({ query, mutation });
