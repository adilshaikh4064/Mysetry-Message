import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { userNameValidation } from "@/schemas/signUpSchema";
import { NextRequest, NextResponse as res } from "next/server";
import { z } from "zod";

const usernameQuerySchema = z.object({
    username: userNameValidation,
});

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const searchParams = req.nextUrl.searchParams;

        if (!searchParams.has("username")) {
            return res.json(
                {
                    success: false,
                    message: "username is missing in params.",
                },
                {
                    status: 400,
                }
            );
        }
        const queryParams = {
            username: searchParams.get("username"),
        };

        const isUsernameValid = usernameQuerySchema.safeParse(queryParams);
        if (!isUsernameValid.success) {
            const usernameErrors =
                isUsernameValid.error.format().username?._errors || [];
            return res.json(
                {
                    success: false,
                    message:
                        usernameErrors.length > 0
                            ? usernameErrors.join(",")
                            : "invalid query params.",
                },
                {
                    status: 400,
                }
            );
        }

        const { username } = isUsernameValid.data;
        const isUserExist = await UserModel.findOne({
            $or: [
                {
                    username,
                    isVerified: true,
                },
                {
                    username,
                    isVerified: false,
                    $expr: {
                        $gt: ["$verifyCodeExpiry", new Date()],
                    },
                },
            ],
        });
        if (isUserExist) {
            return res.json(
                {
                    success: false,
                    message: "username already taken.",
                },
                {
                    status: 200,
                }
            );
        }

        return res.json(
            {
                success: true,
                message: "username is available.",
            },
            {
                status: 200,
            }
        );
    } catch (err) {
        return res.json(
            {
                success: false,
                message: "error checking username",
            },
            {
                status: 500,
            }
        );
    }
}
