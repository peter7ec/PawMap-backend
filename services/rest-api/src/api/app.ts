import express, { Express } from "express";
import cors from "cors";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import authRouter from "../auth/authRoutes";
import apiRouter from "./apiRoutes";
import SWAGGER_OPTIONS from "../config/swagger";
import errorHandler from "../middlewares/errorHandle";

const app: Express = express();

app.use(cors());
app.use(express.json());

const swaggerDocs = swaggerJSDoc(SWAGGER_OPTIONS);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/auth", authRouter);
app.use("/api", apiRouter);

app.use(errorHandler);
export default app;
