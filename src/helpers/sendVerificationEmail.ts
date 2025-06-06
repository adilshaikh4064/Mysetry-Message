import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/apiResponse";
import VerificationEmail from "../../emails/verificationEmail";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verfiyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: "noreply@mail.asxcode.com",
            to: email,
            subject: "Mysetry message verification code",
            react: VerificationEmail({ username, otp: verfiyCode }),
        });
        return {
            success: true,
            message: "Verification email sent successfully",
        };
    } catch (err) {
        console.error("error sending verification email.", err);
        return {
            success: false,
            message: "error while sending verification email.",
        };
    }
}
