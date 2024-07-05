/* eslint-disable @typescript-eslint/no-var-requires */
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { randomBytes } from "crypto";

const { combine, timestamp, printf, colorize } = winston.format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp, ...data }) => {
  const ENV = process.env.NODE_ENV || "development";
  const deviceInfo = `Hostname: ${require("os").hostname()}, Platform: ${require("os").platform()}, Arch: ${require("os").arch()}`;
  const generateLogId = (): string => randomBytes(16).toString("hex");
  const appVersion: string = process.env.npm_package_version || "unknown";
  const proccessId = process.pid.toString() || "unknown";

  const response = {
    level,
    logId: generateLogId(),
    timestamp,
    appInfo: {
      deviceInfo,
      appVersion,
      environment: ENV,
      proccessId: proccessId,
    },
    message,
    data,
  };
  return JSON.stringify(response);
});

// Define custom log format for console
const consoleLogFormat = printf(({ level, message, timestamp, metadata }) => {
  const dataString =
    metadata && Object.keys(metadata).length > 0
      ? JSON.stringify(metadata)
      : "";
  return `${timestamp} ${level}: ${message} : ${dataString}`;
});

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize(),
    winston.format.metadata({ fillExcept: ["message", "level", "timestamp"] })
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), consoleLogFormat),
    }),
    new DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "silly",
      maxSize: "20m",
      maxFiles: "14d",
      format: combine(logFormat),
    }),
    new DailyRotateFile({
      filename: "logs/warning-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "warn",
      maxSize: "20m",
      maxFiles: "14d",
      format: combine(logFormat),
    }),
    new DailyRotateFile({
      filename: "logs/info-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "info",
      maxSize: "20m",
      maxFiles: "14d",
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

export default logger;
