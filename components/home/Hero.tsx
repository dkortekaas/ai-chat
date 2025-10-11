"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle, Shield, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function Hero() {
  const params = useParams();
  const locale = params?.locale as string;
  const t = useTranslations("hero");

  return (
    <section className="pt-32 pb-20 px-4 text-center hero-gradient">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          {t("title")}
          <br />
          <span className="text-indigo-400">{t("subtitle")}</span>
        </h1>
        <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
          {t("description")}
        </p>
        <p className="text-lg text-indigo-400 font-medium mb-8">
          {t("free_trial")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href={`/register`}
            className="bg-indigo-500 hover:bg-indigo-600 text-white transition-colors duration-300 px-8 py-4 rounded-lg font-medium flex items-center justify-center"
          >
            {t("tryFree")}
            <ArrowRight className="ml-2" size={20} />
          </Link>
          <button
            disabled
            className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <PlayCircle className="mr-2" size={20} />
            {t("watchDemo")}
          </button>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-12">
          <div className="flex items-center">
            <Shield className="mr-2" size={16} />
            {t("secure")}
          </div>
          <div className="flex items-center">
            <CheckCircle className="mr-2" size={16} />
            {t("gdpr_compliant")}
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto mt-16">
          <div className="aspect-video bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <Image
              src="/screenprint.png"
              alt="Declair Dashboard"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
