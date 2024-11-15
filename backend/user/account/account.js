import express from "express";
import authMiddleware from "../../middleware/auth-middleware.js";
import { getUserAccountData } from "../../middleware/userData.js";

const router = express.Router();
router.use(express.json());

router.get("/:role/account", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const data = await getUserAccountData(address);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
