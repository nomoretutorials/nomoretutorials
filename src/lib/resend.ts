import { Resend } from "resend";

import MagicLinkEmail from "../components/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export const magicLinkMail = async (email: string, magicLink: string) => {
  try {
    await resend.emails.send({
      from: "Verify <no-reply@mail.nomoretutorials.com>",
      to: email,
      subject: "Verify your account",
      react: MagicLinkEmail({ magicLink }),
    });
  } catch (error) {
    console.error("Failed to send magic link email:", error);
    throw new Error(
      `Failed to send magic link email to ${email}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
