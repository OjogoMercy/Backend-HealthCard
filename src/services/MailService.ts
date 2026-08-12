import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (toEmail: string, otpCode: string) => {
  const { data, error } = await resend.emails.send({
    from: "Ojiva <onboarding@resend.dev>", 
    to: [toEmail],
    subject: "Your Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Verification Code</h2>
        <p>Please use the following 6-digit code to complete your request:</p>
        <h1 style="color: #2E7D32; letter-spacing: 4px; font-size: 32px;">${otpCode}</h1>
        <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  return data;
};