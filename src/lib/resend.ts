import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

//sendVerificationEmail function in the helper function has the logic
// about how to send the verification email to the user.

//further, content of the email will be wrapped as a React Element
// which will be passed as one of the various 'react' argument to the resend.emails.send function
