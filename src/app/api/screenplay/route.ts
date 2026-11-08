import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { screenplayPrompt, screenplaySchema, styleById, TEXT_MODEL } from "@/lib/drama";
import { jsonError, publicModelError } from "@/lib/http";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: {
    idea?: string;
    style?: string;
    notes?: string;
    mode?: string;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("Send a JSON body.", 400);
  }

  const idea = body.idea?.trim() ?? "";
  const notes = body.notes?.trim() ?? "";
  const style = styleById(body.style ?? "");
  const mode = body.mode === "script" ? "script" : "idea";

  if (idea.length < 12) {
    return jsonError("Write at least a sentence.", 400);
  }

  if (idea.length > 4000 || notes.length > 800) {
    return jsonError("That text is too long for one episode.", 400);
  }

  if (!style) {
    return jsonError("Pick a visual style.", 400);
  }

  try {
    const result = await generateText({
      model: TEXT_MODEL,
      output: Output.object({
        name: "Screenplay",
        description: "A 3 or 4 scene vertical micro-drama.",
        schema: screenplaySchema,
      }),
      prompt: screenplayPrompt({ idea, style, notes, mode }),
    });

    if (!result.output) {
      return jsonError("The screenplay came back empty. Try again.", 502);
    }

    return NextResponse.json(result.output);
  } catch (error) {
    return jsonError(publicModelError(error), 502);
  }
}
