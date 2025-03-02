import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const imageId = params.id
    const imagePath = path.join(process.cwd(), "images", imageId)

    const imageBuffer = await readFile(imagePath)

    // Determine content type based on file extension
    const fileExtension = imageId.split(".").pop()?.toLowerCase()
    let contentType = "image/jpeg" // Default

    if (fileExtension === "png") contentType = "image/png"
    else if (fileExtension === "gif") contentType = "image/gif"
    else if (fileExtension === "webp") contentType = "image/webp"

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving image:", error)
    return NextResponse.json({ error: "Image not found" }, { status: 404 })
  }
}

