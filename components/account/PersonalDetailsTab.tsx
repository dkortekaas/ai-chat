"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export function PersonalDetailsTab() {
  const [firstName, setFirstName] = useState("Dennis");
  const [lastName, setLastName] = useState("Kortekaas");
  const t = useTranslations("account");

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving personal details:", { firstName, lastName });
  };

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          {t("personalDetails")}
        </h2>

        <div className="space-y-4">
          <div>
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700"
            >
              {t("firstName")} *
            </Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-700"
            >
              {t("lastName")} *
            </Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleSave}
            className="bg-indigo-500 border border-gray-300 text-white hover:bg-indigo-600"
          >
            {t("save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
