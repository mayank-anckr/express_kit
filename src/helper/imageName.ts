import { createCustomError } from "../utils/customError";

const getImageName = async (filePath) => {
  try {
    const parts = filePath.split("/image/")[1];
    return parts;
  } catch (error) {
    throw createCustomError(error);
  }
};

export default getImageName;
