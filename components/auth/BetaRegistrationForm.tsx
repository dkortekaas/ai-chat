"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import config from "@/config";
import { useSession } from "next-auth/react";
import Script from "next/script";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

export default function BetaRegistrationForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);
  const t = useTranslations();
  const { data: session } = useSession();

  useEffect(() => {
    const checkRecaptcha = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsRecaptchaReady(true);
        });
      } else {
        // If grecaptcha is not available yet, check again after a short delay
        setTimeout(checkRecaptcha, 100);
      }
    };

    checkRecaptcha();
  }, []);

  const betaRegistrationSchema = z.object({
    companyName: z.string().min(2, { message: t("error.companyNameMin") }),
    email: z.string().email({ message: t("error.emailInvalid") }),
    _honeypot: z.string().length(0),
  });

  type BetaRegistrationFormValues = z.infer<typeof betaRegistrationSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BetaRegistrationFormValues>({
    resolver: zodResolver(betaRegistrationSchema),
    defaultValues: {
      companyName: "",
      email: "",
      _honeypot: "",
    },
  });

  const onSubmit = async (data: BetaRegistrationFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
        throw new Error("reCAPTCHA site key is not configured");
      }

      if (!isRecaptchaReady) {
        throw new Error("reCAPTCHA is not ready yet");
      }

      // Get reCAPTCHA token
      const recaptchaToken = await window.grecaptcha.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        { action: "beta_registration" }
      );

      const response = await fetch("/api/auth/beta-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": session?.csrfToken || "",
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || t("error.betaRegistration"));
      }

      setSuccess(t("success.betaRegistration"));
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error ? error.message : t("error.betaRegistration")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy='afterInteractive'
        onLoad={() => {
          if (window.grecaptcha) {
            window.grecaptcha.ready(() => {
              setIsRecaptchaReady(true);
            });
          }
        }}
        onError={() => setError("Failed to load reCAPTCHA")}
      />
      <div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4 sm:px-6'>
        <div className='bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md mx-auto'>
          <div className='text-center mb-6 sm:mb-8'>
            <h2 className='text-2xl sm:text-3xl font-bold text-declair-blue-400 dark:text-declair-blue-400 mb-2'>
              {config.appTitle}
            </h2>
            <p className='text-base sm:text-lg text-gray-600 dark:text-gray-300'>
              {t("auth.betaRegistration.title")}
            </p>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
              {t("auth.betaRegistration.description")}
            </p>
          </div>

          {error && (
            <div className='bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4 text-sm sm:text-base'>
              {error}
            </div>
          )}

          {success && (
            <div className='bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded mb-4 text-sm sm:text-base'>
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-4 sm:space-y-6'
          >
            {/* Honeypot field - hidden from users */}
            <div style={{ display: "none" }}>
              <input
                type='text'
                {...register("_honeypot")}
                tabIndex={-1}
                autoComplete='off'
              />
            </div>

            <div>
              <label
                htmlFor='companyName'
                className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'
              >
                {t("auth.betaRegistration.companyName")}
              </label>
              <input
                type='text'
                id='companyName'
                {...register("companyName")}
                className={`w-full p-2 sm:p-3 border ${
                  errors.companyName
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-md focus:ring-declair-blue-400 focus:border-declair-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base`}
                disabled={isLoading}
              />
              {errors.companyName && (
                <p className='mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400'>
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'
              >
                {t("auth.betaRegistration.email")}
              </label>
              <input
                type='email'
                id='email'
                {...register("email")}
                className={`w-full p-2 sm:p-3 border ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-md focus:ring-declair-blue-400 focus:border-declair-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className='mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <button
                type='submit'
                className='w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-declair-blue-400 hover:bg-declair-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-declair-blue-400 disabled:opacity-50'
                disabled={isLoading}
              >
                {isLoading
                  ? t("common.status.processing")
                  : t("actions.register")}
              </button>
            </div>
          </form>

          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300 dark:border-gray-600'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'>
                  {t("auth.betaRegistration.or")}
                </span>
              </div>
            </div>

            <div className='mt-6'>
              <button
                onClick={() => router.push("/")}
                className='w-full flex justify-center py-2 sm:py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-declair-blue-400'
                disabled={isLoading}
              >
                {t("auth.betaRegistration.backToLogin")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
