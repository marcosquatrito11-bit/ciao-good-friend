import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApplicationDraft } from "../types";
import { StepNav } from "../BecomeGuideWizard";
import { toast } from "sonner";

const schema = z.object({
  phone: z.string().trim().min(6).max(30),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  emergency_contact: z.string().trim().min(3).max(120),
});

type Props = {
  draft: ApplicationDraft;
  onNext: (patch: Partial<ApplicationDraft>) => Promise<void>;
  onBack: () => void;
  saving?: boolean;
};

export const StepContact = ({ draft, onNext, onBack, saving }: Props) => {
  const [d, setD] = useState({
    phone: draft.phone ?? "",
    whatsapp: draft.whatsapp ?? "",
    emergency_contact: draft.emergency_contact ?? "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(d);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    await onNext({ phone: d.phone, whatsapp: d.whatsapp || null, emergency_contact: d.emergency_contact });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">How can tourists and our team reach you?</p>
      <div className="space-y-2">
        <Label>Phone number</Label>
        <Input value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value })} required placeholder="+39 ..." />
      </div>
      <div className="space-y-2">
        <Label>WhatsApp (optional)</Label>
        <Input value={d.whatsapp} onChange={(e) => setD({ ...d, whatsapp: e.target.value })} placeholder="+39 ..." />
      </div>
      <div className="space-y-2">
        <Label>Emergency contact (name + phone)</Label>
        <Input value={d.emergency_contact} onChange={(e) => setD({ ...d, emergency_contact: e.target.value })} required placeholder="Name + phone" />
      </div>
      <StepNav onBack={onBack} canBack saving={saving} />
    </form>
  );
};
