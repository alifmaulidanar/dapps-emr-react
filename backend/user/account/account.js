import express from "express";
import { getUserAccountData } from "../../middleware/userData.js";

const router = express.Router();
router.use(express.json());

router.get("/:role/:address/account", async (req, res) => {
  try {
    const address = req.params.address;
    const data = await getUserAccountData(address);
    console.log({ data });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
