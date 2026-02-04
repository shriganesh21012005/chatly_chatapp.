import express from "express";
import { signup, login, logout, updateProfile } from "../controllers/auth.controller.js";
import { checkauth } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();


router.get("/test", arcjetProtection,(req, res) => {
  res.status(200).json({ message: "Auth route is working" });
});

// router.use(arcjetProtection,checkauth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update", checkauth, updateProfile);

router.get("/check", checkauth, (req, res) => {
  res.status(200).json({ message: "Authenticated", user: req.user });
});


export default router;