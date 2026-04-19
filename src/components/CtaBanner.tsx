import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CtaBanner = () => {
  const { t } = useTranslation();

  return (
    <section id="become-guide" className="py-16 sm:py-20 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl gradient-lava shadow-lava p-8 sm:p-14 md:p-16">
          <div className="absolute -top-20 -right-20 size-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative z-10 max-w-3xl text-primary-foreground">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {t("ctaBanner.title")}
            </h2>
            <p className="text-base sm:text-lg text-primary-foreground/90 mb-8 max-w-2xl">
              {t("ctaBanner.subtitle")}
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/95 h-12 px-7 text-base font-semibold shadow-lg group"
            >
              {t("ctaBanner.button")}
              <ArrowRight className="!size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
