import { createClient } from "@supabase/supabase-js";
import { createCustomError } from "../utils/customError";

const SUPABASE_URL = process.env.NEW_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRETKEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export const uploadFileToSupabase = async (filePath, fileName) => {
  try {
    const date = new Date().toISOString();
    const { data, error } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .upload(date, Buffer.from(filePath), {
        upsert: true,
        contentType: fileName,
      });

    if (error) {
      throw createCustomError(error.message, 400);
    }

    const { data: publicURL } = supabaseClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(date);

    return publicURL.publicUrl;
  } catch (error) {
    throw createCustomError(error.message, 400);
  }
};

export const uploadFileToSupabaseBase64 = async (filePath, fileName) => {
  try {
    const date = new Date().toISOString();
    const { data, error } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .upload(date, filePath, {
        contentType: fileName,
        upsert: true,
      });

    if (error) {
      throw createCustomError(error.message, 400);
    }

    const { data: publicURL } = supabaseClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(date);

    return publicURL.publicUrl;
  } catch (error) {
    throw createCustomError(error.message, 400);
  }
};
