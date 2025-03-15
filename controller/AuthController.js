import bcrypt from "bcryptjs";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';



dotenv.config();


const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/),
    firstname: z.string().min(3),
    lastname: z.string().min(3),
    phonenumber: z.string().regex(/^\d+$/),
});

const resetSchema = z.object({
password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/),
});

export const signup = async (req, res, next) => {
    try {
        const { email, password, firstname , lastname , phonenumber } = signupSchema.parse(req.body);
        const {confirmpassword , countrycode} = req.body;
        const ReservedAccount = await prisma.user.findUnique({where : {email : email}});

        if (ReservedAccount) {
            return res.status(400).json({ message: "Email is already exists" });
        }
       

        if (password !== confirmpassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const CreateNewUser = await  prisma.user.create({data : {
            name : `${firstname} ${lastname}` , email : email.toLocaleLowerCase() , password: hashedPassword , phone: phonenumber , countrycode: countrycode
        }})
     
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const passwordError = error.errors.find(e => e.path.includes("password"));
            if (passwordError) {
                return res.status(400).json({ message: "Password should be at least 8 characters long, contain at least one uppercase letter, and one special character." });
            }
            return res.status(400).json({ errors: error.errors });
        }
        next(error);
    }
};


const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/),
});

export const login = async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const JWTPayload = {
            userId : user.id ,
            username: user.name ,
            email: user.email 
        }

        // const JWTOptions  // i iwll leave it empty if we don't wanna expire time 

        const JWTsecretKey =  process.env.JWT_SECRET ;
        const token = jwt.sign(JWTPayload , JWTsecretKey) ;

        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });


      
        res.status(200).json({ message: "Login successful"  , token:token});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        next(error);
    }
};


export const ResetRequest = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "No user found with this email" });
        }

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
        const resetExpiry = new Date(Date.now() + 30 * 60 * 1000);

        await prisma.user.update({
            where: { email },
            data: { resetCode:resetCode, resetexpire:resetExpiry }
        });

        const msg = {
            to: email,
            from: "bassela.sallam@gmail.com" ,
            subject: 'Password Reset',
            text: `You requested a password reset. Please use the following code to reset your password: ${resetCode}`,
            html: `<p>You requested a password reset. Please use the following code to reset your password:</p><p><strong>${resetCode}</strong></p>`,
        };

        await sgMail.send(msg);

        return res.status(200).json({ message: "Password reset email sent successfully" });
    } catch (error) {
        next(error);
    }
};

export const ResetCode = async (req , res , next) => {
    try {
        const {user_id} = req.params ;
        const {ResetCode} = req.body ;
        const user = await prisma.user.findUnique({
            where: { id: user_id }
        });

        if (!user || !user.resetCode || user.resetexpire < new Date()) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }

        if (user.resetCode !== ResetCode) {
            return res.status(400).json({ message: "Incorrect reset code" });
        }

        await prisma.user.update({where : {id: user_id} , data : {resetpermession: true}}) ;

        res.status(200).json({ message: "Reset code is valid" });
    }
    catch(error) {
        next(error) ;
    }
   

}


export const ResetPassword = async (req , res , next) => {


    try {

        const {password} = resetSchema.parse(req.body);
        const {confirmpassword} = req.body ;
        const {user_id} = req.params ;


        const user = await prisma.user.findUnique({where : {id : user_id}}) ;
       console.log(user); 

        if(!user) {
            return res.status(404).json({ message: "No user found with this ID" });
        }

        if(password !== confirmpassword ) {
            return res.status(404).json({ message: "passwords don't match" });
        }

        if(user.resetpermession !== true) {
            return res.status(404).json({ message: "reset expire" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        console.log(hashedPassword) ;

        const UpdatePassword = await  prisma.user.update({where : {id : user_id} , data : {
            password : hashedPassword ,
            resetCode : null ,
            resetexpire : null ,
            resetpermession : false
        }});

        res.status(200).json({ message: "reset is Done" }) ;

    }

    catch(error) {

        if (error instanceof z.ZodError) {
                return res.status(400).json({ message: "Password should be at least 8 characters long, contain at least one uppercase letter, and one special character." });
        }
             res.status(400).json({ errors: error.errors });
              next(error) ;
    }


}