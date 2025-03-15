import bcrypt from "bcrypt";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


// export const paymentCallback = async (req , res , next) => {
//     try{
    

//     }
//     catch(error) {
//         next(error) ;
//     }



// } 