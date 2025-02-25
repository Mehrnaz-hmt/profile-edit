"use client"

export async function getVerificationCode(): Promise<string> {
  // Generate or fetch a 4-digit code from your server
  const code = Math.floor(1000 + Math.random() * 9000).toString()
  console.log(code)
  return code
}


