"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const Navigation = () => {
  const params = useParams();
  const locale = params?.locale as string;
  const pathname = usePathname();

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

  return (
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
  );
};

export default Navigation;
