import { useTranslation } from "react-i18next";
import { Wallet, Sparkles, ShieldCheck, MessageSquare } from "lucide-react";

export const WhyEtna = () => {
  const { t } = useTranslation();

  const points = [
    { key: "p1", icon: Wallet },
    { key: "p2", icon: Sparkles },
    { key: "p3", icon: ShieldCheck },
    { key: "p4", icon: MessageSquare },
  ];

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            ETNA difference
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t("why.title")}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            {t("why.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {points.map((p) => (
            <div
              key={p.key}
              className="group p-6 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-card transition-all duration-300"
            >
              <div className="size-12 rounded-xl bg-primary/10 grid place-items-center mb-5 group-hover:gradient-lava group-hover:shadow-lava transition-all">
                <p.icon className="size-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">
                {t(`why.${p.key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`why.${p.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
