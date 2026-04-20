import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mountain, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#categories", label: t("nav.experiences") },
    { href: "#guides", label: t("nav.guides") },
    { href: "#how", label: t("nav.howItWorks") },
    { href: "#become-guide", label: t("nav.becomeGuide") },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled || open
          ? "bg-background/85 backdrop-blur-lg border-b border-border shadow-soft"
          : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-2 font-display font-bold text-xl">
          <span className="grid place-items-center size-9 rounded-lg gradient-lava shadow-lava">
            <Mountain className="size-5 text-primary-foreground" />
          </span>
          <span className={cn(scrolled || open ? "text-foreground" : "text-white")}>EtnaGo</span>
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                scrolled ? "text-foreground/80" : "text-white/90",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" className={cn("hidden sm:inline-flex", !scrolled && !open && "text-white hover:text-white hover:bg-white/10")}>
            {t("nav.login")}
          </Button>
          <Button size="sm" className="gradient-lava text-primary-foreground border-0 shadow-lava hover:opacity-95">
            {t("nav.signup")}
          </Button>
          <button
            className={cn("lg:hidden p-2", scrolled || open ? "text-foreground" : "text-white")}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-border bg-background">
          <div className="container py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-foreground/80 hover:text-primary"
              >
                {l.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
