import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, MapPin, Star, MessageSquare, Globe, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Guide = {
  id: string; user_id: string; headline: string | null; bio_long: string | null;
  rating: number | null; reviews_count: number | null; bookings_count: number | null;
  specializations: string[] | null; areas_covered: string[] | null;
  languages: { code: string; level?: string }[] | null;
};
type Profile = { display_name: string | null; avatar_url: string | null; bio: string | null };
type Exp = { id: string; slug: string | null; title: string; price_amount: number; images: string[] | null; rating: number | null; location_name: string | null };
type Review = { id: string; rating: number; comment: string | null; created_at: string; tourist_id: string; profiles?: { display_name: string | null; avatar_url: string | null } | null };

const GuideProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Exp[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: g } = await supabase.from("guides").select("*").eq("id", id).maybeSingle();
      if (!g) { setLoading(false); return; }
      setGuide(g as unknown as Guide);
      const [{ data: p }, { data: exps }, { data: rv }] = await Promise.all([
        supabase.from("profiles").select("display_name, avatar_url, bio").eq("id", g.user_id).maybeSingle(),
        supabase.from("experiences").select("id, slug, title, price_amount, images, rating, location_name").eq("guide_id", g.id).eq("status", "published"),
        supabase.from("reviews").select("id, rating, comment, created_at, tourist_id").eq("guide_id", g.id).order("created_at", { ascending: false }).limit(20),
      ]);
      setProfile(p as Profile);
      setExperiences((exps ?? []) as Exp[]);
      const reviewList = (rv ?? []) as Review[];
      const tids = [...new Set(reviewList.map((r) => r.tourist_id))];
      if (tids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", tids);
        const pm = new Map((profs ?? []).map((x) => [x.id, x]));
        reviewList.forEach((r) => { r.profiles = pm.get(r.tourist_id) as never; });
      }
      setReviews(reviewList);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return (<><Navbar /><div className="min-h-[60vh] grid place-items-center"><Loader2 className="size-6 animate-spin" /></div><Footer /></>);
  if (!guide) return (<><Navbar /><div className="min-h-[60vh] grid place-items-center text-muted-foreground">Guide not found.</div><Footer /></>);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20">
        <div className="container py-8 grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="space-y-4">
            <div className="size-32 rounded-full bg-muted overflow-hidden mx-auto lg:mx-0">
              {profile?.avatar_url && <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-display font-bold">{profile?.display_name ?? "Local guide"}</h1>
              {guide.headline && <p className="text-sm text-muted-foreground mt-1">{guide.headline}</p>}
              {(guide.rating ?? 0) > 0 && (
                <p className="mt-2 text-sm flex items-center gap-1 justify-center lg:justify-start">
                  <Star className="size-4 fill-amber-400 text-amber-400" /> {Number(guide.rating).toFixed(1)} <span className="text-muted-foreground">({guide.reviews_count} reviews)</span>
                </p>
              )}
            </div>
            {user && user.id !== guide.user_id && (
              <Button asChild className="w-full gradient-lava text-primary-foreground border-0 shadow-lava">
                <Link to={`/dashboard/messages?with=${guide.user_id}`}><MessageSquare className="size-4" /> Message</Link>
              </Button>
            )}
            {!!guide.languages?.length && (
              <Card><CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold flex items-center gap-1 text-muted-foreground"><Globe className="size-3" /> LANGUAGES</p>
                <div className="flex flex-wrap gap-1.5">{guide.languages.map((l, i) => <Badge key={i} variant="outline" className="uppercase text-xs">{l.code}{l.level ? ` · ${l.level}` : ""}</Badge>)}</div>
              </CardContent></Card>
            )}
            {!!guide.specializations?.length && (
              <Card><CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold flex items-center gap-1 text-muted-foreground"><Award className="size-3" /> SPECIALIZATIONS</p>
                <div className="flex flex-wrap gap-1.5">{guide.specializations.map((s) => <Badge key={s} variant="secondary" className="capitalize text-xs">{s}</Badge>)}</div>
              </CardContent></Card>
            )}
            {!!guide.areas_covered?.length && (
              <Card><CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold flex items-center gap-1 text-muted-foreground"><MapPin className="size-3" /> AREAS</p>
                <p className="text-sm">{guide.areas_covered.join(", ")}</p>
              </CardContent></Card>
            )}
          </aside>

          <div className="space-y-8">
            {(guide.bio_long || profile?.bio) && (
              <section>
                <h2 className="font-display text-xl font-semibold mb-2">About</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">{guide.bio_long || profile?.bio}</p>
              </section>
            )}

            <section>
              <h2 className="font-display text-xl font-semibold mb-4">Experiences ({experiences.length})</h2>
              {experiences.length === 0 ? (
                <p className="text-sm text-muted-foreground">No published experiences yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {experiences.map((e) => (
                    <Link key={e.id} to={`/experiences/${e.slug ?? e.id}`}>
                      <Card className="overflow-hidden h-full hover:shadow-lg transition group">
                        <div className="aspect-[4/3] bg-muted overflow-hidden">
                          {e.images?.[0] && <img src={e.images[0]} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                        </div>
                        <CardContent className="p-3">
                          <div className="flex justify-between gap-2"><h3 className="font-semibold text-sm line-clamp-1">{e.title}</h3><span className="text-primary font-bold text-sm">€{Number(e.price_amount).toFixed(0)}</span></div>
                          {e.location_name && <p className="text-xs text-muted-foreground mt-1">{e.location_name}</p>}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mb-4">Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <Card key={r.id}><CardContent className="p-4 flex gap-3">
                      <div className="size-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                        {r.profiles?.avatar_url && <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{r.profiles?.display_name ?? "Tourist"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-0.5 my-1">{[1,2,3,4,5].map(n => <Star key={n} className={`size-3 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />)}</div>
                        {r.comment && <p className="text-sm text-foreground/90">{r.comment}</p>}
                      </div>
                    </CardContent></Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default GuideProfile;
