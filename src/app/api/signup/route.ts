import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { signUpSchema } from "@/schemas/signUpSchema";
import { NextRequest, NextResponse as res } from "next/server";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsedUser = signUpSchema.safeParse(body);
        if (!parsedUser.success) {
            return res.json(
                {
                    success: false,
                    message: "Bad request, invalid input/s.",
                    error: parsedUser.error,
                },
                {
                    status: 400,
                }
            );
        }

        await dbConnect();
        const newUser = parsedUser.data;
        const existingUserWithUsername = await UserModel.findOne({
            username: newUser.username,
        });
        if (existingUserWithUsername) {
            if (
                existingUserWithUsername.isVerified ||
                existingUserWithUsername.verifyCodeExpiry.getTime() > Date.now()
            ) {
                return res.json(
                    {
                        success: false,
                        message: "username already exist.",
                    },
                    {
                        status: 400,
                    }
                );
            } else {
                await UserModel.deleteOne({
                    username: existingUserWithUsername.username,
                });
            }
        }

        const existingUserWithEmail = await UserModel.findOne({
            email: newUser.email,
        });
        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(
            newUser.password,
            Number(process.env.SALT_ROUNDS) || 10
        );

        if (existingUserWithEmail) {
            if (existingUserWithEmail.isVerified) {
                return res.json(
                    {
                        success: false,
                        message: "user already exist with this email.",
                    },
                    {
                        status: 400,
                    }
                );
            } else {
                existingUserWithEmail.username = newUser.username;
                existingUserWithEmail.password = hashedPassword;
                existingUserWithEmail.verifyCode = verifyCode;
                existingUserWithEmail.verifyCodeExpiry = new Date(
                    Date.now() + 1000 * 60 * 5
                );
                await existingUserWithEmail.save();
            }
        } else {
            const createdUser = await UserModel.create({
                username: newUser.username,
                email: newUser.email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: new Date(Date.now() + 1000 * 60 * 5),
                isVerified: false,
                isAcceptingMessage: true,
                messages: [],
            });
        }

        const emailResponse = await sendVerificationEmail(
            newUser.email,
            newUser.username,
            verifyCode
        );
        if (!emailResponse.success) {
            return res.json(
                {
                    success: false,
                    message: emailResponse.message,
                },
                {
                    status: 500,
                }
            );
        }

        return res.json(
            {
                success: true,
                message:
                    "user registered successfully, please verify your account.",
            },
            {
                status: 201,
            }
        );
    } catch (err) {
        return res.json(
            {
                success: false,
                message: "server error while creating user.",
                error: err instanceof Error ? err.message : "Unknown error",
            },
            {
                status: 500,
            }
        );
    }
}
