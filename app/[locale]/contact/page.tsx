"use client";

import Header from "@/components/home/Header";
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
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import React, { useState } from "react";
import Footer from "@/components/home/Footer";
import { toast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";

const Contact = () => {
  const t = useTranslations("contact");
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    company: string;
    message: string;
  }>({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t("message_sent_title"),
      description: t("message_sent_description"),
      variant: "success",
    });
    setFormData({ name: "", email: "", company: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t("email"),
      content: t("email_content"),
      link: `mailto:${t("email_content")}`,
    },
    {
      icon: Phone,
      title: t("phone"),
      content: t("phone_content"),
      link: `tel:${t("phone_content")}`,
    },
    {
      icon: MapPin,
      title: t("address"),
      content: t("address_content"),
      link: null,
    },
    {
      icon: Clock,
      title: t("hours"),
      content: t("hours_content"),
      link: null,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                {t("contact_title")}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t("contact_description")}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
              {/* Contact Form */}
              <div className="animate-fade-in-up">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {t("contact_form_title")}
                    </CardTitle>
                    <CardDescription>
                      {t("contact_form_description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("name")} *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">{t("email")} *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">{t("company")}</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              company: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">{t("message")} *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          required
                          rows={5}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark"
                      >
                        {t("send_message")}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div
                className="space-y-6 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    {t("contact_info_title")}
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    {t("contact_info_description")}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {contactInfo.map((info) => (
                    <Card key={info.title}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <info.icon
                              className="w-6 h-6 text-primary"
                              aria-hidden="true"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{info.title}</h3>
                            {info.link ? (
                              <a
                                href={info.link}
                                className="text-muted-foreground hover:text-primary transition-colors"
                              >
                                {info.content}
                              </a>
                            ) : (
                              <p className="text-muted-foreground">
                                {info.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {/* 
                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-2">
                      {t("plan_demo_title")}
                    </h3>
                    <p className="mb-4 opacity-90">
                      {t("plan_demo_description")}
                    </p>
                    <Button
                      variant="secondary"
                      className="bg-white hover:bg-white/90 text-primary"
                    >
                      {t("plan_demo_button")}
                    </Button>
                  </CardContent>
                </Card> */}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact - AI Flow",
            description:
              "Neem contact op met AI Flow voor vragen over onze AI chat oplossing",
          }),
        }}
      />
    </div>
  );
};

export default Contact;
