import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "auth_token";

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}


export function createToken(userId: Types.ObjectId) {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: "7d",
    });
}


export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
}


export function setAuthCookie(token: string) {
    cookies().set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });
}


export function getAuthCookie() {
    return cookies().get(COOKIE_NAME)?.value;
}


export function clearAuthCookie() {
    cookies().delete(COOKIE_NAME);
}
