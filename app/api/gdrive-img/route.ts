import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/gdrive-img?id=FILE_ID
 *
 * Server-side proxy for Google Drive images.
 * Fetches the file from Drive and streams it back to the browser
 * under the app's own origin — no CORS, no CSP, no auth-cookie issues.
 *
 * The Drive file must be shared as "Anyone with the link can view".
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")
  if (!id || !/^[\w-]+$/.test(id)) {
    return new NextResponse("Missing or invalid id", { status: 400 })
  }

  // Try the direct view URL first; Google will follow to the actual bytes
  const driveUrl = `https://drive.google.com/uc?export=view&id=${id}`

  try {
    const upstream = await fetch(driveUrl, {
      headers: {
        // Mimic a real browser so Drive doesn't serve the HTML warning page
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      redirect: "follow",
    })

    if (!upstream.ok) {
      return new NextResponse("Could not fetch image from Drive", {
        status: upstream.status,
      })
    }

    const contentType =
      upstream.headers.get("content-type") ?? "image/jpeg"

    // If Drive returned HTML (virus-scan warning page), bail out
    if (contentType.includes("text/html")) {
      return new NextResponse("Drive returned an HTML page — check sharing settings", {
        status: 502,
      })
    }

    const body = await upstream.arrayBuffer()

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache for 24 h at the CDN / browser level
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    })
  } catch (err) {
    console.error("[gdrive-img] fetch error:", err)
    return new NextResponse("Proxy error", { status: 502 })
  }
}
