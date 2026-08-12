import { Resend } from "resend";

export const sendOtpEmail = async (toEmail: string, otpCode: string): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not defined in environment variables.");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev", // Default test domain
    to: [toEmail],
    subject: "Your OTP Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Verification Code</h2>
        <p>Please use the following 6-digit code to complete your request:</p>
        <h1 style="color: #4F46E5; letter-spacing: 4px; font-size: 32px;">${otpCode}</h1>
        <p>This code expires in 10 minutes. If you did not request this, please ignore this message.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};