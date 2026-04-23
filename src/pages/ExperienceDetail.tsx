import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, MapPin, Clock, Users, Check, X, ArrowLeft, CalendarDays, Heart, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Exp = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  category: string;
  duration_minutes: number;
  price_amount: number;
  price_currency: string;
  min_participants: number;
  max_participants: number;
  location_name: string | null;
  meeting_point: string | null;
  languages: string[] | null;
  included: string[] | null;
  not_included: string[] | null;
  requirements: string | null;
  images: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  guide_id: string;
};

type Guide = { id: string; user_id: string; headline: string | null; bio_long: string | null };
type Profile = { display_name: string | null; avatar_url: string | null };
type Slot = { id: string; starts_at: string; spots_left: number };
type Review = { id: string; rating: number; comment: string | null; created_at: string; tourist_id: string; profiles?: { display_name: string | null; avatar_url: string | null } | null };

const ExperienceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exp, setExp] = useState<Exp | null>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [pax, setPax] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [booking, setBooking] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      // try slug first, fallback to id
      let { data } = await supabase
        .from("experiences")
        .select("*")
        .eq("status", "published")
        .eq("slug", slug)
        .maybeSingle();
      if (!data) {
        ({ data } = await supabase.from("experiences").select("*").eq("status", "published").eq("id", slug).maybeSingle());
      }
      if (!data) { setLoading(false); return; }
      setExp(data as unknown as Exp);

      const [{ data: g }, { data: dts }] = await Promise.all([
        supabase.from("guides").select("id, user_id, headline, bio_long").eq("id", data.guide_id).maybeSingle(),
        supabase.from("experience_dates").select("id, starts_at, spots_left").eq("experience_id", data.id).gte("starts_at", new Date().toISOString()).order("starts_at"),
      ]);
      setGuide(g as Guide);
      setSlots((dts ?? []) as Slot[]);
      if (g?.user_id) {
        const { data: p } = await supabase.from("profiles").select("display_name, avatar_url").eq("id", g.user_id).maybeSingle();
        setProfile(p as Profile);
      }
      // reviews
      const { data: rv } = await supabase.from("reviews").select("id, rating, comment, created_at, tourist_id").eq("experience_id", data.id).order("created_at", { ascending: false }).limit(10);
      const reviewList = (rv ?? []) as Review[];
      const tids = [...new Set(reviewList.map((r) => r.tourist_id))];
      if (tids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", tids);
        const pm = new Map((profs ?? []).map((x) => [x.id, x]));
        reviewList.forEach((r) => { r.profiles = pm.get(r.tourist_id) as never; });
      }
      setReviews(reviewList);
      // favorite
      if (user) {
        const { data: fav } = await supabase.from("favorites").select("user_id").eq("user_id", user.id).eq("experience_id", data.id).maybeSingle();
        setIsFav(!!fav);
      }
      setLoading(false);
    })();
  }, [slug, user]);

  const toggleFav = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!exp) return;
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("experience_id", exp.id);
      setIsFav(false);
      toast.success("Removed from favorites");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, experience_id: exp.id });
      setIsFav(true);
      toast.success("Added to favorites ❤️");
    }
  };

  const book = async () => {
    if (!user) { navigate("/auth", { state: { from: window.location.pathname } }); return; }
    if (!selectedSlot) return toast.error("Choose a date");
    if (!exp) return;
    setBooking(true);
    // Booking flow: per ora crea record pending. Stripe checkout arriva nello step successivo.
    const total = Number(exp.price_amount) * pax;
    const fee = +(total * 0.15).toFixed(2);
    const payout = +(total - fee).toFixed(2);
    const { error } = await supabase.from("bookings").insert({
      tourist_id: user.id,
      guide_id: exp.guide_id,
      experience_id: exp.id,
      experience_date_id: selectedSlot,
      participants: pax,
      total_amount: total,
      platform_fee: fee,
      guide_payout: payout,
      currency: exp.price_currency as never,
      status: "pending" as never,
    });
    setBooking(false);
    if (error) return toast.error(error.message);
    toast.success("Reservation created! Payment step coming soon.");
    navigate("/dashboard");
  };

  if (loading) return (
    <><Navbar /><div className="min-h-[60vh] grid place-items-center"><Loader2 className="size-6 animate-spin" /></div><Footer /></>
  );

  if (!exp) return (
    <><Navbar /><div className="min-h-[60vh] grid place-items-center text-muted-foreground">Experience not found.</div><Footer /></>
  );

  const total = Number(exp.price_amount) * pax;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="size-4" /> Back</Button>
        </div>

        <div className="container pb-16 grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            {/* Gallery */}
            <div className="space-y-2">
              <div className="aspect-[16/10] rounded-xl overflow-hidden bg-muted">
                {exp.images?.[activeImg] ? (
                  <img src={exp.images[activeImg]} alt={exp.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground">No image</div>
                )}
              </div>
              {(exp.images?.length ?? 0) > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {exp.images!.map((u, i) => (
                    <button key={u} onClick={() => setActiveImg(i)} className={`size-16 rounded overflow-hidden flex-shrink-0 ${i === activeImg ? "ring-2 ring-primary" : "opacity-70"}`}>
                      <img src={u} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Badge variant="outline" className="mb-2 capitalize">{exp.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-display font-bold">{exp.title}</h1>
              <p className="mt-3 text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                {exp.location_name && <span className="flex items-center gap-1"><MapPin className="size-4" /> {exp.location_name}</span>}
                <span className="flex items-center gap-1"><Clock className="size-4" /> {Math.round(exp.duration_minutes / 60)}h</span>
                <span className="flex items-center gap-1"><Users className="size-4" /> up to {exp.max_participants}</span>
                {(exp.rating ?? 0) > 0 && <span>⭐ {Number(exp.rating).toFixed(1)} ({exp.reviews_count})</span>}
              </p>
            </div>

            {profile && guide && (
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="size-12 rounded-full bg-muted overflow-hidden">
                    {profile.avatar_url && <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hosted by</p>
                    <p className="font-semibold">{profile.display_name ?? "Local guide"}</p>
                    {guide.headline && <p className="text-xs text-muted-foreground">{guide.headline}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            <section>
              <h2 className="font-display text-xl font-semibold mb-2">About this experience</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">{exp.description}</p>
            </section>

            {(exp.included?.length || exp.not_included?.length) ? (
              <section className="grid sm:grid-cols-2 gap-4">
                {exp.included?.length ? (
                  <div>
                    <h3 className="font-semibold mb-2">What's included</h3>
                    <ul className="text-sm space-y-1">
                      {exp.included.map((x, i) => <li key={i} className="flex gap-2"><Check className="size-4 text-primary mt-0.5 flex-shrink-0" /> {x}</li>)}
                    </ul>
                  </div>
                ) : null}
                {exp.not_included?.length ? (
                  <div>
                    <h3 className="font-semibold mb-2">Not included</h3>
                    <ul className="text-sm space-y-1">
                      {exp.not_included.map((x, i) => <li key={i} className="flex gap-2"><X className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" /> {x}</li>)}
                    </ul>
                  </div>
                ) : null}
              </section>
            ) : null}

            {exp.meeting_point && (
              <section>
                <h3 className="font-semibold mb-2">Meeting point</h3>
                <p className="text-sm text-muted-foreground">{exp.meeting_point}</p>
              </section>
            )}

            {exp.requirements && (
              <section>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{exp.requirements}</p>
              </section>
            )}
          </div>

          {/* Booking sidebar */}
          <aside className="lg:sticky lg:top-6 self-start">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">€{Number(exp.price_amount).toFixed(0)}</span>
                  <span className="text-sm text-muted-foreground">per person</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5"><CalendarDays className="size-3.5" /> Choose date</label>
                  {slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No upcoming dates available.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {slots.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSlot(s.id)}
                          disabled={s.spots_left < pax}
                          className={`w-full text-left text-sm px-3 py-2 rounded-md border transition ${selectedSlot === s.id ? "border-primary bg-primary/5" : "hover:bg-muted"} ${s.spots_left < pax ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="font-medium">{new Date(s.starts_at).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                          <div className="text-xs text-muted-foreground">{s.spots_left} spots left</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Participants</label>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => setPax(Math.max(exp.min_participants, pax - 1))}>−</Button>
                    <span className="flex-1 text-center font-semibold">{pax}</span>
                    <Button size="icon" variant="outline" onClick={() => setPax(Math.min(exp.max_participants, pax + 1))}>+</Button>
                  </div>
                </div>

                <div className="border-t pt-3 flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full gradient-lava text-primary-foreground border-0 shadow-lava"
                  onClick={book}
                  disabled={booking || slots.length === 0}
                >
                  {booking ? <Loader2 className="size-4 animate-spin" /> : null}
                  {user ? "Reserve now" : "Sign in to book"}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center">You won't be charged yet — payment processing coming soon.</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ExperienceDetail;
