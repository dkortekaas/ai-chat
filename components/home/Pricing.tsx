// components/home/Pricing.tsx
"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function Pricing() {
  const params = useParams();
  const locale = params?.locale as string;
  const t = useTranslations("pricing");

  const plans = ["starter", "professional", "enterprise"];

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan}
              className={`relative p-8 rounded-lg border ${
                plan === "professional"
                  ? "border-primary bg-indigo-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan === "professional" && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  {t("popular")}
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t(`plans.${plan}.name`)}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t(`plans.${plan}.description`)}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">
                    {t(`plans.${plan}.price`)}
                  </span>
                  <span className="text-gray-600 ml-1">
                    {t(`plans.${plan}.period`)}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {t
                  .raw(`plans.${plan}.features`)
                  .map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check
                        size={16}
                        className={`mr-3 ${
                          plan === "professional"
                            ? "text-indigo-400"
                            : "text-green-600"
                        }`}
                      />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
              </ul>

              <Link
                href={`/${locale}${t(`plans.${plan}.href`)}`}
                className={`w-full block text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan === "professional"
                    ? "bg-primary hover:bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {t(`plans.${plan}.cta`)}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
