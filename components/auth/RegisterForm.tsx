"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { debounce } from "lodash";
import config from "@/config";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import RequiredIndicator from "@/components/ui/RequiredIndicator";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!token);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const t = useTranslations();

  const registerSchema = z
    .object({
      name: z
        .string()
        .min(1, { message: t("error.nameRequired") })
        .max(100, {
          message: t("error.nameTooLong"),
        }),
      email: z.string().email({ message: t("error.emailInvalid") }),
      password: z
        .string()
        .min(6, { message: t("error.passwordInvalid") })
        .max(128, { message: t("error.passwordTooLong") }),
      confirmPassword: z
        .string()
        .min(6, { message: t("error.passwordInvalid") }),
      companyName: z.string().optional(),
      token: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("error.passwordMismatch"),
      path: ["confirmPassword"],
    })
    .refine(
      (data) => {
        if (!data.token) {
          return data.companyName && data.companyName.length > 0;
        }
        return true;
      },
      {
        message: t("error.companyRequired"),
        path: ["companyName"],
      }
    );

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      token: token || undefined,
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) return;

      try {
        const response = await fetch(`/api/auth/invitation?token=${token}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(t("error.invalidOrExpiredInvitation"));
        }

        const data = await response.json();
        form.setValue("email", data.email, { shouldValidate: true });
        if (data.company?.name) {
          form.setValue("companyName", data.company.name, {
            shouldValidate: true,
          });
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : t("error.generic"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token, form, t]);

  const debouncedSubmit = useCallback(
    async (data: RegisterFormValues) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const responseData = await response.json();
          const errorMap: Record<string, string> = {
            EmailInUse: t("error.emailInUse"),
            InvalidToken: t("error.invalidOrExpiredInvitation"),
            default: t("error.generic"),
          };
          throw new Error(responseData.message || errorMap.default);
        }

        router.push("/login?registered=true");
      } catch (error) {
        setError(error instanceof Error ? error.message : t("error.generic"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, t, setIsSubmitting, setError]
  );

  const onSubmit = (data: RegisterFormValues) => {
    debounce(debouncedSubmit, 500)(data);
  };

  // Simple password strength check
  const getPasswordStrength = (password: string) => {
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const strength = [hasLength, hasUpperCase, hasNumber].filter(
      Boolean
    ).length;
    return strength >= 3
      ? t("auth.passwordStrength.strong")
      : strength >= 2
        ? t("auth.passwordStrength.medium")
        : t("auth.passwordStrength.weak");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 sm:px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-indigo-400 dark:text-indigo-400">
            {config.appTitle}
          </CardTitle>
          <CardDescription className="text-base sm:text-lg">
            {t("auth.register.title")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-6"
              aria-label={t("auth.register.title")}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("auth.name")}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormMessage />
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting || isLoading}
                        autoFocus
                        aria-required="true"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("auth.email")}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormMessage />
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        disabled={isSubmitting || isLoading || !!token}
                        aria-required="true"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!token && (
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("auth.companyName")}
                        <RequiredIndicator />
                      </FormLabel>
                      <FormMessage />
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting || isLoading}
                          aria-required="true"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("auth.password")}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormMessage />
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          disabled={isSubmitting || isLoading}
                          aria-required="true"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword
                              ? t("auth.hidePassword")
                              : t("auth.showPassword")
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    {field.value && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("auth.passwordStrength.label")}:{" "}
                        {getPasswordStrength(field.value)}
                      </p>
                    )}
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
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          disabled={isSubmitting || isLoading}
                          aria-required="true"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={
                            showConfirmPassword
                              ? t("auth.hidePassword")
                              : t("auth.showPassword")
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600"
                disabled={isSubmitting || isLoading || !form.formState.isValid}
                aria-label={t("auth.register.registerButton")}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("actions.loading")}
                  </>
                ) : (
                  t("auth.register.registerButton")
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {t("auth.register.alreadyAccount")}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/login")}
                disabled={isSubmitting || isLoading}
                aria-label={t("auth.register.loginButton")}
              >
                {t("auth.register.loginButton")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
