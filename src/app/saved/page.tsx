import type { Metadata } from "next";

import { SavedStories } from "./saved-stories";

export const metadata: Metadata = { title: "Saved · Tech News" };

export default function SavedPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold tracking-tight">Saved stories</h2>
      <SavedStories />
    </div>
  );
}
