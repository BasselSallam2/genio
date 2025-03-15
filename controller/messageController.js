import bcrypt from "bcryptjs";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const newMessage = async (req, res, next) => {
  const { message } = req.body;
  const { user } = req.user;

  const userwithplan = await prisma.user.findUnique({
    where: { id: user.id },
    include: { Subscription: { include: { plan: true } } },
  });

  const maximum = userwithplan.Subscription.plan.maximumMessages;
  const userCounter = user.messageCounter;
  const datenow = new Date();
  const lastMessageDate = new Date(user.lastMessage);

  if (userCounter == maximum && (lastMessageDate && (datenow - lastMessageDate) / (1000 * 60 * 60) < 24) ) {
    return res
      .status(403)
      .json({ error: "User has reached the maximum message limit." });
  }

  if (userCounter == maximum && (lastMessageDate && (datenow - lastMessageDate) / (1000 * 60 * 60) > 24) ) {

  await prisma.user.update({
    where: { id: user.id },
    data: { messageCounter: 0 },
  });
  }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastMessage: datenow },
    });

  await prisma.user.update({
    where: { id: user.id },
    data: { messageCounter: userCounter + 1 },
  });

  const dummyAnswer = "This is a dummy answer.";

  //  dummyAnswer = functio to get the answer(message)

  return res.status(200).json({ answer: dummyAnswer });
};
