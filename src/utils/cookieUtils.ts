import { Response } from "express";

interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    maxAge?: number;
    path?: string;
}

export const setCookie = (
    res: Response,
    name: string,
    value: string,
    options: CookieOptions = {}
) => {
    res.cookie(name, value, {
        httpOnly: options.httpOnly ?? true,
        secure: false,
        // sameSite: options.sameSite ?? "strict",
        // maxAge: options.maxAge ?? 60 * 60 * 1000, // 1h default
        // path: options.path ?? "/",
    });
};

export const clearCookie = (res: Response, name: string) => {
    res.clearCookie(name, {
        httpOnly: true,
        secure: false,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    });
};