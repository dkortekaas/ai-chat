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
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <Image
              src={config.appLogo}
              alt={config.appTitle}
              className="h-20 sm:h-28 w-auto object-contain"
              width={100}
              height={100}
            />
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("description")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">
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
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">
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
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">
              {t("legal")}
            </h4>
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

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-muted-foreground">
          <p>
            © {currentYear} {config.appTitle}. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
