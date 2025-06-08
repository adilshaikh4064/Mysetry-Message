import { getServerSession } from "next-auth";
import { NextRequest, NextResponse as res } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return res.json(
                {
                    success: false,
                    message: "not authenticated. please sign in.",
                },
                {
                    status: 401,
                }
            );
        }
        if (!session.user) {
            return res.json(
                {
                    success: false,
                    message: "not allowed. user is missing in session.",
                },
                {
                    status: 401,
                }
            );
        }

        const user = session.user;
        const userId = user._id;
        const { acceptMessages } = await req.json();

        await dbConnect();
        const updatedUser = await UserModel.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(userId),
            },
            { isAcceptingMessage: acceptMessages },
            { new: true }
        );
        if (!updatedUser) {
            return res.json(
                {
                    success: false,
                    message:
                        "user is missing to update the message accepting status.",
                },
                {
                    status: 404,
                }
            );
        }

        return res.json(
            {
                success: true,
                message: "message acceptance successfully updated.",
            },
            {
                status: 200,
            }
        );
    } catch (err) {
        return res.json(
            {
                success: false,
                message:
                    "server error while toggling message acceptance status.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return res.json(
                {
                    success: false,
                    message: "unauthorised, invalid session.",
                },
                {
                    status: 401,
                }
            );
        }
        if (!session.user) {
            return res.json(
                {
                    success: false,
                    message: "unauthorised, user data is missing in session.",
                },
                {
                    status: 401,
                }
            );
        }

        const user = session.user;
        await dbConnect();
        const isUserExit = await UserModel.findOne({
            _id: new mongoose.Types.ObjectId(user._id),
        });
        if (!isUserExit) {
            return res.json(
                {
                    success: false,
                    message: "user detail is missing in the database.",
                },
                {
                    status: 404,
                }
            );
        }

        return res.json(
            {
                success: true,
                isAcceptingMessages: isUserExit.isAcceptingMessage,
            },
            {
                status: 200,
            }
        );
    } catch (err) {
        return res.json({
            success: false,
            message:
                "server error while getting the message acceptance status.",
        });
    }
}
