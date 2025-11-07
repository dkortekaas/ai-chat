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
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      company: "",
      message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      // Simple validation
      if (!formData.name || !formData.email || !formData.message) {
        toast({
          title: t("missingFields"),
          description: t("missingFieldsDescription"),
          variant: "destructive",
        });
        return;
      }

      // In a real app, this would send to a backend
      toast({
        title: t("messageSent"),
        description: t("messageSentDescription"),
      });

      // Reset form
      setFormData({ name: "", email: "", company: "", message: "" });
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
            <CardHeader>
              <CardTitle className="text-2xl">{t("sendMessage")}</CardTitle>
              <CardDescription>{t("sendMessageDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
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
                      required
                    />
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
                      required
                    />
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
                    required
                  />
                </div>
                <Textarea
                  id="message"
                  name="message"
                  placeholder={t("messagePlaceholder")}
                  rows={10}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                >
                  {t("send")}
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
