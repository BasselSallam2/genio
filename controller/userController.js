import bcrypt from "bcryptjs";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import exp from "constants";
dotenv.config();



const passwordSchema = z.object({
    password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/),
    });

    const editSchema = z.object({
        email: z.string().email(),
        name: z.string().min(6),
    });


export const GetUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ where: { Isactive: true } });
    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const GetUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;


    if(user_id !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id },
      select: {
        name: true,
        email: true,
        phone: true,
        countrycode: true,
        image: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const DeleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.param;
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });

    return res.status(200).json({ message: "User deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

export const editUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const {name , email} = editSchema.parse(req.body) ;
    const {phone, image, countrycode } = req.body;

    if(user_id !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized" });
    }

    const user = await prisma.user.update({
      where: { id: user_id },
      data: {
        name: name,
        email: email,
        phone: phone,
        countrycode: countrycode,
        image: image,
      },
    });
    res.status(201).json({message : "user profile is updated"}) ;
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const editPassword = async (req , res , next) => {
    try {
        const {user_id} = req.params ;
        const {password} = passwordSchema.parse(req.body) ;
        const {confirmpassword} = req.body ;

        if(user_id !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if(password !== confirmpassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const hashedPassword = await bcrypt.hash(password , 12) ;

        const user = await prisma.user.update({where : {id : user_id} , data : {
            password : hashedPassword 
        }});

        res.status(201).json({ message: "Password is updated successfully" }) ;

    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const passwordError = error.errors.find(e => e.path.includes("password"));
            if (passwordError) {
                return res.status(400).json({ message: "Password should be at least 8 characters long, contain at least one uppercase letter, and one special character." });
            }
            return res.status(400).json({ errors: error.errors });
        }
        next(error) ;
    }
} 
