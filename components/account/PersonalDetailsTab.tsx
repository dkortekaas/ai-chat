"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SaveButton,
} from "@/components/ui";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";

export function PersonalDetailsTab() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations();

  // Zod schema for validation
  const personalDetailsSchema = z.object({
    firstName: z
      .string()
      .min(1, { message: t("error.firstNameRequired") })
      .max(50, { message: t("error.firstNameTooLong") }),
    lastName: z
      .string()
      .max(50, { message: t("error.lastNameTooLong") })
      .optional(),
  });

  // React Hook Form setup
  const form = useForm<z.infer<typeof personalDetailsSchema>>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  // Get user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/users/profile");
        if (response.ok) {
          const userData = await response.json();
          if (userData.name) {
            const nameParts = userData.name.split(" ");
            form.setValue("firstName", nameParts[0] || "");
            form.setValue("lastName", nameParts.slice(1).join(" ") || "");
          }
        } else {
          toast({
            title: t("error.error"),
            description: t("error.couldNotFetchUserData"),
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: t("error.error"),
          description: t("error.errorFetchingUserData"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session?.user?.id, t, toast, form]);

  const onSubmit = async (data: z.infer<typeof personalDetailsSchema>) => {
    setIsSaving(true);

    try {
      const fullName =
        `${data.firstName.trim()} ${data.lastName?.trim() || ""}`.trim();

      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
        }),
      });

      if (response.ok) {
        toast({
          title: t("common.success"),
          description: t("success.personalDetailsSaved"),
          variant: "success",
        });

        // Update session with new name
        await update({
          user: {
            ...session?.user,
            name: fullName,
          },
        });
      } else {
        const errorData = await response.json();
        toast({
          title: t("error.error"),
          description: errorData.error || t("error.errorSavingPersonalDetails"),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: t("error.error"),
        description: t("error.errorSavingPersonalDetails"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          {t("account.personalDetails")}
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("account.firstName")} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      className="mt-1"
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("account.lastName")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      className="mt-1"
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <SaveButton type="submit" disabled={isSaving}>
                {isSaving ? "Opslaan..." : t("common.save")}
              </SaveButton>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
