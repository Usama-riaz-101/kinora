import Link from "next/link";
import { styles } from "@/lib/drama";

const steps = [
  {
    n: "01",
    title: "Write the episode",
    copy: "A sentence, or a script you already have. Kinora breaks it into three or four shots.",
  },
  {
    n: "02",
    title: "Lock the frame",
    copy: "Each shot gets a vertical still with the same faces and wardrobe.",
  },
  {
    n: "03",
    title: "Shoot the clip",
    copy: "A four-second clip with sound, ready to play on a phone.",
  },
];

const prices = [
  { name: "Pilot", price: "$19", detail: "1 episode · script, frames, and clips" },
  { name: "Studio", price: "$49", detail: "4 episodes for a weekly channel" },
  { name: "Desk", price: "$149", detail: "15 episodes for a small slate" },
];

export default function Home() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background/90 py-4 backdrop-blur">
        <p className="font-serif text-2xl tracking-tight">Kinora</p>
        <Link
          href="/studio"
          className="inline-flex h-11 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground"
        >
          Open studio
        </Link>
      </header>

      <main className="flex flex-col gap-12 pt-4">
        <section className="flex flex-col gap-5">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
            Short drama studio
          </p>
          <h1 className="font-serif text-[2.6rem] leading-[1.05] tracking-tight">
            One sentence. A finished vertical episode.
          </h1>
          <p className="text-lg leading-7 text-muted">
            Write on your phone. Kinora returns a screenplay, a still for every shot, and a clip you can play in place.
          </p>
          <Link
            href="/studio"
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-foreground text-base font-semibold text-background"
          >
            Start an episode
          </Link>
        </section>

        <section
          aria-label="Sample scene"
          className="overflow-hidden rounded-[1.75rem] border border-line bg-card"
        >
          <div className="flex aspect-[9/12] flex-col justify-between bg-[#221c16] p-5 text-[#f6f0e6]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#d8c7ae]">Scene 02</p>
            <div className="flex flex-col gap-3">
              <p className="font-serif text-3xl leading-tight">Night bus, last row</p>
              <p className="max-w-[16rem] text-base leading-6 text-[#eadfce]">
                She keeps the seat. He finally sits down.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-4 text-sm">
            <span>9:16 · 4 seconds · sound on</span>
            <span className="text-muted">Sample</span>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-3xl">How an episode is made</h2>
          <ol className="flex flex-col gap-3">
            {steps.map((step) => (
              <li key={step.n} className="rounded-2xl border border-line bg-card p-4">
                <p className="text-xs font-semibold tracking-[0.14em] text-accent">{step.n}</p>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 leading-6 text-muted">{step.copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-3xl">Looks</h2>
          <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
            {styles.map((style) => (
              <li
                key={style.id}
                className="w-44 shrink-0 snap-start rounded-2xl border border-line bg-card p-4"
              >
                <p className="font-semibold">{style.label}</p>
                <p className="mt-1 text-sm leading-5 text-muted">{style.hint}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-3xl">For a channel, not a demo</h2>
          <ul className="flex flex-col gap-3">
            {prices.map((plan) => (
              <li
                key={plan.name}
                className="flex items-end justify-between gap-4 rounded-2xl border border-line bg-card p-4"
              >
                <div>
                  <p className="font-semibold">{plan.name}</p>
                  <p className="mt-1 text-sm leading-5 text-muted">{plan.detail}</p>
                </div>
                <p className="font-serif text-3xl">{plan.price}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-6 text-muted">
            These are the prices the studio is built to charge. Stripe checkout connects after this project is linked on Vercel. Generation runs on your AI Gateway key until then.
          </p>
        </section>
      </main>

      <footer className="mt-12 border-t border-line py-6 text-sm text-muted">
        Kinora by Usama Riaz
      </footer>
    </div>
  );
}
