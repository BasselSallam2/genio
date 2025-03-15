import express from "express"
const router = express.Router();
import {GetUsers , GetUser , DeleteUser , editPassword , editUser} from "../controller/userController.js"
import {authenticateUser} from "../middleware/Authentication.js"


router.get('/user' ,authenticateUser , GetUsers) ;


router.get('/user/:user_id' , authenticateUser ,GetUser) ;


router.delete('/user/:user_id' , authenticateUser , DeleteUser);


router.put('/user/:user_id' , authenticateUser , editUser ) ;

router.patch('/user/:user_id' , authenticateUser , editPassword) ;

export default router;