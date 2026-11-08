import { experimental_generateVideo as generateVideo } from "ai";
import { NextResponse } from "next/server";
import { motionPrompt, VIDEO_MODEL } from "@/lib/drama";
import { bytesToDataUrl, jsonError, publicModelError } from "@/lib/http";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: {
    frameUrl?: string;
    motion?: string;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("Send a JSON body.", 400);
  }

  const frameUrl = body.frameUrl ?? "";
  const motion = body.motion?.trim() ?? "";

  if (!frameUrl.startsWith("data:image/") || frameUrl.length > 4_000_000) {
    return jsonError("Shoot from a rendered frame.", 400);
  }

  if (!motion) {
    return jsonError("This scene has no motion.", 400);
  }

  try {
    const result = await generateVideo({
      model: VIDEO_MODEL,
      prompt: {
        image: frameUrl,
        text: motionPrompt(motion),
      },
      aspectRatio: "9:16",
      duration: 4,
      generateAudio: true,
      abortSignal: AbortSignal.timeout(55_000),
    });

    const mediaType = result.video.mediaType || "video/mp4";
    return NextResponse.json({
      dataUrl: bytesToDataUrl(mediaType, result.video.uint8Array),
    });
  } catch (error) {
    return jsonError(publicModelError(error), 502);
  }
}
