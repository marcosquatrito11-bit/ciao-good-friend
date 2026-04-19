import { useTranslation } from "react-i18next";
import { Search, MessageCircle, Calendar } from "lucide-react";

export const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    { key: "s1", icon: Search },
    { key: "s2", icon: MessageCircle },
    { key: "s3", icon: Calendar },
  ];

  return (
    <section id="how" className="py-20 sm:py-28 bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 size-[500px] rounded-full bg-primary blur-[120px]" />
        <div className="absolute bottom-0 left-0 size-[400px] rounded-full bg-accent blur-[120px]" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-2xl mb-14 sm:mb-20 text-center mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t("how.title")}
          </h2>
          <p className="text-base sm:text-lg text-secondary-foreground/70">
            {t("how.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          {steps.map((s, i) => (
            <div key={s.key} className="relative text-center md:text-left">
              <div className="flex md:block items-center gap-4 mb-5">
                <div className="relative inline-grid place-items-center size-16 rounded-2xl gradient-lava shadow-lava shrink-0">
                  <s.icon className="size-7 text-primary-foreground" />
                  <span className="absolute -top-2 -right-2 grid place-items-center size-7 rounded-full bg-accent text-accent-foreground text-xs font-bold border-2 border-secondary">
                    {i + 1}
                  </span>
                </div>
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">
                {t(`how.${s.key}.title`)}
              </h3>
              <p className="text-secondary-foreground/70 leading-relaxed">
                {t(`how.${s.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
