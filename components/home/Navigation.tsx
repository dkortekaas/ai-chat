import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Bot } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const locale = params?.locale as string;
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Prijzen" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => pathname.startsWith(`/${locale}${href}`);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="section-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
            aria-label="Ga naar homepage"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-primary">
              <Bot
                className="w-6 h-6 text-primary-foreground"
                aria-hidden="true"
              />
            </div>
            <span className="font-bold text-xl">AI Chatbot</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:flex-1 md:justify-center md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1 ${
                  isActive(link.href) ? "text-primary" : "text-foreground/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            <Button size="sm" variant="ghost" asChild>
              <a href="#login">Login</a>
            </Button>
            <Button size="sm" asChild>
              <a href="#gratis-starten">Gratis Starten</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-expanded={isOpen}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="section-container py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary ${
                  isActive(link.href)
                    ? "text-primary bg-accent"
                    : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="space-y-2 pt-2 border-t border-border">
              <Button className="w-full" variant="ghost" asChild>
                <a href="#login" onClick={() => setIsOpen(false)}>
                  Login
                </a>
              </Button>
              <Button className="w-full" asChild>
                <a href="#gratis-starten" onClick={() => setIsOpen(false)}>
                  Gratis Starten
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
