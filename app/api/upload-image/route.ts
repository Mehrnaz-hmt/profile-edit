import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Generate a unique ID for the image
    const imageId = uuidv4()
    const fileExtension = image.name.split(".").pop()
    const fileName = `${imageId}.${fileExtension}`

    // Create images directory if it doesn't exist
    const imagesDir = path.join(process.cwd(), "images")
    await mkdir(imagesDir, { recursive: true })

    // Save the image to the images directory
    const buffer = Buffer.from(await image.arrayBuffer())
    await writeFile(path.join(imagesDir, fileName), buffer)

    return NextResponse.json({
      success: true,
      imageId: fileName,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}

