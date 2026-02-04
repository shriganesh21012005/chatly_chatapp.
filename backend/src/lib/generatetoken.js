import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const { JWT_SECRET } = ENV;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "1hrs",
  });

  res.cookie("jwt", token, {
    maxAge: 1 * 60 * 60 * 1000, // 1 hrs
    httpOnly: true, // prevent XSS attacks: cross-site scripting
    sameSite: "none", // CSRF attacks
    secure: true,
  });
  return token;
};