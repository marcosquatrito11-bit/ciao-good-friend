import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Slot = { id: string; starts_at: string; spots_left: number };

export const ExperienceDates = ({ experienceId, maxSpots }: { experienceId: string; maxSpots: number }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [spots, setSpots] = useState(maxSpots);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("experience_dates")
      .select("id, starts_at, spots_left")
      .eq("experience_id", experienceId)
      .order("starts_at", { ascending: true });
    setSlots(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [experienceId]);

  const add = async () => {
    if (!date) return toast.error("Pick a date");
    setAdding(true);
    const starts_at = new Date(`${date}T${time}:00`).toISOString();
    const { error } = await supabase.from("experience_dates").insert({ experience_id: experienceId, starts_at, spots_left: spots });
    setAdding(false);
    if (error) return toast.error(error.message);
    setDate("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("experience_dates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Calendar className="size-4" /> Available dates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
          <div className="col-span-2 sm:col-span-1">
            <Label className="text-xs">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
          </div>
          <div>
            <Label className="text-xs">Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Spots</Label>
            <Input type="number" min={1} value={spots} onChange={(e) => setSpots(Number(e.target.value))} />
          </div>
          <Button onClick={add} disabled={adding}>
            {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add
          </Button>
        </div>

        {loading ? (
          <Loader2 className="size-5 animate-spin mx-auto" />
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No dates yet — add one above.</p>
        ) : (
          <ul className="divide-y">
            {slots.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {new Date(s.starts_at).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  <span className="text-muted-foreground ml-2">· {s.spots_left} spots</span>
                </span>
                <Button size="sm" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="size-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
