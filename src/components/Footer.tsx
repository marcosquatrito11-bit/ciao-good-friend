import { useTranslation } from "react-i18next";
import { Mountain, Instagram, Facebook } from "lucide-react";

export const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-2 max-w-sm">
            <a href="#" className="flex items-center gap-2 font-display font-bold text-2xl mb-4">
              <span className="grid place-items-center size-9 rounded-lg gradient-lava">
                <Mountain className="size-5 text-primary-foreground" />
              </span>
              EtnaGo
            </a>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed mb-5">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="size-9 rounded-lg bg-white/5 hover:bg-primary grid place-items-center transition-colors"
                  aria-label="social"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">{t("footer.explore")}</h4>
            <ul className="space-y-2.5 text-sm text-secondary-foreground/70">
              <li><a href="#categories" className="hover:text-primary transition-colors">{t("nav.experiences")}</a></li>
              <li><a href="#guides" className="hover:text-primary transition-colors">{t("nav.guides")}</a></li>
              <li><a href="#how" className="hover:text-primary transition-colors">{t("nav.howItWorks")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">{t("footer.company")}</h4>
            <ul className="space-y-2.5 text-sm text-secondary-foreground/70">
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.about")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("footer.contact")}</a></li>
              <li><a href="#become-guide" className="hover:text-primary transition-colors">{t("nav.becomeGuide")}</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-secondary-foreground/60">
          <p>© {year} EtnaGo. {t("footer.rights")}</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-primary transition-colors">{t("footer.terms")}</a>
            <a href="#" className="hover:text-primary transition-colors">{t("footer.privacy")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
