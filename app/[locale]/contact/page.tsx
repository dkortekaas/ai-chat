"use client";

import Header from "@/components/site/Header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import React, { useState } from "react";
import Footer from "@/components/site/Footer";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import config from "@/config";

const ContactPage = () => {
  const t = useTranslations("contact");

  const contactMethods = [
    {
      icon: Mail,
      title: t("email"),
      description: config.email,
      action: t("sendEmail"),
    },
    // {
    //   icon: Phone,
    //   title: t("phone"),
    //   description: t("phoneDescription"),
    //   action: t("callUs"),
    //   disabled: true,
    // },
  ];

  const Contact = () => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      company: "",
      message: "",
    });
    const [errors, setErrors] = useState({
      name: "",
      email: "",
      company: "",
      message: "",
    });

    const validateEmail = (email: string) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    const validateForm = () => {
      const newErrors = {
        name: "",
        email: "",
        company: "",
        message: "",
      };

      if (!formData.name.trim()) {
        newErrors.name = t("nameRequired");
      }

      if (!formData.email.trim()) {
        newErrors.email = t("emailRequired");
      } else if (!validateEmail(formData.email)) {
        newErrors.email = t("emailInvalid");
      }

      if (!formData.company.trim()) {
        newErrors.company = t("companyRequired");
      }

      if (!formData.message.trim()) {
        newErrors.message = t("messageRequired");
      } else if (formData.message.trim().length < 10) {
        newErrors.message = t("messageTooShort");
      }

      setErrors(newErrors);
      return !Object.values(newErrors).some((error) => error !== "");
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to submit form");
        }

        toast({
          title: t("messageSent"),
          description: t("messageSentDescription"),
        });

        // Reset form
        setFormData({ name: "", email: "", company: "", message: "" });
        setErrors({ name: "", email: "", company: "", message: "" });
      } catch (error) {
        console.error("Error submitting contact form:", error);
        toast({
          title: t("errorSending") || "Error",
          description: t("errorSendingDescription") || "Failed to send your message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
      // Clear error when user starts typing
      if (errors[name as keyof typeof errors]) {
        setErrors({ ...errors, [name]: "" });
      }
    };

    return (
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-primary bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              {t("description")}
            </p>
          </div>
          {/* 
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <Card
                key={method.title}
                className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 mx-auto mb-4">
                    <method.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    variant={method.disabled ? "outline" : "gradient"}
                    size="sm"
                    disabled={method.disabled}
                    className="w-full"
                  >
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div> */}

          <Card className="max-w-3xl mx-auto border-2 shadow-xl">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">{t("sendMessage")}</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {t("sendMessageDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {t("name")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder={t("namePlaceholder")}
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t("email")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">
                    {t("company")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder={t("companyPlaceholder")}
                    value={formData.company}
                    onChange={handleChange}
                    className={errors.company ? "border-destructive" : ""}
                  />
                  {errors.company && (
                    <p className="text-sm text-destructive">{errors.company}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">
                    {t("message")} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder={t("messagePlaceholder")}
                    rows={10}
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? "border-destructive" : ""}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("sending") || "Versturen..." : t("send")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  };

  return <Contact />;
};
export default ContactPage;
