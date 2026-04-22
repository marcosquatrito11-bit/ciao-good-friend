import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Compass, Plus, Pencil, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExperienceDates } from "@/features/experiences/ExperienceDates";

type Exp = {
  id: string;
  title: string;
  status: string;
  bookings_count: number;
  rating: number;
  price_amount: number;
  max_participants: number;
  images: string[] | null;
};

const GuideExperiences = () => {
  const { user } = useAuth();
  const [exps, setExps] = useState<Exp[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDates, setOpenDates] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data: g } = await supabase.from("guides").select("id").eq("user_id", user.id).maybeSingle();
    if (!g) { setLoading(false); return; }
    const { data } = await supabase
      .from("experiences")
      .select("id, title, status, bookings_count, rating, price_amount, max_participants, images")
      .eq("guide_id", g.id)
      .order("created_at", { ascending: false });
    setExps((data ?? []) as Exp[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">My experiences</h1>
          <p className="text-sm text-muted-foreground">Manage tours, dates and pricing.</p>
        </div>
        <Button asChild className="gradient-lava text-primary-foreground border-0 shadow-lava">
          <Link to="/dashboard/experiences/new"><Plus className="size-4" /> New</Link>
        </Button>
      </div>

      {exps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground space-y-3">
            <Compass className="size-8 mx-auto opacity-60" />
            <p>No experiences yet. Create your first tour.</p>
            <Button asChild><Link to="/dashboard/experiences/new"><Plus className="size-4" /> Create experience</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exps.map((e) => (
            <Card key={e.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    {e.images?.[0] && <img src={e.images[0]} alt="" className="size-12 rounded object-cover" />}
                    {e.title}
                  </span>
                  <Badge variant={e.status === "published" ? "default" : "outline"} className="capitalize">{e.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  €{Number(e.price_amount).toFixed(0)} · up to {e.max_participants} pax · {e.bookings_count} bookings · ⭐ {e.rating || "—"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/dashboard/experiences/${e.id}/edit`}><Pencil className="size-4" /> Edit</Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOpenDates(openDates === e.id ? null : e.id)}>
                    <Calendar className="size-4" /> Dates
                  </Button>
                </div>
                {openDates === e.id && (
                  <ExperienceDates experienceId={e.id} maxSpots={e.max_participants} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuideExperiences;
