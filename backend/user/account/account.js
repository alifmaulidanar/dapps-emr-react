import express from "express";
import { getUserAccountData } from "../../middleware/userData.js";
import authMiddleware from "../../middleware/auth-middleware.js";

const router = express.Router();
router.use(express.json());

router.get("/:role/account", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const data = await getUserAccountData(address);
    console.log({ data });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
