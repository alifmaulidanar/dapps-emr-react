import jwt from "jsonwebtoken";
import { promisify } from "util";
const verify = promisify(jwt.verify);
import { JWT_SECRET } from "./auth.js";

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ message: "Token otorisasi tidak ditemukan." });
  try {
    const decoded = await verify(token.split(" ")[1], JWT_SECRET);
    req.auth = { address: decoded.address, dmrNumber: decoded.dmrNumber, nik: decoded.nik, role: decoded.role };
    return next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Terjadi kesalahan. Coba lagi", error: error });
  }
};

export default authMiddleware;
