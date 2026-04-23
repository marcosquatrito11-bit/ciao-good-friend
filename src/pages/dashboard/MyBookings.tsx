import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, CalendarDays, MessageSquare, Star, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/features/reviews/ReviewForm";

type Booking = {
  id: string;
  status: string;
  participants: number;
  total_amount: number;
  guide_id: string;
  experience_id: string;
  experience_date_id: string | null;
  experiences: { id: string; slug: string | null; title: string; images: string[] | null } | null;
  experience_dates: { starts_at: string } | null;
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  completed: "bg-primary/15 text-primary border-primary/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  refunded: "bg-muted text-muted-foreground",
};

const MyBookings = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<Booking | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bookings")
      .select("id, status, participants, total_amount, guide_id, experience_id, experience_date_id, experiences(id, slug, title, images), experience_dates(starts_at)")
      .eq("tourist_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as unknown as Booking[]);
    const { data: rv } = await supabase.from("reviews").select("booking_id").eq("tourist_id", user.id);
    setReviews(new Set((rv ?? []).map((r) => r.booking_id)));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const cancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled" as never }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Booking cancelled");
    load();
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My bookings</h1>
        <p className="text-sm text-muted-foreground">Your reservations and past experiences.</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground space-y-3">
            <CalendarDays className="size-8 mx-auto opacity-60" />
            <p>No bookings yet.</p>
            <Button asChild><Link to="/experiences">Browse experiences</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4 flex flex-wrap items-center gap-4">
                {b.experiences?.images?.[0] && (
                  <img src={b.experiences.images[0]} alt="" className="size-16 rounded object-cover" />
                )}
                <div className="flex-1 min-w-[200px]">
                  <Link to={`/experiences/${b.experiences?.slug ?? b.experiences?.id}`} className="font-semibold hover:text-primary">
                    {b.experiences?.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.experience_dates?.starts_at ? new Date(b.experience_dates.starts_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—"}
                    {" · "}{b.participants} pax · €{Number(b.total_amount).toFixed(2)}
                  </p>
                </div>
                <Badge variant="outline" className={`capitalize ${statusColor[b.status] ?? ""}`}>{b.status}</Badge>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/dashboard/messages?with=${b.guide_id}&booking=${b.id}`}>
                      <MessageSquare className="size-4" /> Message
                    </Link>
                  </Button>
                  {b.status === "completed" && !reviews.has(b.id) && (
                    <Button size="sm" onClick={() => setReviewing(b)}>
                      <Star className="size-4" /> Review
                    </Button>
                  )}
                  {(b.status === "pending" || b.status === "confirmed") && (
                    <Button size="sm" variant="ghost" onClick={() => cancel(b.id)} className="text-destructive">
                      <X className="size-4" /> Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reviewing && (
        <ReviewForm
          bookingId={reviewing.id}
          experienceId={reviewing.experience_id}
          guideId={reviewing.guide_id}
          onClose={() => setReviewing(null)}
          onDone={() => { setReviewing(null); load(); }}
        />
      )}
    </div>
  );
};

export default MyBookings;
