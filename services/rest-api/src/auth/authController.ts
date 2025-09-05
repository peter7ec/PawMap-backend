import type { NextFunction, Request, Response } from "express";
import type { LoginUser, RegisterUser, UpdateUser } from "./authSchemas";
import type { ApiResponse } from "../types/global";
import authService from "./authService";
import type { LoginUserResponseData, UserResponse } from "./authTypes";
import { AuthorizedRequest } from "../middlewares/authorize";
import HttpError from "../utils/HttpError";

const authController = {
  postRegister: async (
    req: Request<unknown, unknown, RegisterUser>,
    res: Response<ApiResponse<UserResponse>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const newUser = await authService.register(req.body);
      res.json({ ok: true, message: "User registered!", data: newUser });
    } catch (error) {
      next(error);
    }
  },
  patchUserData: async (
    req: AuthorizedRequest,
    res: Response<ApiResponse<LoginUserResponseData>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const isSameUser = req.params.userId === req.user?.id ? true : false;
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new HttpError("No fields to update", 400);
      }

      if (isSameUser) {
        const newUserData = await authService.editUserData(
          req.params.userId,
          req.body
        );
        const token = newUserData;
        res.json({ ok: true, message: "User data edited!", data: { token } });
      } else {
        return next(new HttpError("This is not your data", 403));
      }
    } catch (error) {
      next(error);
    }
  },
  postLogin: async (
    req: Request<unknown, unknown, LoginUser>,
    res: Response<ApiResponse<LoginUserResponseData>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = await authService.login(req.body);
      res.json({
        ok: true,
        message: "Succesfully logged in!",
        data: { token },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
