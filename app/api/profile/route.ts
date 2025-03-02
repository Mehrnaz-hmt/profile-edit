import { type NextRequest, NextResponse } from "next/server"
import { open } from "sqlite"
import sqlite3 from "sqlite3"
import path from "path"

// Initialize database connection
async function getDb() {
  return open({
    filename: path.join(process.cwd(), "database.sqlite"),
    driver: sqlite3.Database,
  })
}

// Get user profile (in a real app, you'd get the user ID from the session)
export async function GET() {
  try {
    const db = await getDb()

    // Create table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        family TEXT NOT NULL,
        displayName TEXT,
        displayFamily TEXT,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        profilePicture TEXT
      )
    `)

    // Check if we have any profiles
    let user = await db.get("SELECT * FROM profiles LIMIT 1")

    if (!user) {
      // Create a sample user if none exists
      await db.run(
        `
        INSERT INTO profiles (name, family, displayName, displayFamily, email, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        ["John", "Doe", "Johnny", "D", "john.doe@example.com", "+1 (555) 123-4567"],
      )

      user = await db.get("SELECT * FROM profiles LIMIT 1")
    }

    await db.close()

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, family, displayName, displayFamily, email, phone, profilePicture } = data

    const db = await getDb()

    // In a real app, you'd update the specific user based on their ID from the session
    // For demo purposes, we'll update the first user
    await db.run(
      `
      UPDATE profiles
      SET name = ?, family = ?, displayName = ?, displayFamily = ?, email = ?, phone = ?, profilePicture = ?
      WHERE id = 1
    `,
      [name, family, displayName, displayFamily, email, phone, profilePicture],
    )

    await db.close()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

