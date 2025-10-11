"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast, useToast } from "@/components/ui/use-toast";

export function AddCompanyForm() {
  const t = useTranslations();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    vatNumber: "",
    address: "",
    zipCode: "",
    city: "",
    country: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("error.somethingWentWrong"));
      }

      toast({
        title: t("success.createCompanySuccess"),
        variant: "success",
        duration: 3000,
      });
      router.refresh();
      setFormData({
        name: "",
        vatNumber: "",
        address: "",
        zipCode: "",
        city: "",
        country: "",
      });
    } catch (error) {
      console.error("Error creating company:", error);
      toast({
        title: t("error.unknownError"),
        variant: "destructive",
        description:
          error instanceof Error ? error.message : t("error.unknownError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            {t("admin.companies.name")} *
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            required
            className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-declair-blue-500 focus:outline-none focus:ring-declair-blue-500 sm:text-sm h-10'
          />
        </div>

        <div className='flex flex-col h-full'>
          <label
            htmlFor='vatNumber'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            {t("admin.companies.vatNumber")}
          </label>
          <input
            type='text'
            id='vatNumber'
            name='vatNumber'
            value={formData.vatNumber}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-declair-blue-500 focus:outline-none focus:ring-declair-blue-500 sm:text-sm h-10'
          />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-6'>
        <div className='flex flex-col h-full'>
          <label
            htmlFor='address'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            {t("admin.companies.address")}
          </label>
          <input
            type='text'
            id='address'
            name='address'
            value={formData.address}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-declair-blue-500 focus:outline-none focus:ring-declair-blue-500 sm:text-sm h-10'
          />
        </div>

        <div className='flex flex-col h-full'>
          <label
            htmlFor='zipCode'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            {t("admin.companies.zipCode")}
          </label>
          <input
            type='text'
            id='zipCode'
            name='zipCode'
            value={formData.zipCode}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-declair-blue-500 focus:outline-none focus:ring-declair-blue-500 sm:text-sm h-10'
          />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-6'>
        <div className='flex flex-col h-full'>
          <label
            htmlFor='city'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            {t("admin.companies.city")}
          </label>
          <input
            type='text'
            id='city'
            name='city'
            value={formData.city}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-declair-blue-500 focus:outline-none focus:ring-declair-blue-500 sm:text-sm h-10'
          />
        </div>

        <div className='flex flex-col h-full'>
          <label
            htmlFor='country'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            {t("admin.companies.country")}
          </label>
          <input
            type='text'
            id='country'
            name='country'
            value={formData.country}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-declair-blue-500 focus:outline-none focus:ring-declair-blue-500 sm:text-sm h-10'
          />
        </div>
      </div>

      <div className='flex justify-end'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='inline-flex justify-center rounded-md border border-transparent bg-declair-blue-400 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-declair-blue-500 focus:outline-none focus:ring-2 focus:ring-declair-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting ? t("common.status.processing") : t("actions.create")}
        </button>
      </div>
    </form>
  );
}
