import { useTranslation } from "react-i18next";
import { ArrowRight, Star, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-etna.jpg";

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      <img
        src={heroImg}
        alt="Mount Etna eruption at golden hour"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-secondary/40" />

      <div className="container relative z-10 pt-24 pb-16 text-white">
        <div className="max-w-3xl animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-4 py-1.5 mb-6">
            <Sparkles className="size-3.5 text-accent" />
            <span className="text-xs font-medium uppercase tracking-wider">{t("hero.badge")}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-5">
            {t("hero.title")}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mb-8 leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Button
              size="lg"
              className="gradient-lava text-primary-foreground border-0 shadow-lava hover:opacity-95 group h-12 px-7 text-base"
            >
              {t("hero.ctaPrimary")}
              <ArrowRight className="!size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:text-white h-12 px-7 text-base"
            >
              {t("hero.ctaSecondary")}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl border-t border-white/20 pt-6">
            {[
              { icon: Users, label: t("hero.stat1") },
              { icon: Star, label: t("hero.stat2") },
              { icon: Sparkles, label: t("hero.stat3") },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <s.icon className="size-4 sm:size-5 text-accent shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-medium text-white/90 leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs animate-glow-pulse">
        ↓ scroll
      </div>
    </section>
  );
};
