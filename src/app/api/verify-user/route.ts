import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { NextRequest, NextResponse as res } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const { username, code } = await req.json();

        const isUserExist = await UserModel.findOne({
            username,
        });
        if (!isUserExist) {
            return res.json(
                {
                    success: false,
                    message: "user does not exist.",
                },
                {
                    status: 400,
                }
            );
        }

        if (isUserExist.isVerified) {
            return res.json(
                {
                    success: false,
                    message:
                        "username already verified with another code. please check the expiry of the verification code.",
                },
                {
                    status: 400,
                }
            );
        }

        const isnotExpired =
            isUserExist.verifyCodeExpiry.getTime() > Date.now();
        const isCodeCorrect = isUserExist.verifyCode === code;

        if (isnotExpired && isCodeCorrect) {
            isUserExist.isVerified = true;
            await isUserExist.save();
            return res.json({
                success: true,
                messgae: "code verification successfull.",
            });
        } else if (!isCodeCorrect) {
            return res.json(
                {
                    success: false,
                    message: "invalid code.",
                },
                {
                    status: 400,
                }
            );
        } else {
            return res.json(
                {
                    success: false,
                    message:
                        "verification code is expired. please signup again to get the new code.",
                },
                {
                    status: 400,
                }
            );
        }
    } catch (err) {
        return res.json(
            {
                success: false,
                message: "error while verifying the code.",
            },
            {
                status: 500,
            }
        );
    }
}
