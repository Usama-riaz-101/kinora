import { generateText } from "ai";
import { NextResponse } from "next/server";
import { framePrompt, styleById, IMAGE_MODEL } from "@/lib/drama";
import { bytesToDataUrl, jsonError, publicModelError } from "@/lib/http";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: {
    style?: string;
    cast?: string;
    imagePrompt?: string;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("Send a JSON body.", 400);
  }

  const style = styleById(body.style ?? "");
  const cast = body.cast?.trim() ?? "";
  const imagePrompt = body.imagePrompt?.trim() ?? "";

  if (!style || !cast || !imagePrompt) {
    return jsonError("A frame needs a style, a cast, and a shot.", 400);
  }

  try {
    const result = await generateText({
      model: IMAGE_MODEL,
      prompt: framePrompt({
        styleLabel: `${style.label}. ${style.hint}`,
        cast,
        imagePrompt,
      }),
    });

    const image = result.files.find((file) => file.mediaType?.startsWith("image/"));
    if (!image) {
      return jsonError("No frame came back. Try this shot again.", 502);
    }

    return NextResponse.json({
      dataUrl: bytesToDataUrl(image.mediaType || "image/png", image.uint8Array),
    });
  } catch (error) {
    return jsonError(publicModelError(error), 502);
  }
}
