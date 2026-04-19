import { useTranslation } from "react-i18next";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import g1 from "@/assets/guide-1.jpg";
import g2 from "@/assets/guide-2.jpg";
import g3 from "@/assets/guide-3.jpg";

export const Guides = () => {
  const { t } = useTranslation();

  const guides = [
    { key: "guide1", img: g1, rating: 4.9, reviews: 127, exp: 48, location: "Nicolosi" },
    { key: "guide2", img: g2, rating: 5.0, reviews: 84, exp: 32, location: "Catania" },
    { key: "guide3", img: g3, rating: 4.8, reviews: 156, exp: 61, location: "Linguaglossa" },
  ];

  return (
    <section id="guides" className="py-20 sm:py-28 bg-gradient-to-b from-muted/40 to-background">
      <div className="container">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            ★ Top rated
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t("guides.title")}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            {t("guides.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.map((g) => (
            <article
              key={g.key}
              className="group bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-lava hover:-translate-y-1 transition-all duration-500"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={g.img}
                  alt={t(`guides.${g.key}.name`)}
                  loading="lazy"
                  width={512}
                  height={640}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/95 backdrop-blur px-2.5 py-1 rounded-full shadow-soft">
                  <Star className="size-3.5 fill-accent text-accent" />
                  <span className="text-xs font-bold">{g.rating}</span>
                  <span className="text-xs text-muted-foreground">({g.reviews})</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-xl font-bold leading-tight">
                    {t(`guides.${g.key}.name`)}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="font-medium text-primary">{t(`guides.${g.key}.role`)}</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" />
                    {g.location}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                  {t(`guides.${g.key}.bio`)}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    <strong className="text-foreground">{g.exp}</strong> {t("guides.experiences")}
                  </span>
                  <Button size="sm" variant="ghost" className="text-primary hover:text-primary group/btn">
                    {t("guides.viewProfile")}
                    <ArrowRight className="!size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
