import { type NextRequest, NextResponse } from "next/server"
import { open } from "sqlite"
import sqlite3 from "sqlite3"
import path from "path"

// Mock storage for phone numbers (Replace with database in real apps)
const phoneNumbers: { phone: string; otp: string }[] = []

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone || phone.length !== 11) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
    }

    // Generate a random 6-digit OTP
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Store phone number & OTP (for demonstration)
    phoneNumbers.push({ phone, otp: verificationCode })

    console.log(`✅ OTP ${verificationCode} sent to ${phone}`)

    // Open SQLite database
    const db = await open({
      filename: path.join(process.cwd(), "database.sqlite"),
      driver: sqlite3.Database,
    })

    // Ensure verification_codes table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT NOT NULL,
        code TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        used BOOLEAN DEFAULT 0
      )
    `)

    // Remove any previous OTP for this phone
    await db.run("DELETE FROM verification_codes WHERE phone = ?", [phone])

    // Set expiration time to 10 minutes from now
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    // Insert new OTP into the database
    await db.run(
      `INSERT INTO verification_codes (phone, code, expires_at) VALUES (?, ?, ?)`,
      [phone, verificationCode, expiresAt.toISOString()]
    )

    await db.close()

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Verification code sent",
    })
  } catch (error) {
    console.error("❌ Error sending verification code:", error)
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 })
  }
}
