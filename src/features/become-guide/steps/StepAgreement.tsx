import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationDraft } from "../types";
import { StepNav } from "../BecomeGuideWizard";
import { toast } from "sonner";

type Props = {
  draft: ApplicationDraft;
  onSubmit: (patch: Partial<ApplicationDraft>) => Promise<void>;
  onBack: () => void;
  saving?: boolean;
};

export const StepAgreement = ({ draft, onSubmit, onBack, saving }: Props) => {
  const [terms, setTerms] = useState(!!draft.terms_accepted);
  const [privacy, setPrivacy] = useState(!!draft.privacy_accepted);
  const [motivation, setMotivation] = useState(draft.motivation ?? "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms || !privacy) return toast.error("Please accept the terms to continue");
    if (motivation.trim().length < 30) return toast.error("Tell us a bit more about your motivation (30+ chars)");
    await onSubmit({ terms_accepted: true, privacy_accepted: true, motivation });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-sm text-muted-foreground">Almost there 🎉 Tell us why you want to join EtnaGo and accept the terms.</p>

      <div className="space-y-2">
        <Label>Why do you want to be an EtnaGo guide? ({motivation.length}/600)</Label>
        <Textarea value={motivation} onChange={(e) => setMotivation(e.target.value.slice(0, 600))} rows={5} required />
      </div>

      <label className="flex gap-3 items-start text-sm cursor-pointer">
        <Checkbox checked={terms} onCheckedChange={(v) => setTerms(!!v)} className="mt-0.5" />
        <span>I accept the EtnaGo <a href="#" className="text-primary hover:underline">Guide Terms of Service</a> and the 15% platform commission.</span>
      </label>

      <label className="flex gap-3 items-start text-sm cursor-pointer">
        <Checkbox checked={privacy} onCheckedChange={(v) => setPrivacy(!!v)} className="mt-0.5" />
        <span>I have read and accept the <a href="#" className="text-primary hover:underline">Privacy Policy</a>.</span>
      </label>

      <StepNav onBack={onBack} canBack submitLabel="Submit application" saving={saving} />
    </form>
  );
};
