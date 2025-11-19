"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui";

const Navigation = () => {
  const params = useParams();
  const locale = params?.locale as string;
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Prijzen" },
    { href: "/contact", label: "Contact" },
  ];

  const getHref = (href: string) => {
    if (href === "/") {
      return `/${locale}`;
    }
    return `/${locale}${href}`;
  };

  const isActive = (href: string) => {
    const hrefPath = href === "/" ? `/${locale}` : `/${locale}${href}`;
    return (
      pathname === hrefPath || (href !== "/" && pathname.startsWith(hrefPath))
    );
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={getHref(link.href)}
            className={`text-base font-medium hover:text-primary transition-colors" ${
              isActive(link.href) ? "text-primary" : "text-foreground"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav className="fixed top-16 left-0 right-0 bg-background border-b shadow-lg z-50 md:hidden">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={getHref(link.href)}
                    className={`text-lg font-medium hover:text-primary transition-colors py-2 ${
                      isActive(link.href) ? "text-primary" : "text-foreground"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t flex flex-col gap-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Inloggen</Link>
                  </Button>
                  <Button asChild variant="gradient" className="w-full">
                    <Link href="/register">Gratis proberen</Link>
                  </Button>
                </div>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default Navigation;
