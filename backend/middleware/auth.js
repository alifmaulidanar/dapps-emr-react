import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../dotenvConfig.js";
// import("dotenv").then((dotenv) => dotenv.config());
const JWT_SECRET = SECRET_KEY.toString();

// Create JWToken
const generateToken = (userData) => jwt.sign({ ...userData }, JWT_SECRET);

// Create JWT for reset password
// const generateTokenForResetPassword = (email) => {
//   return jwt.sign({ email: email }, JWT_SECRET, { expiresIn: "1h" });
// };

// Verify JWT
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.email;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Fungsi untuk memverifikasi password
// const verifyPassword = async (password, hashedPassword) => {
//   return bcrypt.compare(password, hashedPassword);
// };

export { JWT_SECRET, generateToken, verifyToken };
