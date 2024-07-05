import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import validateAttributes from "../helper/validation";
import Auth from "../models/auth";
import asyncHandeler from "../utils/asyncHandeler";
import { createCustomError } from "../utils/customError";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { ApiResponse } from "../utils/ApiResponse";
import logger from "../utils/logger";
import { UUID } from "crypto";
import User from "../models/user";
import { EventEmitter } from "events";
import sendingMail from "../helper/transport";
import staticConfig from "../helper/staticConfig";
import { resetPasswordTemplate } from "../helper/sendMail";

const options = {
  httpOnly: true,
  secure: true,
};

export const generateAccessAndRefereshTokens = async (
  username: string,
  unique_id_key: UUID | string
) => {
  try {
    const accessToken = await generateAccessToken({ username, unique_id_key });
    const refreshToken = await generateRefreshToken({
      username,
      unique_id_key,
    });
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

export const signUp = asyncHandeler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const usernameCheck = validateAttributes(username, "emailcheck");
  if (!usernameCheck) {
    throw createCustomError("invalid emailId", 401);
  }
  const passwordCheck = validateAttributes(password, "passwordcheck");
  if (!passwordCheck) {
    throw createCustomError("invalid password", 401);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const uniqueIdKey = uuidv4();
  const user = await Auth.create({
    username: username,
    password: hashedPassword,
    unique_id_key: uniqueIdKey,
  });
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    username,
    user?.dataValues.unique_id_key
  );

  let eventEmitter = new EventEmitter();
  eventEmitter.on("emailSent", (data) => {
    sendingMail(data);
  });

  // Emit the 'emailSent' event with the necessary data
  eventEmitter.emit("emailSent", {
    senderEmail: username,
    subject: staticConfig.signUpEmail.subject,
    text: staticConfig.signUpEmail.text,
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Sign-up Successfully", {
        accessToken,
        refreshToken: refreshToken,
      })
    );
});

export const signIn = asyncHandeler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await Auth.findOne({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user?.dataValues.password))) {
    throw createCustomError("Invalid username or password", 401);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    username,
    user?.dataValues.unique_id_key
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Sign in Successfully", {
        accessToken,
        refreshToken: refreshToken,
      })
    );
});

export const forgotPassword = asyncHandeler(
  async (req: Request, res: Response) => {
    const { username, baseUrl } = req.body;
    const user = await Auth.findOne({ where: { username } });
    if (!user) {
      throw createCustomError("Invalid username", 401);
    }

    let eventEmitter = new EventEmitter();
    eventEmitter.on("emailSent", (data) => {
      sendingMail(data);
    });

    // Emit the 'emailSent' event with the necessary data
    eventEmitter.emit("emailSent", {
      senderEmail: username,
      subject: staticConfig.forgotPasswordEmail.subject,
      text: ``,
      htmlTemplate: resetPasswordTemplate(
        baseUrl,
        user.dataValues.unique_id_key
      ),
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `${baseUrl}/?uuid=${user.dataValues.unique_id_key}`
        )
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
    const users = await Auth.findAll({
      attributes: [],
      include: {
        model: User,
        as: "user",
        required: true, // Ensures that only records with matching users are fetched
      },
      raw: true,
    });
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
