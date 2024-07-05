import { mergeResolvers } from "@graphql-tools/merge";
import userResolver from "./userResolver";
import authResolver from "./authResolver";
const resolvers = mergeResolvers([authResolver, userResolver]);

export default resolvers;
