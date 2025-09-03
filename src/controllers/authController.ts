import { validationResult } from "express-validator";
import { RequestHandler } from "express";
import { AppError } from "../utils/errorUtils";
import * as authService from "../services/authService";
import { loginDTO } from "../dtos/auth/loginDTO";
import { signupDTO } from "../dtos/auth/signupDTO";

export const signup: RequestHandler = async (req, res, next) => {
    try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new AppError("Signup failed due to a server error.",422,errors.array());
        // error.statusCode = 422;
        // error.data = errors.array();
        throw error;
    }

    const name = req.body.name;  
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const bio = req.body.bio;

    const signupObj:signupDTO = {
        name,
        email,
        username,
        password,
        bio
    };

    const response = await authService.signup(signupObj);
    console.log(response);

    return res.status(201).json({
        user: response
    });

    }
    catch (err) {
        console.log(err);
        console.error(err);
        next(err);
    }

}


export const login: RequestHandler = async (req, res, next) => {
    try {
        const usernameOrEmail = req.body.usernameOrEmail;
        const password = req.body.password;
        const rememberMe = req.body.rememberMe ?? false; 

        const loginObj:loginDTO = {
            usernameOrEmail: usernameOrEmail,
            password: password,
            rememberMe: false
        }

        const response = await authService.login(res, loginObj);

        return res.status(200).json(response);
    }
    catch (err) {
        console.log(err);
        console.error(err);
        next(err);
    }
}