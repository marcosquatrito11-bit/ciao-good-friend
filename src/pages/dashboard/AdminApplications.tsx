import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type App = {
  id: string;
  user_id: string;
  status: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  headline: string | null;
  bio_short: string | null;
  years_experience: number | null;
  specializations: string[] | null;
  languages: { code: string; level: string }[] | null;
  id_document_url: string | null;
  certificate_urls: string[] | null;
  insurance_url: string | null;
  motivation: string | null;
  submitted_at: string | null;
};

const AdminApplications = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("guide_applications")
      .select("*")
      .in("status", ["pending", "rejected"])
      .order("submitted_at", { ascending: false });
    setApps((data as unknown as App[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const signedDocUrl = async (path: string | null) => {
    if (!path) return null;
    const { data } = await supabase.storage.from("guide-documents").createSignedUrl(path, 60 * 5);
    return data?.signedUrl ?? null;
  };

  const openDoc = async (path: string) => {
    const url = await signedDocUrl(path);
    if (url) window.open(url, "_blank");
  };

  const approve = async (a: App) => {
    setBusy(a.id);
    const { error: e1 } = await supabase.from("guide_applications").update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
    }).eq("id", a.id);
    if (e1) { setBusy(null); return toast.error(e1.message); }

    const { error: e2 } = await supabase.from("guides").insert({
      user_id: a.user_id,
      application_id: a.id,
      headline: a.headline,
      languages: (a.languages ?? []) as never,
      specializations: (a.specializations ?? []) as never,
    } as never);
    if (e2) { setBusy(null); return toast.error(e2.message); }

    const { error: e3 } = await supabase.from("user_roles").insert({ user_id: a.user_id, role: "guide" } as never);
    if (e3 && !e3.message.includes("duplicate")) { setBusy(null); return toast.error(e3.message); }

    setBusy(null);
    toast.success("Application approved");
    load();
  };

  const reject = async (a: App) => {
    const reason = reasons[a.id]?.trim();
    if (!reason || reason.length < 5) return toast.error("Please provide a rejection reason");
    setBusy(a.id);
    const { error } = await supabase.from("guide_applications").update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
    }).eq("id", a.id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Application rejected");
    load();
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Guide applications</h1>
        <p className="text-sm text-muted-foreground">{apps.length} to review</p>
      </div>

      {apps.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No applications to review 🎉</CardContent></Card>
      )}

      {apps.map((a) => (
        <Card key={a.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3 flex-wrap">
              <span>{a.first_name} {a.last_name} <span className="text-sm font-normal text-muted-foreground">· {a.city}</span></span>
              <Badge variant={a.status === "pending" ? "default" : "destructive"}>{a.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p><strong>Headline:</strong> {a.headline}</p>
            <p className="text-muted-foreground">{a.bio_short}</p>
            <div className="flex flex-wrap gap-2">
              {a.specializations?.map((s) => <Badge key={s} variant="outline" className="capitalize">{s}</Badge>)}
            </div>
            <p><strong>Experience:</strong> {a.years_experience} years</p>
            <p><strong>Languages:</strong> {a.languages?.map((l) => `${l.code} (${l.level})`).join(", ")}</p>
            <p><strong>Motivation:</strong> <span className="text-muted-foreground">{a.motivation}</span></p>

            <div className="flex flex-wrap gap-2">
              {a.id_document_url && <Button size="sm" variant="outline" onClick={() => openDoc(a.id_document_url!)}><FileText className="size-3.5" /> ID</Button>}
              {a.insurance_url && <Button size="sm" variant="outline" onClick={() => openDoc(a.insurance_url!)}><FileText className="size-3.5" /> Insurance</Button>}
              {a.certificate_urls?.map((c, i) => <Button key={c} size="sm" variant="outline" onClick={() => openDoc(c)}><FileText className="size-3.5" /> Cert {i + 1}</Button>)}
            </div>

            {a.status === "pending" && (
              <div className="space-y-3 pt-3 border-t">
                <Textarea
                  placeholder="Rejection reason (required to reject)"
                  value={reasons[a.id] ?? ""}
                  onChange={(e) => setReasons({ ...reasons, [a.id]: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button onClick={() => approve(a)} disabled={busy === a.id} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="size-4" /> Approve</Button>
                  <Button onClick={() => reject(a)} disabled={busy === a.id} variant="destructive"><XCircle className="size-4" /> Reject</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminApplications;
