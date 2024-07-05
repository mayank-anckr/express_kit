// graphql/schema/index.ts

import { gql } from "apollo-server-express";
import authSchema from "./auth.schema";
import userSchema from "./user.schema";

const rootSchema = gql`
  scalar Upload
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

export default [rootSchema, authSchema, userSchema];
