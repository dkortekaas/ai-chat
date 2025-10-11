// components/home/CTA.tsx
import Link from "next/link";
import { ArrowRight, Shield, CheckCircle, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CTA() {
  const t = useTranslations("cta");

  return (
    <section className="py-20 px-4 bg-indigo-600 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("title")}</h2>
        <p className="text-xl text-blue-100 mb-4 max-w-2xl mx-auto">
          {t("description")}
        </p>
        <p className="text-2xl font-semibold text-white mb-8">
          {t("free_trial")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/register"
            className="bg-white text-indigo-500 px-8 py-4 rounded-lg font-medium flex items-center justify-center hover:bg-indigo-50 transition-colors"
          >
            {t("cta")}
            <ArrowRight className="ml-2" size={20} />
          </Link>
          <Link
            href="mailto:hello@declair.app"
            className="border border-indigo-300 text-white px-8 py-4 rounded-lg font-medium flex items-center justify-center hover:bg-indigo-600 transition-colors"
          >
            {t("contact")}
          </Link>
        </div>
        <div className="flex items-center justify-center gap-8 text-sm text-blue-100">
          <div className="flex items-center">
            <Shield className="mr-2" size={16} />
            {t("secure")}
          </div>
          <div className="flex items-center">
            <CheckCircle className="mr-2" size={16} />
            {t("gdpr_compliant")}
          </div>
          <div className="flex items-center">
            <CreditCard className="mr-2" size={16} />
            {t("no_credit_card")}
          </div>
        </div>
      </div>
    </section>
  );
}
