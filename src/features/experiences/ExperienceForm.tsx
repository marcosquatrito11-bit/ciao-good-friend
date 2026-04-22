import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Plus, X, Upload, ArrowLeft, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EXPERIENCE_CATEGORIES, LANGUAGES, slugify } from "./categories";

type Form = {
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  price_amount: number;
  min_participants: number;
  max_participants: number;
  meeting_point: string;
  location_name: string;
  languages: string[];
  included: string[];
  not_included: string[];
  requirements: string;
  images: string[];
};

const empty: Form = {
  title: "",
  description: "",
  category: "hiking",
  duration_minutes: 180,
  price_amount: 50,
  min_participants: 1,
  max_participants: 8,
  meeting_point: "",
  location_name: "",
  languages: ["en"],
  included: [],
  not_included: [],
  requirements: "",
  images: [],
};

export const ExperienceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<Form>(empty);
  const [guideId, setGuideId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [incInput, setIncInput] = useState("");
  const [notIncInput, setNotIncInput] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: g } = await supabase.from("guides").select("id").eq("user_id", user.id).maybeSingle();
      if (!g) {
        toast.error("You must be an approved guide");
        navigate("/dashboard");
        return;
      }
      setGuideId(g.id);
      if (id) {
        const { data: exp } = await supabase.from("experiences").select("*").eq("id", id).maybeSingle();
        if (exp) {
          setForm({
            title: exp.title ?? "",
            description: exp.description ?? "",
            category: exp.category,
            duration_minutes: exp.duration_minutes,
            price_amount: Number(exp.price_amount),
            min_participants: exp.min_participants,
            max_participants: exp.max_participants,
            meeting_point: exp.meeting_point ?? "",
            location_name: exp.location_name ?? "",
            languages: exp.languages ?? ["en"],
            included: exp.included ?? [],
            not_included: exp.not_included ?? [],
            requirements: exp.requirements ?? "",
            images: exp.images ?? [],
          });
        }
      }
      setLoading(false);
    })();
  }, [user, id, navigate]);

  const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const toggleLang = (code: string) => {
    setForm((f) => ({
      ...f,
      languages: f.languages.includes(code) ? f.languages.filter((l) => l !== code) : [...f.languages, code],
    }));
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error } = await supabase.storage.from("experiences").upload(path, file, { upsert: false });
      if (error) {
        toast.error(error.message);
        continue;
      }
      const { data } = supabase.storage.from("experiences").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    update("images", [...form.images, ...urls]);
    setUploading(false);
  };

  const removeImage = (url: string) => update("images", form.images.filter((u) => u !== url));

  const addToList = (key: "included" | "not_included", val: string) => {
    if (!val.trim()) return;
    update(key, [...form[key], val.trim()]);
  };

  const save = async (publish: boolean) => {
    if (!guideId) return;
    if (!form.title || !form.description || form.price_amount <= 0) {
      toast.error("Fill title, description and price");
      return;
    }
    setSaving(true);
    const payload = {
      guide_id: guideId,
      title: form.title,
      slug: slugify(form.title) + "-" + Math.random().toString(36).slice(2, 6),
      description: form.description,
      category: form.category as never,
      duration_minutes: form.duration_minutes,
      price_amount: form.price_amount,
      min_participants: form.min_participants,
      max_participants: form.max_participants,
      meeting_point: form.meeting_point,
      location_name: form.location_name,
      languages: form.languages,
      included: form.included,
      not_included: form.not_included,
      requirements: form.requirements,
      images: form.images,
      status: (publish ? "published" : "draft") as never,
    };

    let error;
    if (id) {
      const { slug, ...rest } = payload;
      ({ error } = await supabase.from("experiences").update(rest).eq("id", id));
    } else {
      ({ error } = await supabase.from("experiences").insert(payload));
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(publish ? "Experience published!" : "Draft saved");
    navigate("/dashboard/experiences");
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/experiences")}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <h1 className="text-2xl font-display font-bold mt-2">{id ? "Edit experience" : "Create experience"}</h1>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Basics</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Sunset hike on Mount Etna" />
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What will travelers experience?" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (minutes) *</Label>
              <Input type="number" min={30} value={form.duration_minutes} onChange={(e) => update("duration_minutes", Number(e.target.value))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Pricing & group size</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label>Price per person (EUR) *</Label>
            <Input type="number" min={1} step={0.5} value={form.price_amount} onChange={(e) => update("price_amount", Number(e.target.value))} />
          </div>
          <div>
            <Label>Min participants</Label>
            <Input type="number" min={1} value={form.min_participants} onChange={(e) => update("min_participants", Number(e.target.value))} />
          </div>
          <div>
            <Label>Max participants</Label>
            <Input type="number" min={1} value={form.max_participants} onChange={(e) => update("max_participants", Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Location</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Area / city</Label>
            <Input value={form.location_name} onChange={(e) => update("location_name", e.target.value)} placeholder="Etna South – Rifugio Sapienza" />
          </div>
          <div>
            <Label>Meeting point</Label>
            <Textarea rows={2} value={form.meeting_point} onChange={(e) => update("meeting_point", e.target.value)} placeholder="Detailed instructions for travelers" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Languages spoken during the tour</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <Badge
              key={l.code}
              variant={form.languages.includes(l.code) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleLang(l.code)}
            >
              {l.name}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Photos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {form.images.map((url) => (
              <div key={url} className="relative aspect-video rounded-md overflow-hidden bg-muted group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(url)} className="absolute top-1 right-1 size-6 rounded-full bg-background/90 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <label className="aspect-video rounded-md border-2 border-dashed grid place-items-center cursor-pointer hover:bg-muted/50 transition">
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
              <div className="text-center text-sm text-muted-foreground">
                {uploading ? <Loader2 className="size-5 animate-spin mx-auto" /> : <><Upload className="size-5 mx-auto mb-1" /> Upload</>}
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">What's included / not included</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Included</Label>
            <div className="flex gap-2">
              <Input value={incInput} onChange={(e) => setIncInput(e.target.value)} placeholder="e.g. Helmet & gear" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList("included", incInput); setIncInput(""); }}} />
              <Button type="button" variant="outline" size="icon" onClick={() => { addToList("included", incInput); setIncInput(""); }}><Plus className="size-4" /></Button>
            </div>
            <ul className="space-y-1">
              {form.included.map((it, i) => (
                <li key={i} className="flex items-center justify-between text-sm bg-muted/50 px-2 py-1 rounded">
                  ✓ {it}
                  <button type="button" onClick={() => update("included", form.included.filter((_, idx) => idx !== i))}><X className="size-3" /></button>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <Label>Not included</Label>
            <div className="flex gap-2">
              <Input value={notIncInput} onChange={(e) => setNotIncInput(e.target.value)} placeholder="e.g. Lunch" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList("not_included", notIncInput); setNotIncInput(""); }}} />
              <Button type="button" variant="outline" size="icon" onClick={() => { addToList("not_included", notIncInput); setNotIncInput(""); }}><Plus className="size-4" /></Button>
            </div>
            <ul className="space-y-1">
              {form.not_included.map((it, i) => (
                <li key={i} className="flex items-center justify-between text-sm bg-muted/50 px-2 py-1 rounded">
                  ✕ {it}
                  <button type="button" onClick={() => update("not_included", form.not_included.filter((_, idx) => idx !== i))}><X className="size-3" /></button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Requirements</CardTitle></CardHeader>
        <CardContent>
          <Textarea rows={3} value={form.requirements} onChange={(e) => update("requirements", e.target.value)} placeholder="Fitness level, age limits, what to bring..." />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 sticky bottom-0 bg-background py-3 border-t">
        <Button variant="outline" onClick={() => save(false)} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save draft
        </Button>
        <Button className="gradient-lava text-primary-foreground border-0 shadow-lava" onClick={() => save(true)} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Publish
        </Button>
      </div>
    </div>
  );
};

export default ExperienceForm;
