import express from "express";
import {getAllContacts, getChatPartners, getMessagesByUserId, sendMessage} from "../controllers/message.controller.js";
import { getUserById } from "../controllers/message.controller.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import { checkauth } from "../middleware/auth.middleware.js";


const router = express.Router();


router.use(arcjetProtection, checkauth);


router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);// Make sure this is above the getMessagesByUserId route bec.."/:userId" can match with "/chats", so better to keep this route above to avode that case(otherwise if that case occures and we don't keep this route above then this route can be ignored.)
router.get("/:userId", getMessagesByUserId);
router.get("/call/:userId", checkauth, getUserById);
router.post("/send/:userId", sendMessage);

export default router;

