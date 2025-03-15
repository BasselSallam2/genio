import express from "express";
const router = express.Router();
import { login, signup, ResetRequest, ResetCode, ResetPassword } from "../controller/AuthController.js";


router.post('/signup', signup);

router.post('/login', login);

router.post('/resetRequest', ResetRequest);

router.post('/resetCode/:user_id', ResetCode);

router.post('/reset/:user_id', ResetPassword);

export default router;
