import { RequestHandler } from "express";
import { AppError } from "../utils/errorUtils";
import { verifyToken } from "../utils/jwtUtils";

const isAuthenticated: RequestHandler =  (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new AppError("Not authenticated.");
        error.statusCode = 401;
        throw error; 
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = verifyToken(token);
    }
    catch(err){
        // err.statusCode = 500;
        // throw err;
        next(err);
    }

    if (!decodedToken) {
        const error = new AppError("Not authenticated.");
        error.statusCode = 401;
        next(error);
    }
    next();
}

export default isAuthenticated;
