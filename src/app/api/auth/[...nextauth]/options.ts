import dbConnect from "@/lib/dbConnect";
import UserModel, { IUser } from "@/models/user.model";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials-provider",
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "defaultuser@gmail.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req): Promise<any> {
                if (!credentials) {
                    // return null;
                    throw new Error("credentials are note provided.");
                }
                try {
                    await dbConnect();
                    const existingUser = await UserModel.findOne({
                        $or: [{ email: credentials.email }],
                    });
                    if (!existingUser) {
                        // return null;
                        throw new Error("user does not exist in database.");
                    }
                    if (existingUser.isVerified) {
                        // return null;
                        throw new Error(
                            "please verify your account before log in."
                        );
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        existingUser.password
                    );
                    if (!isPasswordCorrect) {
                        // return null;
                        throw new Error("incorrect password.");
                    }

                    return {
                        _id: (
                            existingUser._id as mongoose.Types.ObjectId
                        ).toString(),
                        username: existingUser.username,
                        email: existingUser.email,
                        isAcceptingMessage: existingUser.isAcceptingMessage,
                        isVerified: existingUser.isVerified,
                    };
                } catch (err) {
                    const error =
                        err instanceof Error ? err.message : "Unknown error";
                    // return null;
                    throw new Error(error);
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            return true;
        },
        async redirect({ url, baseUrl }) {
            return baseUrl;
        },
        async jwt({ token, user, session }) {
            if (user) {
                token._id = user._id;
                token.email = user.email;
                token.username = user.username;
                token.isVerified = user.isVerified;
                token.isAcceptingMessage = user.isAcceptingMessage;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.email = token.email;
                session.user.username = token.username;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessage = token.isAcceptingMessage;
            }
            return session;
        },
    },
    pages: {},
};
