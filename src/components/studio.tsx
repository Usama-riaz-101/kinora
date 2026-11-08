"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { styles, type SceneDraft, type Screenplay, type StyleId } from "@/lib/drama";

type Mode = "idea" | "script";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(data.error || "That step failed.");
  }
  return data as T;
}

export function Studio() {
  const [idea, setIdea] = useState("");
  const [notes, setNotes] = useState("");
  const [style, setStyle] = useState<StyleId>("cinematic");
  const [mode, setMode] = useState<Mode>("idea");
  const [screenplay, setScreenplay] = useState<Screenplay | null>(null);
  const [scenes, setScenes] = useState<SceneDraft[]>([]);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState<"script" | "frame" | "clip" | null>(null);
  const [error, setError] = useState("");

  const scene = scenes[active];
  const cast = useMemo(
    () =>
      screenplay?.characters.map((person) => `${person.name}: ${person.look}`).join("\n") ??
      "",
    [screenplay],
  );

  function resetEpisode() {
    setScreenplay(null);
    setScenes([]);
    setActive(0);
    setError("");
  }

  async function writeEpisode() {
    setBusy("script");
    setError("");
    try {
      const next = await postJson<Screenplay>("/api/screenplay", {
        idea,
        notes,
        style,
        mode,
      });
      setScreenplay(next);
      setScenes(next.scenes);
      setActive(0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The screenplay failed.");
    } finally {
      setBusy(null);
    }
  }

  async function renderFrame() {
    if (!scene || !screenplay) return;
    setBusy("frame");
    setError("");
    try {
      const result = await postJson<{ dataUrl: string }>("/api/frame", {
        style,
        cast,
        imagePrompt: scene.imagePrompt,
      });
      setScenes((current) =>
        current.map((item, index) =>
          index === active ? { ...item, frameUrl: result.dataUrl, clipUrl: undefined } : item,
        ),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The frame failed.");
    } finally {
      setBusy(null);
    }
  }

  async function shootClip() {
    if (!scene?.frameUrl) return;
    setBusy("clip");
    setError("");
    try {
      const result = await postJson<{ dataUrl: string }>("/api/clip", {
        frameUrl: scene.frameUrl,
        motion: scene.motionPrompt,
      });
      setScenes((current) =>
        current.map((item, index) =>
          index === active ? { ...item, clipUrl: result.dataUrl } : item,
        ),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The clip failed.");
    } finally {
      setBusy(null);
    }
  }

  const actionLabel = busy
    ? "Working"
    : screenplay
      ? scene?.frameUrl
        ? "Shoot this clip"
        : "Render this frame"
      : mode === "script"
        ? "Break up the script"
        : "Write the episode";

  function onPrimaryAction() {
    if (!screenplay) {
      void writeEpisode();
      return;
    }
    if (!scene?.frameUrl) {
      void renderFrame();
      return;
    }
    void shootClip();
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-36">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background/90 py-4 backdrop-blur">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          Kinora
        </Link>
        <button
          type="button"
          onClick={resetEpisode}
          className="h-11 rounded-full px-3 text-sm font-semibold text-muted"
        >
          New episode
        </button>
      </header>

      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <div className="grid grid-cols-2 rounded-2xl border border-line bg-card p-1">
            {(
              [
                ["idea", "From an idea"],
                ["script", "From a script"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
                className={`h-11 rounded-xl text-sm font-semibold ${
                  mode === value ? "bg-foreground text-background" : "text-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold">
              {mode === "script" ? "Script" : "Idea"}
            </span>
            <textarea
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              rows={6}
              placeholder={
                mode === "script"
                  ? "Paste the scene. Names, place, and the last line."
                  : "Two strangers keep meeting on the last bus."
              }
              className="min-h-36 w-full resize-none rounded-2xl border border-line bg-card px-4 py-3 text-base leading-6"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Notes</span>
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Tone, city, or a line that has to stay"
              className="h-12 w-full rounded-2xl border border-line bg-card px-4 text-base"
            />
          </label>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Look</p>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
              {styles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={style === item.id}
                  onClick={() => setStyle(item.id)}
                  className={`h-11 shrink-0 rounded-full px-4 text-sm font-semibold ${
                    style === item.id
                      ? "bg-accent text-accent-foreground"
                      : "border border-line bg-card"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {screenplay ? (
          <section className="flex flex-col gap-4">
            <div>
              <h1 className="font-serif text-4xl leading-none tracking-tight">
                {screenplay.title}
              </h1>
              <p className="mt-2 leading-6 text-muted">{screenplay.logline}</p>
            </div>

            <ul className="flex gap-2 overflow-x-auto">
              {screenplay.characters.map((person) => (
                <li
                  key={person.name}
                  className="w-48 shrink-0 rounded-2xl border border-line bg-card p-3"
                >
                  <p className="font-semibold">{person.name}</p>
                  <p className="text-sm text-accent">{person.role}</p>
                  <p className="mt-1 text-sm leading-5 text-muted">{person.look}</p>
                </li>
              ))}
            </ul>

            <div className="overflow-hidden rounded-[1.5rem] border border-line bg-[#1c1915]">
              {scene?.clipUrl ? (
                <video
                  key={scene.clipUrl}
                  src={scene.clipUrl}
                  controls
                  playsInline
                  className="aspect-[9/16] w-full bg-black object-contain"
                />
              ) : scene?.frameUrl ? (
                // Data URLs from this session's generation. next/image does not accept them.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={scene.frameUrl}
                  alt={scene.slug}
                  className="aspect-[9/16] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[9/16] flex-col justify-end p-5 text-[#f6f0e6]">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#d8c7ae]">
                    Shot {active + 1}
                  </p>
                  <p className="mt-2 font-serif text-3xl leading-tight">{scene?.slug}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {scenes.map((item, index) => (
                <button
                  key={`${item.slug}-${index}`}
                  type="button"
                  aria-pressed={index === active}
                  onClick={() => setActive(index)}
                  className={`h-11 shrink-0 rounded-full px-4 text-sm font-semibold ${
                    index === active ? "bg-foreground text-background" : "border border-line bg-card"
                  }`}
                >
                  {index + 1}. {item.slug}
                </button>
              ))}
            </div>

            {scene ? (
              <article className="rounded-2xl border border-line bg-card p-4">
                <h2 className="text-lg font-semibold">{scene.slug}</h2>
                <p className="mt-2 leading-6">{scene.action}</p>
                {scene.dialogue ? (
                  <p className="mt-3 font-serif text-xl leading-7">“{scene.dialogue}”</p>
                ) : null}
              </article>
            ) : null}

            <p className="text-sm leading-6 text-muted">
              Frames and clips stay in this tab. A refresh starts a new episode, so shoot the shot you want before you leave.
            </p>
          </section>
        ) : null}

        {error ? (
          <p role="alert" className="rounded-2xl bg-[#fde8ea] px-4 py-3 text-sm leading-6 text-danger">
            {error}
          </p>
        ) : null}
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-line bg-background/95 px-4 pt-3 backdrop-blur">
        <div className="mx-auto w-full max-w-lg">
          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={busy !== null || idea.trim().length < 12 || (Boolean(scene?.clipUrl) && Boolean(screenplay))}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-accent text-base font-semibold text-accent-foreground disabled:opacity-50"
          >
            {scene?.clipUrl && screenplay ? "Clip ready" : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
