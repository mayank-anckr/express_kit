import { sendNotification } from "../helper/sendNotification";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import validateAttributes from "../helper/validation";
import Auth from "../models/auth";
import asyncHandeler from "../utils/asyncHandeler";
import { createCustomError } from "../utils/customError";
import { createSuccessResponse } from "../utils/createSuccessResponse";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { ApiResponse } from "../utils/ApiResponse";
import logger from "../utils/logger";
import User from "../models/user";
import multer from "multer";
import {
  uploadFileToSupabase,
  uploadFileToSupabaseBase64,
} from "../helper/fileUpload";
import fileDownloadFromSupabase from "../helper/fileDownload";
import fs from "fs";
import util from "util";

const options = {
  httpOnly: true,
  secure: true,
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const generateAccessAndRefereshTokens = async (
  username: string,
  unique_id_key: number
) => {
  try {
    const accessToken = await generateAccessToken({ username });
    const refreshToken = await generateRefreshToken({ username });
    await Auth.update(
      { refreshToken: refreshToken },
      { where: { unique_id_key: unique_id_key } }
    );
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error(error);
    throw createCustomError(
      "Something went wrong while generating referesh and access token",
      500
    );
  }
};

export const updateUserDetails = asyncHandeler(
  async (req: Request, res: Response) => {
    const { username, image, email } = req.body;
    const unique_id_key = req.params.id;

    if (!unique_id_key) {
      throw createCustomError("unique_id_key is required", 400);
    }

    const emailCheck = validateAttributes(email, "emailcheck");
    if (!emailCheck) {
      throw createCustomError("invalid emailId", 401);
    }

    const userNameCheck = validateAttributes(username, "namecheck");
    if (!userNameCheck) {
      throw createCustomError("invalid username", 401);
    }
    const [user] = await User.update(
      {
        username: username,
        email: email,
        image: image,
      },
      {
        where: { id: unique_id_key },
      }
    );

    if (!user) {
      throw createCustomError("Invalid uuid", 401);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "User update successfully"));
  }
);

export const deleteUserDetails = asyncHandeler(
  async (req: Request, res: Response) => {
    const uniqueIdKey = req.params.id;
    if (!uniqueIdKey) {
      throw createCustomError("unique_id_key is required", 400);
    }

    const user = await User.destroy({ where: { id: uniqueIdKey } });
    if (!user) {
      throw createCustomError("Invalid unique_id_key", 401);
    }

    const auths = await Auth.destroy({ where: { unique_id_key: uniqueIdKey } });
    if (!auths) {
      throw createCustomError("Invalid unique_id_key", 401);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "User deleted successfully"));
  }
);

export const profileDetails = asyncHandeler(
  async (req: Request, res: Response) => {
    const users = await User.findAll();
    if (Array.isArray(users) && !users.length) {
      throw createCustomError("No user found", 404);
    }
    return res.status(200).json(
      new ApiResponse(200, "Users found", {
        users: users,
      })
    );
  }
);

export const profileDetailsByUserId = asyncHandeler(
  async (req: Request, res: Response) => {
    const uniqueIdKey = req.params.id;
    const user = await User.findOne({ where: { id: uniqueIdKey } });
    if (!user) {
      throw createCustomError("No user found", 404);
    }
    return res.status(200).json(
      new ApiResponse(200, "User found", {
        user: user,
      })
    );
  }
);

