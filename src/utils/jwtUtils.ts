import jwt from "jsonwebtoken";
import IUser from "../interfaces/IUser";


export const generateToken = (user: IUser) => {
    const secret_key = process.env.SECRET_KEY;
    if (!secret_key) {
        throw new Error("SECRET_KEY is not defined in environment variables");
    }

    return jwt.sign({
        email: user.email,
        userId: user._id.toString(),
    },secret_key, { expiresIn: '1h'} );
}

export const verifyToken = (token: string) => {
    const secret_key = process.env.SECRET_KEY;
    if (!secret_key) {
        throw new Error("SECRET_KEY is not defined in environment variables");
    }
    return jwt.verify(token, secret_key);
}