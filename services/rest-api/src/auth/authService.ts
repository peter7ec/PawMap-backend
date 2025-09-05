import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@backend/database";
import HttpError from "../utils/HttpError";
import type { LoginUser, RegisterUser, UpdateUser } from "./authSchemas";
import { JWT_SECRET } from "../constants/global";
import type { UserResponse } from "./authTypes";

const authService = {
  register: async (registerUser: RegisterUser): Promise<UserResponse> => {
    const doesUserExists = await prisma.user.count({
      where: { email: registerUser.email },
    });
    if (doesUserExists) throw new HttpError("User already exists", 409);

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(registerUser.password, salt);

    return prisma.user.create({
      data: {
        email: registerUser.email,
        password: hashedPassword,
        name: registerUser.name,
        profile_avatar: registerUser.profile_avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        profile_avatar: true,
      },
    });
  },
  editUserData: async (
    userId: string,
    userData: UpdateUser
  ): Promise<string> => {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!dbUser) throw new HttpError("User does not exists!", 404);

    if (userData.newPassword) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.newPassword, salt);
      userData.newPassword = hashedPassword;
    }

    const newData = await prisma.user.update({
      where: { id: userId },
      data: {
        email: userData.newEmail,
        name: userData.newName,
        password: userData.newPassword,
        profile_avatar: userData.newProfile_avatar,
      },
    });

    const jwtPayload = {
      id: newData.id,
      email: newData.email,
      name: newData.name,
      profile_avatar: newData.profile_avatar,
    };

    const token = jwt.sign(jwtPayload, JWT_SECRET as string);
    return token;
  },
  login: async (loginUser: LoginUser): Promise<string> => {
    const dbUser = await prisma.user.findUnique({
      where: { email: loginUser.email },
    });

    if (!dbUser) throw new HttpError("Invalid email/password!", 403);

    const isPasswordCorrect = await bcrypt.compare(
      loginUser.password,
      dbUser.password
    );
    if (!isPasswordCorrect) {
      throw new HttpError("Invalid email/password!", 403);
    }

    const jwtPayload = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      profile_avatar: dbUser.profile_avatar,
    };

    const token = jwt.sign(jwtPayload, JWT_SECRET as string);

    return token;
  },
};

export default authService;
