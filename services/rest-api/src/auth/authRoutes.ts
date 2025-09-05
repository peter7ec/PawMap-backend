import { Router } from "express";
import validateRequestBody from "../middlewares/validateRequestBody";
import {
  loginUserSchema,
  registerUserSchema,
  updateUserSchema,
} from "./authSchemas";
import authController from "./authController";
import authorize from "../middlewares/authorize";

const authRouter: Router = Router();

authRouter.post(
  "/register",
  validateRequestBody(registerUserSchema),
  authController.postRegister
);
authRouter.patch(
  "/update/:userId",
  authorize,
  validateRequestBody(updateUserSchema),
  authController.patchUserData
);
authRouter.post(
  "/login",
  validateRequestBody(loginUserSchema),
  authController.postLogin
);

export default authRouter;
