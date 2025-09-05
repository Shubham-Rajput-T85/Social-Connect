import { Response } from "express";
import { AppError } from "../utils/errorUtils";
import { comparePassword, hashPassword } from "../utils/passwordUtils";
import User from "../models/user";
import { signupDTO } from "../dtos/auth/signupDTO";
import { loginDTO } from "../dtos/auth/loginDTO";
import { generateToken, verifyToken } from "../utils/jwtUtils";
import { setCookie } from "../utils/cookieUtils";

export const signup = async (signupObj: signupDTO) => {
    const name = signupObj.name;
    const email = signupObj.email;
    const username = signupObj.username;
    const password = signupObj.password;
    const bio = signupObj.bio;
    const profileUrl = signupObj.profileUrl;
    const hashedPassword = await hashPassword(password);

    const user = new User({
        name: name,
        email: email,
        username: username,
        hashPassword: hashedPassword,
        bio: bio,
        profileUrl: profileUrl,
    });

    const response = await user.save();
    console.log("response: ", response);

    return response;
}

export const login = async (res:Response, loginObj: loginDTO) => {
    const user = await User.findOne({
        $or: [
          { email: loginObj.usernameOrEmail },
          { username: loginObj.usernameOrEmail }
        ]
      });

    if (!user) {
        const error = new AppError("user doesnt exist");
        error.statusCode = 401;
        throw error;
    }

    const isEqual = await comparePassword(loginObj.password, user.hashPassword);

    if (!isEqual) {
        const error = new AppError("password is not correct!");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user);

    setCookie(res,"jwt",token);

    const response = {
        token: token,
        userId: user._id.toString(),
        user: user
    }

    return response;
}

export const getMe = async (token: string) => {
    const decoded:any = verifyToken(token); // decode JWT
    const user = await User.findById(decoded.userId).select("-password");
    return user;
}
