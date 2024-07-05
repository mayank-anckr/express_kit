// userSchema.ts

import { gql } from "apollo-server-express";

const userSchema = gql`
  type User {
    id: ID!
    username: String!
    email: String
    image: String
  }

  type AuthenticationData {
    message: String!
    token: String!
  }

  type ApiResponse {
    status: Int!
    message: String!
  }

  extend type Query {
    getUsers: [User]
    getUser(id: ID!): User
  }

  extend type Mutation {
    createUser(username: String!, password: String!): AuthenticationData
    updateUser(id: ID!, username: String, password: String): User
    deleteUser(id: ID!): Boolean
    uploadFile(file: Upload!): ApiResponse!
  }
`;

export default userSchema;
