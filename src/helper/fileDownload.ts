import { createClient } from "@supabase/supabase-js";
import { createCustomError } from "../utils/customError";
import getImageName from "./imageName";

const SUPABASE_URL = process.env.NEW_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRETKEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const fileDownloadFromSupabase = async (filePath, res) => {
  try {
    const imageName = await getImageName(filePath);
    const { data, error } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .download(imageName);
    if (error) {
      throw createCustomError(error.message, 401);
    }

    const mimeType = data.type || "application/octet-stream";

    return { imageName, mimeType, data };
  } catch (error) {
    throw createCustomError(error.message, 500);
  }
};

export default fileDownloadFromSupabase;
