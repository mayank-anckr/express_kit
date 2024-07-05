import express from "express";
import authRoutes from "./routes/auth.route";
import sequelize from "./models/index";
import paymentRoutes from "./routes/payment.route";
import phonepayPaymentRoutes from "./routes/phonepayPayment.route";
import logger from "./utils/logger";
import demoRoutes from "./routes/demo.route";
import schema from "./graphql/schema";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import resolvers from "./graphql/resolvers/index";
import { ApolloServer } from "apollo-server-express";
import errorHandlerfn from "./middleware/errorHandler";
import { getUserFromToken } from "./middleware/jwtCheck";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createCustomError } from "./utils/customError";
import userRoutes from "./routes/user.route";
// import graphqlUploadExpress from "graphql-upload/GraphQLUpload.mjs";
// import { AppoloServerPluginDrainHttpServer } from "apollo-server-core";

// Create an instance of ApolloServer
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: ({ req, res }) => {
    const token = req.cookies.accessToken;
    let user = null;
    try {
      if (!token) {
        throw createCustomError("Invalid Token");
      }
      user = getUserFromToken(token);
    } catch (error) {
      logger.error("error occures", { error: error });
    }
    return { user, req, res };
  },
});

const app = express();
const port = 3000;
// app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

//payment webhook
// app.use("/api", paymentRoutes);
app.use("/api", phonepayPaymentRoutes);
//rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

//app routes
app.get("/", (req, res) => {
  res.send("My World!");
});

app.use("/api", demoRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);

async function startServer() {
  //error handling
  app.use(errorHandlerfn);

  // GraphQL endpoint
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
  // Catch 404 and forward to error handler
  app.use((req, res, next) => {
    const error = new Error("API not found");
    next(error);
  });
  sequelize
    .sync()
    .then(() => {
      app.listen(port, () => {
        logger.info(
          `Server is running on http://localhost:${port} & for graphql use http://localhost:${port}/graphql`
        );
      });
    })
    .catch((err: Error) => {
      logger.error("Unable to connect to the database:", err);
    });
}
startServer();
