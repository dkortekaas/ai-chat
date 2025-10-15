"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui";
import Link from "next/link";
import { useTranslations } from "next-intl";
import config from "@/config";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import RequiredIndicator from "@/components/ui/RequiredIndicator";

export function ResetPasswordForm({ token }: { token?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  const formSchema = z
    .object({
      password: z.string().min(8, t("error.passwordInvalid")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("error.passwordMismatch"),
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  if (!token) {
    toast({
      title: t("error.invalidLink"),
      variant: "destructive",
      duration: 3000,
    });

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-indigo-400 dark:text-indigo-400 mb-2">
              {config.appTitle}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              {t("auth.resetpassword.title")}
            </p>
          </div>
          <Alert
            variant="destructive"
            className="dark:bg-red-900 dark:border-red-700 dark:text-red-200 text-sm sm:text-base"
          >
            <AlertDescription>{t("error.invalidLink")}</AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Link href="/forgot-password">
              <Button className="w-full bg-indigo-500 hover:bg-indigo-600">
                {t("auth.resetpassword.forgotPassword")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password: values.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: data.error || t("error.generic"),
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      toast({
        title: t("success.resetPassword"),
        variant: "success",
        duration: 3000,
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : t("error.generic"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4 sm:px-6">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-indigo-400 dark:text-indigo-400 mb-2">
            {config.appTitle}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            {t("auth.resetpassword.title")}
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-6"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("auth.newPassword")}
                    <RequiredIndicator />
                  </FormLabel>
                  <FormMessage />
                  <FormControl>
                    <Input type="password" {...field} disabled={isLoading} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("auth.confirmPassword")}
                    <RequiredIndicator />
                  </FormLabel>
                  <FormMessage />
                  <FormControl>
                    <Input type="password" {...field} disabled={isLoading} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600"
              disabled={isLoading}
            >
              {isLoading
                ? t("common.statuses.loading")
                : t("auth.resetpassword.submitButton")}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => router.push("/login")}
            className="w-full"
            disabled={isLoading}
          >
            {t("auth.resetpassword.backToLogin")}
          </Button>
        </div>
      </div>
    </div>
  );
}
