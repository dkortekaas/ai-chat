"use client";

import Link from "next/link";
import { Bot, Mail, Phone } from "lucide-react";
import { useParams } from "next/navigation";
import Image from "next/image";
import config from "@/config";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();
  const params = useParams();
  const locale = params?.locale as string;

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Image
              src={config.appLogo}
              alt={config.appTitle}
              className="h-28 w-auto object-contain"
              width={100}
              height={100}
            />
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">
              {t("product")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/features`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("features")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/pricing`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("pricing")}
                </Link>
              </li>
              {/* <li>
                <Link
                  href={`/${locale}/documentation`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("documentation")}
                </Link>
              </li> */}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">
              {t("company")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/about-us`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("aboutUs")}
                </Link>
              </li>
              {/* <li>
                <Link
                  href={`/${locale}/blog`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("blog")}
                </Link>
              </li> */}
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">{t("legal")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/privacy-policy`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms-of-service`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("termsOfService")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} {config.appTitle}. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
