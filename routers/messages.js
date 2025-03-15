import express from "express"
const router = express.Router();
import {newMessage} from "../controller/messageController.js"




router.post("/newmessage" , newMessage) ;


export default router;