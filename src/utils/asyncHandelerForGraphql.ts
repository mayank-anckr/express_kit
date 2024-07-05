import { createCustomError } from "./customError";

const asyncHandler = (resolver) => {
    return async (parent, args, context, info) => {
      try {
        return await resolver(parent, args, context, info);
      } catch (error) {
        // return "moka"
        // throw new Error(error.message)
        throw createCustomError(error.message, error.staus || 500);
      }
    };
  };
  
export default asyncHandler;