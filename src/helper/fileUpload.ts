import { createClient } from "@supabase/supabase-js";
import { createCustomError } from "../utils/customError";
import supabaseClient from "../../supabase";

const BUCKET_NAME = process.env.SUPABASE_BUCKET;

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
