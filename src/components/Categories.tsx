import { useTranslation } from "react-i18next";
import { Mountain, Camera, Wine, Building2, ArrowUpRight } from "lucide-react";
import trekkingImg from "@/assets/cat-trekking.jpg";
import panoramicImg from "@/assets/cat-panoramic.jpg";
import foodImg from "@/assets/cat-food.jpg";
import cultureImg from "@/assets/cat-culture.jpg";

export const Categories = () => {
  const { t } = useTranslation();

  const items = [
    { key: "trekking", icon: Mountain, img: trekkingImg },
    { key: "panoramic", icon: Camera, img: panoramicImg },
    { key: "food", icon: Wine, img: foodImg },
    { key: "culture", icon: Building2, img: cultureImg },
  ] as const;

  return (
    <section id="categories" className="py-20 sm:py-28 bg-background">
      <div className="container">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t("categories.title")}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            {t("categories.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(({ key, icon: Icon, img }) => (
            <a
              key={key}
              href="#"
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-card hover:shadow-lava transition-all duration-500"
            >
              <img
                src={img}
                alt={t(`categories.${key}.title`)}
                loading="lazy"
                width={1024}
                height={1024}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/40 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between">
                  <span className="grid place-items-center size-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                    <Icon className="size-5" />
                  </span>
                  <ArrowUpRight className="size-5 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold mb-2 leading-tight">
                    {t(`categories.${key}.title`)}
                  </h3>
                  <p className="text-sm text-white/85 leading-relaxed line-clamp-3">
                    {t(`categories.${key}.desc`)}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
