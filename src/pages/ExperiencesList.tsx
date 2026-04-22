import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Search, MapPin, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EXPERIENCE_CATEGORIES } from "@/features/experiences/categories";

type Exp = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  category: string;
  duration_minutes: number;
  price_amount: number;
  max_participants: number;
  location_name: string | null;
  images: string[] | null;
  rating: number | null;
  reviews_count: number | null;
};

const ExperiencesList = () => {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Exp[]>([]);
  const [loading, setLoading] = useState(true);
  const q = params.get("q") ?? "";
  const cat = params.get("cat") ?? "";

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase
        .from("experiences")
        .select("id, slug, title, description, category, duration_minutes, price_amount, max_participants, location_name, images, rating, reviews_count")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (cat) query = query.eq("category", cat as never);
      const { data } = await query;
      setItems((data ?? []) as Exp[]);
      setLoading(false);
    })();
  }, [cat]);

  const filtered = useMemo(() => {
    if (!q) return items;
    const s = q.toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(s) || i.description?.toLowerCase().includes(s) || i.location_name?.toLowerCase().includes(s));
  }, [items, q]);

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <header className="container py-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold">Discover Etna experiences</h1>
          <p className="text-muted-foreground mt-2">Curated tours led by certified local guides.</p>

          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Search by title, place..."
              className="pl-9"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant={!cat ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setParam("cat", "")}
            >
              All
            </Badge>
            {EXPERIENCE_CATEGORIES.map((c) => (
              <Badge
                key={c.value}
                variant={cat === c.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setParam("cat", c.value)}
              >
                {c.emoji} {c.label}
              </Badge>
            ))}
          </div>
        </header>

        <section className="container pb-16">
          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No experiences match your search.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((e) => (
                <Link key={e.id} to={`/experiences/${e.slug ?? e.id}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group">
                    <div className="aspect-[4/3] bg-muted overflow-hidden">
                      {e.images?.[0] ? (
                        <img src={e.images[0]} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-muted-foreground">No image</div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-semibold leading-tight line-clamp-2">{e.title}</h3>
                        <span className="text-primary font-bold whitespace-nowrap">€{Number(e.price_amount).toFixed(0)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                        {e.location_name && <span className="flex items-center gap-1"><MapPin className="size-3" /> {e.location_name}</span>}
                        <span className="flex items-center gap-1"><Clock className="size-3" /> {Math.round(e.duration_minutes / 60)}h</span>
                        <span className="flex items-center gap-1"><Users className="size-3" /> {e.max_participants}</span>
                      </p>
                      {(e.rating ?? 0) > 0 && (
                        <p className="text-xs">⭐ {Number(e.rating).toFixed(1)} <span className="text-muted-foreground">({e.reviews_count})</span></p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ExperiencesList;
