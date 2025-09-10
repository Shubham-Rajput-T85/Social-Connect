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
    const userObj = await User.findOne({
        $or: [
          { email: loginObj.usernameOrEmail },
          { username: loginObj.usernameOrEmail }
        ]
      }).select("_id name username bio profileUrl email hashPassword");

    if (!userObj) {
        const error = new AppError("user doesnt exist");
        error.statusCode = 401;
        throw error;
    }

    const isEqual = await comparePassword(loginObj.password, userObj.hashPassword);

    if (!isEqual) {
        const error = new AppError("password is not correct!");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(userObj);

    setCookie(res,"jwt",token);


  // Convert to plain object so we can safely modify it
  const userResponse: any = userObj.toObject();

  // Remove hashPassword before sending response
  if ('hashPassword' in userResponse) {
    delete userResponse.hashPassword;
  }

  return { user: userResponse };

}

export const getMe = async (token: string) => {
    const decoded:any = verifyToken(token); // decode JWT
    const user = await User.findById(decoded.userId).select("_id name username bio profileUrl email");
    return user;  
}
