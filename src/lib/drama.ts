import { z } from "zod";

export const styles = [
  {
    id: "cinematic",
    label: "Cinematic",
    hint: "Anamorphic glass, motivated light",
  },
  {
    id: "realistic",
    label: "Realistic",
    hint: "Available light, handheld",
  },
  {
    id: "anime",
    label: "Anime",
    hint: "Clean line, expressive faces",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    hint: "Costume, weather, practical magic",
  },
  {
    id: "documentary",
    label: "Documentary",
    hint: "Observational, no glamour light",
  },
] as const;

export type StyleId = (typeof styles)[number]["id"];

export const screenplaySchema = z.object({
  title: z.string().min(1),
  logline: z.string().min(1),
  characters: z
    .array(
      z.object({
        name: z.string().min(1),
        role: z.string().min(1),
        look: z.string().min(1),
      }),
    )
    .min(1)
    .max(4),
  scenes: z
    .array(
      z.object({
        slug: z.string().min(1),
        action: z.string().min(1),
        dialogue: z.string(),
        imagePrompt: z.string().min(1),
        motionPrompt: z.string().min(1),
      }),
    )
    .min(3)
    .max(4),
});

export type Screenplay = z.infer<typeof screenplaySchema>;

export type SceneDraft = Screenplay["scenes"][number] & {
  frameUrl?: string;
  clipUrl?: string;
};

export const TEXT_MODEL = "google/gemini-3.8-flash";
export const IMAGE_MODEL = "google/gemini-3.1-flash-image";
export const VIDEO_MODEL = "google/veo-3.1-fast-generate-001";

export function styleById(id: string) {
  return styles.find((style) => style.id === id);
}

export function screenplayPrompt(input: {
  idea: string;
  style: (typeof styles)[number];
  notes: string;
  mode: "idea" | "script";
}) {
  const source =
    input.mode === "script"
      ? "The user pasted a script. Break that script into scenes. Keep their plot, names, and ending."
      : "The user wrote an idea. Invent the episode from that idea.";

  return `You are the showrunner for Kinora, a phone-first micro-drama studio.

${source}

Visual style: ${input.style.label}. ${input.style.hint}.

Shape:
- One episode, 3 or 4 scenes.
- Each scene is a single 4-second shot.
- A want, a turn, and a last button. No subplot.
- Dialogue is the spoken line only, or an empty string.
- Repeat each character's age, face, hair, and wardrobe inside every imagePrompt.
- imagePrompt describes one vertical still: place, light, lens, wardrobe. No captions.
- motionPrompt describes camera and action only. Do not add people who are not already in the still.

User notes: ${input.notes || "None."}

Source text:
${input.idea}`;
}

export function framePrompt(input: {
  styleLabel: string;
  cast: string;
  imagePrompt: string;
}) {
  return `Vertical 9:16 drama still. Style: ${input.styleLabel}.
Cast, keep these faces and clothes consistent:
${input.cast}

Frame: ${input.imagePrompt}

No captions, subtitles, logos, watermarks, or split screens.`;
}

export function motionPrompt(motion: string) {
  return `${motion}
Keep the same person, wardrobe, and room as the still. Natural performance. No captions, logos, or watermarks.`;
}
