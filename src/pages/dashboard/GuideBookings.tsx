import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, CalendarDays, MessageSquare, Check, X, TrendingUp, Euro, Star, Compass } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Booking = {
  id: string;
  status: string;
  participants: number;
  total_amount: number;
  guide_payout: number;
  tourist_id: string;
  experience_id: string;
  experiences: { title: string } | null;
  experience_dates: { starts_at: string } | null;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
};

type Stats = {
  experiences: number;
  bookings: number;
  upcoming: number;
  revenue: number;
  rating: number;
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  completed: "bg-primary/15 text-primary border-primary/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const GuideBookings = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({ experiences: 0, bookings: 0, upcoming: 0, revenue: 0, rating: 0 });
  const [loading, setLoading] = useState(true);
  const [guideId, setGuideId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data: g } = await supabase.from("guides").select("id, rating").eq("user_id", user.id).maybeSingle();
    if (!g) { setLoading(false); return; }
    setGuideId(g.id);

    const [{ data: bks }, { count: expCount }] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, status, participants, total_amount, guide_payout, tourist_id, experience_id, experiences(title), experience_dates(starts_at)")
        .eq("guide_id", g.id)
        .order("created_at", { ascending: false }),
      supabase.from("experiences").select("*", { count: "exact", head: true }).eq("guide_id", g.id),
    ]);

    const list = (bks ?? []) as unknown as Booking[];
    const touristIds = [...new Set(list.map((b) => b.tourist_id))];
    if (touristIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", touristIds);
      const pm = new Map((profs ?? []).map((p) => [p.id, p]));
      list.forEach((b) => { b.profiles = pm.get(b.tourist_id) as never; });
    }
    setItems(list);

    const now = new Date();
    setStats({
      experiences: expCount ?? 0,
      bookings: list.length,
      upcoming: list.filter((b) => b.status !== "cancelled" && b.experience_dates && new Date(b.experience_dates.starts_at) > now).length,
      revenue: list.filter((b) => b.status === "completed" || b.status === "confirmed").reduce((s, b) => s + Number(b.guide_payout), 0),
      rating: Number(g.rating ?? 0),
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const updateStatus = async (id: string, status: "confirmed" | "cancelled" | "completed") => {
    const { error } = await supabase.from("bookings").update({ status: status as never }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin" /></div>;

  if (!guideId) return <p className="text-muted-foreground">You need to be an approved guide to see this page.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Guide dashboard</h1>
        <p className="text-sm text-muted-foreground">Your stats and incoming bookings.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Compass className="size-4" />} label="Experiences" value={stats.experiences} />
        <StatCard icon={<CalendarDays className="size-4" />} label="Bookings" value={stats.bookings} sub={`${stats.upcoming} upcoming`} />
        <StatCard icon={<Euro className="size-4" />} label="Earnings" value={`€${stats.revenue.toFixed(0)}`} sub="net payout" />
        <StatCard icon={<Star className="size-4" />} label="Rating" value={stats.rating > 0 ? stats.rating.toFixed(1) : "—"} />
      </div>

      <div>
        <h2 className="font-semibold mb-3">Bookings</h2>
        {items.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><TrendingUp className="size-8 mx-auto opacity-60 mb-2" /><p>No bookings yet.</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {items.map((b) => (
              <Card key={b.id}>
                <CardContent className="p-4 flex flex-wrap items-center gap-4">
                  <div className="size-10 rounded-full bg-muted overflow-hidden">
                    {b.profiles?.avatar_url && <img src={b.profiles.avatar_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-semibold text-sm">{b.profiles?.display_name ?? "Tourist"}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.experiences?.title} · {b.participants} pax · {b.experience_dates?.starts_at ? new Date(b.experience_dates.starts_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—"}
                    </p>
                    <p className="text-xs text-primary font-semibold mt-0.5">€{Number(b.guide_payout).toFixed(2)} payout</p>
                  </div>
                  <Badge variant="outline" className={`capitalize ${statusColor[b.status] ?? ""}`}>{b.status}</Badge>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/dashboard/messages?with=${b.tourist_id}`}><MessageSquare className="size-4" /></Link>
                    </Button>
                    {b.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")}><Check className="size-4" /> Confirm</Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateStatus(b.id, "cancelled")}><X className="size-4" /></Button>
                      </>
                    )}
                    {b.status === "confirmed" && b.experience_dates && new Date(b.experience_dates.starts_at) < new Date() && (
                      <Button size="sm" onClick={() => updateStatus(b.id, "completed")}>Mark completed</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon} {label}</div>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </CardContent>
  </Card>
);

export default GuideBookings;