export const resetPassword = asyncHandeler(
  async (req: Request, res: Response) => {
    const { uuid, password } = req.body;
    const passwordCheck = validateAttributes(password, "passwordcheck");
    if (!passwordCheck) {
      throw createCustomError("Invalid password", 401);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await Auth.update(
      { password: hashedPassword },
      { where: { unique_id_key: uuid } }
    );

    if (!user) {
      throw createCustomError("Invalid uuid", 401);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Reset Data Successfully", user));
  }
);

export const getAllUserData = asyncHandeler(
  async (req: Request, res: Response) => {
    const users = await Auth.findAll();
    return res
      .status(200)
      .json(new ApiResponse(200, "User data retrieved Successfully", users));
  }
);

export const signout = asyncHandeler(async (req: Request, res: Response) => {
  res.clearCookie("token", { httpOnly: true, secure: true });
  return res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

declare global {
  namespace Express {
    interface Request {
      checkResult?: any; // Replace `any` with a specific type if you have a User type defined
    }
  }
}

export const refreshAccessToken = asyncHandeler(
  async (req: Request, res: Response) => {
    const user = req.checkResult;
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user.username,
      user.unique_id_key
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, "Access token refreshed", {
          accessToken,
          refreshToken: refreshToken,
        })
      );
  }
);

export const uploadFile = asyncHandeler(async (req: Request, res: Response) => {
  const RETRY_LIMIT = 3;
  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
    try {
      const file = req.file;
      logger.info("file", file);
      const fileBuffer = req.file.buffer;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const publicUrl = await uploadFileToSupabase(fileBuffer, file.filename);
      const [updated] = await User.update(
        {
          image: publicUrl,
        },
        {
          where: {
            username: req["user"].username,
          },
        }
      );
      if (updated) {
        fs.unlink(file.path, (err) => {
          if (err) {
            throw createCustomError("Failed to delete temporary file:", 400);
          } else {
            return res
              .status(200)
              .json(new ApiResponse(200, "File uploaded successfully"));
          }
        });
      } else {
        return res.status(404).json(new ApiResponse(200, "User not found"));
      }
    } catch (error) {
      logger.error(`Attempt ${attempt} failed:`, error);
      if (attempt === RETRY_LIMIT) {
        throw new Error("All attempts to upload the file failed");
      }
    }
  }
});

export const downloadFile = asyncHandeler(
  async (req: Request, res: Response) => {
    const RETRY_LIMIT = 3;
    for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
      try {
        const user = await User.findOne({
          where: {
            id: req["user"].unique_id_key,
          },
        });
        if (user) {
          const { imageName, mimeType, data } = await fileDownloadFromSupabase(
            user.image,
            res
          );
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${imageName}"`
          );
          res.setHeader("Content-Type", mimeType);
          res.setHeader("Content-Length", data.size);

          // Send the data as a stream
          data.arrayBuffer().then((buffer) => {
            res.send(Buffer.from(buffer));
          });
          break;
        } else {
          return res.status(404).json(new ApiResponse(404, "User not found"));
        }
      } catch (error) {
        logger.error(`Attempt ${attempt} failed:`, error);
        if (attempt === RETRY_LIMIT) {
          throw new Error("All attempts to upload the file failed");
        }
      }
    }
  }
);

export const userNotification = asyncHandeler(
  async (req: Request, res: Response) => {
    try {
      const { token, title, body } = req.body;
      const notification = await sendNotification(token, title, body);
      if (notification) {
        return res
          .status(200)
          .json(new ApiResponse(200, "Send notification successfully"));
      } else {
        return res
          .status(401)
          .json(new ApiResponse(401, "Send notification unsuccessfully"));
      }
    } catch (error) {}
  }
);

export const uploadImageBase64 = asyncHandeler(
  async (req: Request, res: Response) => {
    const writeFileAsync = util.promisify(fs.writeFile);
    const readFileAsync = util.promisify(fs.readFile);
    const unlinkAsync = util.promisify(fs.unlink);
    const RETRY_LIMIT = 3;
    for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
      try {
        const { image, base64 } = req.body;
        if (!image) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        await writeFileAsync("image.png", base64, { encoding: "base64" });
        const buffer = await readFileAsync("image.png");

        const publicUrl = await uploadFileToSupabaseBase64(buffer, image);

        const [updated] = await User.update(
          {
            image: publicUrl,
          },
          {
            where: {
              username: req["user"].username,
            },
          }
        );
        await unlinkAsync("image.png");
        logger.info("Deleted image file");
        if (updated) {
          return res
            .status(200)
            .json(new ApiResponse(200, "File uploaded successfully"));
        } else {
          return res.status(404).json(new ApiResponse(200, "User not found"));
        }
      } catch (error) {
        logger.error(`Attempt ${attempt} failed:`, error);
        if (attempt === RETRY_LIMIT) {
          throw new Error("All attempts to upload the file failed");
        }
      }
    }
  }
);
