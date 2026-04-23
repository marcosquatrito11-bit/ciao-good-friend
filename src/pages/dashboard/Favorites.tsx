import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Heart, MapPin, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Item = {
  experience_id: string;
  experiences: {
    id: string;
    slug: string | null;
    title: string;
    location_name: string | null;
    duration_minutes: number;
    max_participants: number;
    price_amount: number;
    images: string[] | null;
    rating: number | null;
  } | null;
};

const Favorites = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("experience_id, experiences(id, slug, title, location_name, duration_minutes, max_participants, price_amount, images, rating)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as unknown as Item[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const remove = async (eid: string) => {
    await supabase.from("favorites").delete().eq("user_id", user!.id).eq("experience_id", eid);
    toast.success("Removed from favorites");
    load();
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My favorites</h1>
        <p className="text-sm text-muted-foreground">Experiences you've saved.</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground space-y-3">
            <Heart className="size-8 mx-auto opacity-60" />
            <p>No favorites yet. Browse experiences and tap the heart to save them.</p>
            <Button asChild><Link to="/experiences">Browse experiences</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.filter((i) => i.experiences).map((i) => {
            const e = i.experiences!;
            return (
              <Card key={e.id} className="overflow-hidden group">
                <Link to={`/experiences/${e.slug ?? e.id}`}>
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    {e.images?.[0] && <img src={e.images[0]} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                  </div>
                </Link>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/experiences/${e.slug ?? e.id}`}>
                      <h3 className="font-display font-semibold leading-tight line-clamp-2">{e.title}</h3>
                    </Link>
                    <span className="text-primary font-bold">€{Number(e.price_amount).toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                    {e.location_name && <span className="flex items-center gap-1"><MapPin className="size-3" /> {e.location_name}</span>}
                    <span className="flex items-center gap-1"><Clock className="size-3" /> {Math.round(e.duration_minutes / 60)}h</span>
                    <span className="flex items-center gap-1"><Users className="size-3" /> {e.max_participants}</span>
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => remove(e.id)} className="text-destructive">
                    <Heart className="size-4 fill-current" /> Remove
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
