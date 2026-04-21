import { useEffect, useState } from "react";
import { Loader2, Compass } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Exp = { id: string; title: string; status: string; bookings_count: number; rating: number };

const GuideExperiences = () => {
  const { user } = useAuth();
  const [exps, setExps] = useState<Exp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: g } = await supabase.from("guides").select("id").eq("user_id", user.id).maybeSingle();
      if (!g) { setLoading(false); return; }
      const { data } = await supabase.from("experiences").select("id, title, status, bookings_count, rating").eq("guide_id", g.id).order("created_at", { ascending: false });
      setExps(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">My experiences</h1>
          <p className="text-sm text-muted-foreground">Manage tours, dates and pricing.</p>
        </div>
      </div>

      {exps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground space-y-2">
            <Compass className="size-8 mx-auto opacity-60" />
            <p>No experiences yet. Creation flow coming next.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {exps.map((e) => (
            <Card key={e.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  {e.title}
                  <span className="text-xs font-normal capitalize px-2 py-0.5 rounded bg-muted">{e.status}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {e.bookings_count} bookings · ⭐ {e.rating || "—"}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuideExperiences;
