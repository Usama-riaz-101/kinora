import type { Metadata } from "next";
import { Studio } from "@/components/studio";

export const metadata: Metadata = {
  title: "Studio",
  description: "Write a vertical short drama, render each frame, then shoot the clip.",
};

export default function StudioPage() {
  return <Studio />;
}
