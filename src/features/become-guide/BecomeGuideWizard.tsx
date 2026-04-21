import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { STEPS, ApplicationDraft } from "./types";
import { StepPersonal } from "./steps/StepPersonal";
import { StepContact } from "./steps/StepContact";
import { StepAbout } from "./steps/StepAbout";
import { StepLanguages } from "./steps/StepLanguages";
import { StepSpecializations } from "./steps/StepSpecializations";
import { StepDocuments } from "./steps/StepDocuments";
import { StepPayments } from "./steps/StepPayments";
import { StepAgreement } from "./steps/StepAgreement";
import { cn } from "@/lib/utils";

export const BecomeGuideWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ApplicationDraft>({ current_step: 1, languages: [], specializations: [], areas_covered: [], certifications: [], certificate_urls: [] });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("guide_applications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        if (data.status && data.status !== "draft" && data.status !== "rejected") {
          // already submitted → redirect to dashboard
          navigate("/dashboard", { replace: true });
          return;
        }
        setDraft({
          ...(data as unknown as ApplicationDraft),
          languages: (data.languages as unknown as { code: string; level: string }[]) ?? [],
          specializations: data.specializations ?? [],
          areas_covered: data.areas_covered ?? [],
          certifications: (data.certifications as unknown as { name: string }[]) ?? [],
          certificate_urls: data.certificate_urls ?? [],
        });
        setStep(data.current_step ?? 1);
      }
      setLoading(false);
    })();
  }, [user, navigate]);

  const persist = async (patch: Partial<ApplicationDraft>, nextStep?: number) => {
    if (!user) return;
    setSaving(true);
    const merged = { ...draft, ...patch, current_step: nextStep ?? draft.current_step };
    const { error } = await supabase
      .from("guide_applications")
      .upsert(
        {
          user_id: user.id,
          ...merged,
          // jsonb fields need serialization-safe values
          languages: merged.languages ?? [],
          certifications: merged.certifications ?? [],
        } as never,
        { onConflict: "user_id" },
      );
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return false;
    }
    setDraft(merged);
    return true;
  };

  const next = async (patch: Partial<ApplicationDraft>) => {
    const ns = Math.min(step + 1, STEPS.length);
    const ok = await persist(patch, ns);
    if (ok) setStep(ns);
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async (patch: Partial<ApplicationDraft>) => {
    if (!user) return;
    setSaving(true);
    const merged = { ...draft, ...patch };
    const { error } = await supabase
      .from("guide_applications")
      .upsert(
        {
          user_id: user.id,
          ...merged,
          status: "pending",
          submitted_at: new Date().toISOString(),
          languages: merged.languages ?? [],
          certifications: merged.certifications ?? [],
        } as never,
        { onConflict: "user_id" },
      );
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Application submitted! We'll review it soon.");
    navigate("/dashboard", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  const progress = (step / STEPS.length) * 100;
  const currentMeta = STEPS[step - 1];

  const stepProps = { draft, onNext: next, onBack: back, onSubmit: submit, saving };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">Become a guide</p>
          <h1 className="text-3xl font-display font-bold mb-1">{currentMeta.label}</h1>
          <p className="text-sm text-muted-foreground">Step {step} of {STEPS.length}</p>
          <Progress value={progress} className="mt-4 h-1.5" />
          <ol className="hidden md:flex gap-2 mt-4 text-xs">
            {STEPS.map((s, i) => (
              <li
                key={s.key}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md",
                  i + 1 === step && "bg-primary/10 text-primary font-medium",
                  i + 1 < step && "text-muted-foreground",
                  i + 1 > step && "text-muted-foreground/60",
                )}
              >
                <span className="size-4 grid place-items-center rounded-full border text-[10px]">
                  {i + 1 < step ? <Check className="size-3" /> : i + 1}
                </span>
                {s.label}
              </li>
            ))}
          </ol>
        </header>

        <Card className="p-6 md:p-8">
          {step === 1 && <StepPersonal {...stepProps} />}
          {step === 2 && <StepContact {...stepProps} />}
          {step === 3 && <StepAbout {...stepProps} />}
          {step === 4 && <StepLanguages {...stepProps} />}
          {step === 5 && <StepSpecializations {...stepProps} />}
          {step === 6 && <StepDocuments {...stepProps} />}
          {step === 7 && <StepPayments {...stepProps} />}
          {step === 8 && <StepAgreement {...stepProps} />}
        </Card>

        <div className="text-center mt-4 text-xs text-muted-foreground">
          {saving ? "Saving…" : "Your progress is saved automatically"}
        </div>
      </div>
    </main>
  );
};

export const StepNav = ({
  onBack,
  canBack,
  submitLabel = "Continue",
  saving,
}: {
  onBack?: () => void;
  canBack?: boolean;
  submitLabel?: string;
  saving?: boolean;
}) => (
  <div className="flex items-center justify-between pt-6 mt-6 border-t">
    <Button type="button" variant="ghost" onClick={onBack} disabled={!canBack || saving}>
      <ArrowLeft className="size-4" /> Back
    </Button>
    <Button type="submit" className="gradient-lava text-primary-foreground border-0 shadow-lava" disabled={saving}>
      {saving ? "Saving…" : submitLabel} {!saving && <ArrowRight className="size-4" />}
    </Button>
  </div>
);
