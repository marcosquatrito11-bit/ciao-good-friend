import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationDraft } from "../types";
import { StepNav } from "../BecomeGuideWizard";
import { toast } from "sonner";

const schema = z.object({
  headline: z.string().trim().min(8).max(120),
  bio_short: z.string().trim().min(20).max(280),
  bio_long: z.string().trim().min(80).max(2000),
  years_experience: z.coerce.number().int().min(0).max(60),
});

type Props = {
  draft: ApplicationDraft;
  onNext: (patch: Partial<ApplicationDraft>) => Promise<void>;
  onBack: () => void;
  saving?: boolean;
};

export const StepAbout = ({ draft, onNext, onBack, saving }: Props) => {
  const [d, setD] = useState({
    headline: draft.headline ?? "",
    bio_short: draft.bio_short ?? "",
    bio_long: draft.bio_long ?? "",
    years_experience: draft.years_experience?.toString() ?? "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(d);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    await onNext(parsed.data);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">Make tourists fall in love with you in three lines.</p>
      <div className="space-y-2">
        <Label>Tagline / headline</Label>
        <Input value={d.headline} onChange={(e) => setD({ ...d, headline: e.target.value })} required maxLength={120} placeholder="e.g. Volcanologist guide, summit specialist" />
      </div>
      <div className="space-y-2">
        <Label>Short bio ({d.bio_short.length}/280)</Label>
        <Textarea value={d.bio_short} onChange={(e) => setD({ ...d, bio_short: e.target.value.slice(0, 280) })} required rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Full bio ({d.bio_long.length}/2000)</Label>
        <Textarea value={d.bio_long} onChange={(e) => setD({ ...d, bio_long: e.target.value.slice(0, 2000) })} required rows={6} />
      </div>
      <div className="space-y-2 max-w-xs">
        <Label>Years of experience</Label>
        <Input type="number" min={0} max={60} value={d.years_experience} onChange={(e) => setD({ ...d, years_experience: e.target.value })} required />
      </div>
      <StepNav onBack={onBack} canBack saving={saving} />
    </form>
  );
};
