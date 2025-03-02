import { type NextRequest, NextResponse } from "next/server"
import { open } from "sqlite"
import sqlite3 from "sqlite3"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone number and verification code are required" }, { status: 400 })
    }

    const db = await open({
      filename: path.join(process.cwd(), "database.sqlite"),
      driver: sqlite3.Database,
    })

    // Get the verification code from the database
    const verificationRecord = await db.get(
      `
      SELECT * FROM verification_codes 
      WHERE phone = ? AND code = ? AND used = 0 AND expires_at > CURRENT_TIMESTAMP
    `,
      [phone, code],
    )

    if (!verificationRecord) {
      await db.close()
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Mark the verification code as used
    await db.run(
      `
      UPDATE verification_codes
      SET used = 1
      WHERE id = ?
    `,
      [verificationRecord.id],
    )

    // Update the user's phone number
    // In a real app, you'd update the specific user based on their ID from the session
    await db.run(
      `
      UPDATE profiles
      SET phone = ?
      WHERE id = 1
    `,
      [phone],
    )

    await db.close()

    return NextResponse.json({
      success: true,
      message: "Phone number verified and updated successfully",
    })
  } catch (error) {
    console.error("Error verifying code:", error)
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 })
  }
}

