import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApplicationDraft, LANGUAGE_OPTIONS, LEVELS } from "../types";
import { StepNav } from "../BecomeGuideWizard";
import { toast } from "sonner";

type Lang = { code: string; level: string };
type Props = {
  draft: ApplicationDraft;
  onNext: (patch: Partial<ApplicationDraft>) => Promise<void>;
  onBack: () => void;
  saving?: boolean;
};

export const StepLanguages = ({ draft, onNext, onBack, saving }: Props) => {
  const [langs, setLangs] = useState<Lang[]>(draft.languages ?? []);
  const [code, setCode] = useState("");
  const [level, setLevel] = useState("fluent");

  const add = () => {
    if (!code) return;
    if (langs.some((l) => l.code === code)) return toast.error("Already added");
    setLangs([...langs, { code, level }]);
    setCode("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (langs.length === 0) return toast.error("Add at least one language");
    await onNext({ languages: langs });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">Which languages can you guide tours in?</p>

      <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={code} onValueChange={setCode}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((l) => (
                <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={add} variant="secondary"><Plus className="size-4" /> Add</Button>
      </div>

      <ul className="space-y-2">
        {langs.map((l) => {
          const meta = LANGUAGE_OPTIONS.find((x) => x.code === l.code);
          return (
            <li key={l.code} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span><strong>{meta?.name ?? l.code}</strong> · <span className="text-muted-foreground">{l.level}</span></span>
              <button type="button" onClick={() => setLangs(langs.filter((x) => x.code !== l.code))} className="text-muted-foreground hover:text-destructive">
                <X className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>

      <StepNav onBack={onBack} canBack saving={saving} />
    </form>
  );
};
