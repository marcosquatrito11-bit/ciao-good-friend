import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApplicationDraft } from "../types";
import { StepNav } from "../BecomeGuideWizard";
import { toast } from "sonner";

const schema = z.object({
  iban: z.string().trim().min(15).max(34),
  vat_number: z.string().trim().max(40).optional().or(z.literal("")),
});

type Props = {
  draft: ApplicationDraft;
  onNext: (patch: Partial<ApplicationDraft>) => Promise<void>;
  onBack: () => void;
  saving?: boolean;
};

export const StepPayments = ({ draft, onNext, onBack, saving }: Props) => {
  const [d, setD] = useState({ iban: draft.iban ?? "", vat_number: draft.vat_number ?? "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(d);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    await onNext({ iban: d.iban, vat_number: d.vat_number || null });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Where should we send your payouts? You'll connect your Stripe account after approval.
      </p>
      <div className="space-y-2">
        <Label>IBAN</Label>
        <Input value={d.iban} onChange={(e) => setD({ ...d, iban: e.target.value.toUpperCase() })} required maxLength={34} placeholder="IT60 X054 2811 1010 0000 0123 456" />
      </div>
      <div className="space-y-2">
        <Label>VAT / Partita IVA (optional)</Label>
        <Input value={d.vat_number} onChange={(e) => setD({ ...d, vat_number: e.target.value })} maxLength={40} placeholder="IT01234567890" />
      </div>
      <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
        🔒 Stripe Connect onboarding is sent to you by email after our team approves your application. Platform commission is currently 15%.
      </p>
      <StepNav onBack={onBack} canBack saving={saving} />
    </form>
  );
};
