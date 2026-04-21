import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApplicationDraft } from "../types";
import { StepNav } from "../BecomeGuideWizard";
import { toast } from "sonner";

const schema = z.object({
  first_name: z.string().trim().min(2).max(60),
  last_name: z.string().trim().min(2).max(60),
  date_of_birth: z.string().min(1),
  nationality: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(80),
});

type Props = {
  draft: ApplicationDraft;
  onNext: (patch: Partial<ApplicationDraft>) => Promise<void>;
  saving?: boolean;
};

export const StepPersonal = ({ draft, onNext, saving }: Props) => {
  const [d, setD] = useState({
    first_name: draft.first_name ?? "",
    last_name: draft.last_name ?? "",
    date_of_birth: draft.date_of_birth ?? "",
    nationality: draft.nationality ?? "",
    city: draft.city ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(d);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    await onNext(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">Tell us who you are. This stays private.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First name</Label>
          <Input value={d.first_name} onChange={(e) => setD({ ...d, first_name: e.target.value })} required maxLength={60} />
        </div>
        <div className="space-y-2">
          <Label>Last name</Label>
          <Input value={d.last_name} onChange={(e) => setD({ ...d, last_name: e.target.value })} required maxLength={60} />
        </div>
        <div className="space-y-2">
          <Label>Date of birth</Label>
          <Input type="date" value={d.date_of_birth} onChange={(e) => setD({ ...d, date_of_birth: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Nationality</Label>
          <Input value={d.nationality} onChange={(e) => setD({ ...d, nationality: e.target.value })} required maxLength={60} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>City</Label>
          <Input value={d.city} onChange={(e) => setD({ ...d, city: e.target.value })} required maxLength={80} placeholder="e.g. Catania" />
        </div>
      </div>
      <StepNav saving={saving} />
    </form>
  );
};
