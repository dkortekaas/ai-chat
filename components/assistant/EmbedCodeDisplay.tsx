"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Code } from "lucide-react";

export function EmbedCodeDisplay() {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  // Mock embed code - replace with actual generated code
  const embedCode = `<!-- AI Flow Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    script.setAttribute('data-chatbot-id', 'your-chatbot-id');
    script.setAttribute('data-position', 'bottom-right');
    script.setAttribute('data-color', '#3B82F6');
    document.head.appendChild(script);
  })();
</script>
<!-- End AI Flow Widget -->`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>{t("assistants.embedCode")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            {t("assistants.embedCodeDescription")}
          </p>

          <div className="relative">
            <Textarea
              value={embedCode}
              readOnly
              className="font-mono text-xs min-h-[200px] resize-none"
            />
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-3 w-3" />
                  {t("assistants.copied")}
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-3 w-3" />
                  {t("assistants.copy")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("assistants.installationInstructions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">{t("assistants.step1Title")}</h4>
                <p className="text-sm text-gray-600">
                  {t("assistants.step1Description")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">{t("assistants.step2Title")}</h4>
                <p className="text-sm text-gray-600">
                  {t("assistants.step2Description")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">{t("assistants.step3Title")}</h4>
                <p className="text-sm text-gray-600">
                  {t("assistant.step3Description")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
