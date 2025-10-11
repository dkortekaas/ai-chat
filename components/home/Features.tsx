// components/home/Features.tsx
"use client";

import {
  Clock,
  CheckCircle,
  PieChart,
  Shield,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { useTranslations } from "next-intl";

const featureIcons = [
  Clock,
  CheckCircle,
  PieChart,
  Shield,
  Smartphone,
  CreditCard,
];

export default function Features() {
  const t = useTranslations("features");

  return (
    <section id='features' className='py-20 px-4'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            {t("title")}
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            {t("subtitle")}
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {Array.from({ length: 6 }).map((_, index) => {
            const Icon = featureIcons[index];
            return (
              <div
                key={index}
                className='feature-card p-6 bg-white rounded-lg border border-gray-200'
              >
                <div className='w-12 h-12 bg-declair-blue-50 rounded-lg flex items-center justify-center mb-4'>
                  <Icon className='text-declair-blue-400' size={24} />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  {t(`items.${index}.title`)}
                </h3>
                <p className='text-gray-600'>
                  {t(`items.${index}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
