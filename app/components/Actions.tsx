import { NextApiRequest, NextApiResponse } from "next";

// In-memory storage for phone numbers (Replace this with a database in real apps)
const phoneNumbers: { phone: string; otp: string }[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phoneNumber } = req.body;
  if (!phoneNumber || phoneNumber.length !== 11) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  // Generate a 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Store phone number & OTP
  phoneNumbers.push({ phone: phoneNumber, otp });

  console.log(`✅ OTP ${otp} sent to ${phoneNumber}`);

  return res.status(200).json({ otp });
}






// export async function getVerificationCode(): Promise<string> {
//   // Generate or fetch a 4-digit code from your server
//   const code = Math.floor(1000 + Math.random() * 9000).toString()
//   console.log(code)
//   return code
// }


