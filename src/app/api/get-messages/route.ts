import { getServerSession } from "next-auth";
import { NextRequest, NextResponse as res } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/models/user.model";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return res.json(
                {
                    success: false,
                    message: "unauthorized, invalid session.",
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
                    message: "unauthorized, user data is missing in session.",
                },
                {
                    status: 401,
                }
            );
        }

        const userId = new mongoose.Types.ObjectId(session.user._id);
        const usersWithMessages = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: "$messages" },
            { $sort: { "messages.createdAt": -1 } },
            { $group: { _id: "$_id", messages: { $push: "$messages" } } },
        ]).exec();

        if (!usersWithMessages || usersWithMessages.length === 0) {
            return res.json(
                {
                    success: false,
                    message: "user with all the messages not found.",
                },
                {
                    status: 404,
                }
            );
        }

        return res.json({
            success: true,
            messages: usersWithMessages[0].messages,
        });
    } catch (err) {
        return res.json(
            {
                success: false,
                message: "server error while getting the message list.",
                error: err instanceof Error ? err.message : "unknown error",
            },
            {
                status: 500,
            }
        );
    }
}
