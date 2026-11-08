import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function publicModelError(error: unknown) {
  const message = error instanceof Error ? error.message : "Generation failed.";
  console.error(message);

  if (/api key|unauthorized|forbidden|oidc|credentials/i.test(message)) {
    return "Add AI_GATEWAY_API_KEY on Vercel, then generate again.";
  }

  if (/too large|payload|body/i.test(message)) {
    return "That file is too large for this request. Render the frame again, then shoot a shorter clip.";
  }

  return "Generation failed. Try that step again.";
}

export function bytesToDataUrl(mediaType: string, bytes: Uint8Array) {
  const url = `data:${mediaType};base64,${Buffer.from(bytes).toString("base64")}`;
  if (url.length > 3_500_000) {
    throw new Error("Generated file is too large to return.");
  }
  return url;
}
