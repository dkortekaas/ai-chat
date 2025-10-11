"use client";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
interface StatCardProps {
  title: string;
  value: number;
  change: number;
  isPositive: boolean;
  isCurrency?: boolean;
}

/**
 * StatCard component voor het weergeven van statistieken
 * @component
 * @param {StatCardProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export default function StatCard({
  title,
  value,
  change,
  isPositive,
  isCurrency = false,
}: StatCardProps) {
  const locale = useLocale();
  const t = useTranslations("dashboard");

  // Format value based on whether it's a currency
  const formattedValue = isCurrency
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
      }).format(value)
    : value.toLocaleString(locale);

  return (
    <div className='bg-white rounded-lg shadow-sm p-5 border border-gray-100'>
      <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <h3 className='text-sm font-medium text-gray-500'>{title}</h3>
      </div>
      <div className='mt-2 text-2xl font-semibold text-gray-900'>
        {formattedValue}
      </div>
      <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
        {isPositive ? (
          <ArrowUpIcon className='h-4 w-4 text-green-500' />
        ) : (
          <ArrowDownIcon className='h-4 w-4 text-red-500' />
        )}
        <span
          className={isPositive ? "text-green-500" : "text-red-500"}
        >{`${Math.abs(change).toFixed(1)}%`}</span>
        <span>{t("stats.vsPreviousPeriod")}</span>
      </div>
    </div>
  );
}
