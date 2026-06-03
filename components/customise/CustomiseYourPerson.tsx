"use client";
import { AvatarEditor } from "./AvatarEditor";
import { useJoinStore } from "@/store/joinStore";
import type { PersonAppearance } from "@/lib/types";

export function CustomiseYourPerson() {
  const s = useJoinStore();

  const value: PersonAppearance = {
    skinTone: s.skinTone,
    shirtColour: s.shirtColour,
    hairColour: s.hairColour,
    hairStyle: s.hairStyle,
    build: s.build,
    accessories: s.accessories,
    photoUrl: s.photoUrl || undefined,
    photoStatus: s.photoUrl ? "pending" : undefined,
    photoPlacement: s.photoPlacement,
    photoShape: s.photoShape,
  };

  return (
    <div className="space-y-6">
      <AvatarEditor
        value={value}
        number={s.assignedNumber}
        onChange={(patch) => {
          // photoUrl lives as a string in the store ("" = none)
          const next = { ...patch } as Record<string, unknown>;
          if ("photoUrl" in patch) next.photoUrl = patch.photoUrl ?? "";
          delete next.photoStatus;
          s.set(next as Partial<typeof s>);
        }}
      />

      <div>
        <div className="text-sm font-medium mb-2">Display name (optional)</div>
        <input
          value={s.displayName}
          maxLength={20}
          onChange={(e) => s.set({ displayName: e.target.value })}
          placeholder="Shown on your chain page"
          className="w-full max-w-sm h-11 px-3 rounded-xl border border-border bg-white focus:outline-none focus:border-accent transition-colors"
        />
        <div className="text-xs text-muted mt-1 tabular">{s.displayName.length}/20</div>
      </div>
    </div>
  );
}
