import { useState } from "react";
import { Loader2, Upload, FileCheck2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ApplicationDraft } from "../types";
import { StepNav } from "../BecomeGuideWizard";
import { toast } from "sonner";

type Props = {
  draft: ApplicationDraft;
  onNext: (patch: Partial<ApplicationDraft>) => Promise<void>;
  onBack: () => void;
  saving?: boolean;
};

const MAX_BYTES = 10 * 1024 * 1024;

export const StepDocuments = ({ draft, onNext, onBack, saving }: Props) => {
  const { user } = useAuth();
  const [idDoc, setIdDoc] = useState<string | null>(draft.id_document_url ?? null);
  const [insurance, setInsurance] = useState<string | null>(draft.insurance_url ?? null);
  const [certs, setCerts] = useState<string[]>(draft.certificate_urls ?? []);
  const [uploading, setUploading] = useState<string | null>(null);

  const upload = async (file: File, kind: "id" | "insurance" | "cert") => {
    if (!user) return null;
    if (file.size > MAX_BYTES) {
      toast.error("File too large (max 10MB)");
      return null;
    }
    setUploading(kind);
    const path = `${user.id}/${kind}-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("guide-documents").upload(path, file, { upsert: true });
    setUploading(null);
    if (error) {
      toast.error(error.message);
      return null;
    }
    return path;
  };

  const handleId = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const p = await upload(f, "id");
    if (p) setIdDoc(p);
  };
  const handleIns = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const p = await upload(f, "insurance");
    if (p) setInsurance(p);
  };
  const handleCert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const p = await upload(f, "cert");
    if (p) setCerts([...certs, p]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idDoc) return toast.error("Please upload an ID document");
    await onNext({ id_document_url: idDoc, insurance_url: insurance, certificate_urls: certs });
  };

  const FileSlot = ({ label, value, onChange, kind, accept = "image/*,application/pdf" }: { label: string; value: string | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; kind: string; accept?: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm bg-accent/30">
          <span className="flex items-center gap-2 truncate"><FileCheck2 className="size-4 text-primary" /> Uploaded</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => kind === "id" ? setIdDoc(null) : setInsurance(null)}>Replace</Button>
        </div>
      ) : (
        <label className="flex items-center gap-2 rounded-md border border-dashed px-3 py-3 cursor-pointer hover:bg-accent text-sm text-muted-foreground">
          {uploading === kind ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Upload file (PDF or image, max 10MB)
          <input type="file" className="hidden" accept={accept} onChange={onChange} />
        </label>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-sm text-muted-foreground">Documents are private — only you and our admins can see them.</p>

      <FileSlot label="ID document (required)" value={idDoc} onChange={handleId} kind="id" />
      <FileSlot label="Liability insurance (optional but recommended)" value={insurance} onChange={handleIns} kind="insurance" />

      <div className="space-y-2">
        <Label>Certifications (optional, multiple)</Label>
        <ul className="space-y-1">
          {certs.map((c, i) => (
            <li key={c} className="flex items-center justify-between text-sm border rounded-md px-3 py-2 bg-accent/30">
              <span className="flex items-center gap-2 truncate"><FileCheck2 className="size-4 text-primary" /> Certificate #{i + 1}</span>
              <button type="button" onClick={() => setCerts(certs.filter((x) => x !== c))} className="text-muted-foreground hover:text-destructive">
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <label className="flex items-center gap-2 rounded-md border border-dashed px-3 py-3 cursor-pointer hover:bg-accent text-sm text-muted-foreground">
          {uploading === "cert" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Add certificate
          <Input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleCert} />
        </label>
      </div>

      <StepNav onBack={onBack} canBack saving={saving || !!uploading} />
    </form>
  );
};
