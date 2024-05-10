import express from "express";
import authMiddleware from "../../middleware/auth-middleware.js";
import { getUserAccountData, getUserAccountDataNew } from "../../middleware/userData.js";

const router = express.Router();
router.use(express.json());

router.get("/patient/account", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    // const addressNew = "0xf7C9Bd049Cc6e4538033AEa5254136F1DF9A4A6D";
    // console.log(address);
    // const data = await getUserAccountData(address);
    const dataNew = await getUserAccountDataNew(address);
    // console.log({ ...data });
    console.log({ ...dataNew });
    res.status(200).json(dataNew);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

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
