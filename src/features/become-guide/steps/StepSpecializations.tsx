import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ApplicationDraft, CATEGORIES } from "../types";
import { StepNav } from "../BecomeGuideWizard";
import { toast } from "sonner";

type Props = {
  draft: ApplicationDraft;
  onNext: (patch: Partial<ApplicationDraft>) => Promise<void>;
  onBack: () => void;
  saving?: boolean;
};

export const StepSpecializations = ({ draft, onNext, onBack, saving }: Props) => {
  const [specs, setSpecs] = useState<string[]>(draft.specializations ?? []);
  const [areasInput, setAreasInput] = useState((draft.areas_covered ?? []).join(", "));

  const toggle = (c: string) => setSpecs(specs.includes(c) ? specs.filter((x) => x !== c) : [...specs, c]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (specs.length === 0) return toast.error("Select at least one specialization");
    const areas = areasInput.split(",").map((a) => a.trim()).filter(Boolean);
    if (areas.length === 0) return toast.error("Add at least one area");
    await onNext({ specializations: specs, areas_covered: areas });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">What kind of experiences do you offer, and where?</p>

      <div>
        <Label className="mb-2 block">Specializations</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-accent text-sm capitalize">
              <Checkbox checked={specs.includes(c)} onCheckedChange={() => toggle(c)} />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Areas you cover (comma-separated)</Label>
        <Input value={areasInput} onChange={(e) => setAreasInput(e.target.value)} placeholder="Etna summit, Catania, Taormina, Valle del Bove" />
      </div>

      <StepNav onBack={onBack} canBack saving={saving} />
    </form>
  );
};
