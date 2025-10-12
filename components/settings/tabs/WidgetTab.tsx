"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Switch,
} from "@/components/ui";
import {
  Copy,
  Check,
  Monitor,
  Smartphone,
  Tablet,
  AlertTriangle,
  Trash2,
  Power,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface WidgetTabProps {
  onChanges: (hasChanges: boolean) => void;
}

export function WidgetTab({ onChanges }: WidgetTabProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const t = useTranslations();

  const widgetCode = `<script src='https://bot.eu.aichat.com/aichat_bot.js'></script>
<script>
window.bot = aichatBot({
  assistant: '6e60f1f5-dd54-4c50-844a-5de33234b1c5'
})
</script>`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(widgetCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleToggleEnabled = () => {
    setIsEnabled(!isEnabled);
    onChanges(true);
  };

  const handleDeleteAssistant = () => {
    // Here you would typically call an API to delete the assistant
    console.log("Deleting assistant...");
    setShowDeleteConfirm(false);
    onChanges(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {t("settings.widgetManagement")}
        </h3>
        <p className="text-sm text-gray-600">
          {t("settings.widgetManagementDescription")}
        </p>
      </div>

      {/* Installation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="w-5 h-5" />
            <span>{t("settings.installAssistantOnWebsite")}</span>
          </CardTitle>
          <CardDescription>
            {t("settings.installAssistantOnWebsiteDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre className="whitespace-pre-wrap">{widgetCode}</pre>
          </div>
          <Button
            onClick={handleCopyCode}
            className="bg-indigo-500 hover:bg-indigo-600"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                {t("settings.copied")}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                {t("settings.copyCode")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Enable/Disable Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Power className="w-5 h-5" />
            <span>{t("settings.enableDisableAssistant")}</span>
          </CardTitle>
          <CardDescription>
            {t("settings.enableDisableAssistantDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleEnabled}
                className="data-[state=checked]:bg-indigo-500"
              />
              <div>
                <p className="font-medium text-gray-900">
                  {isEnabled ? t("settings.enabled") : t("settings.disabled")}
                </p>
                <p className="text-sm text-gray-600">
                  {isEnabled
                    ? t("settings.assistantActiveAndVisibleOnWebsite")
                    : t("settings.assistantHiddenFromVisitors")}
                </p>
              </div>
            </div>
            <Badge
              variant={isEnabled ? "default" : "secondary"}
              className={isEnabled ? "bg-green-100 text-green-800" : ""}
            >
              {isEnabled ? t("settings.active") : t("settings.inactive")}
            </Badge>
          </div>

          {!isEnabled && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {t("settings.assistantDisabled")}
                  </p>
                  <p className="text-sm text-yellow-700">
                    {t("settings.assistantDisabledDescription")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.widgetPreview")}</CardTitle>
          <CardDescription>
            {t("settings.widgetPreviewDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                <Monitor className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {t("settings.desktop")}
              </p>
              <p className="text-xs text-gray-600">
                {t("settings.bottomRightCorner")}
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                <Tablet className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {t("settings.tablet")}
              </p>
              <p className="text-xs text-gray-600">
                {t("settings.responsivePositioning")}
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {t("settings.mobile")}
              </p>
              <p className="text-xs text-gray-600">
                {t("settings.fullScreenOverlay")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Section */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <Trash2 className="w-5 h-5" />
            <span>{t("settings.deleteAssistant")}</span>
          </CardTitle>
          <CardDescription>
            {t("settings.deleteAssistantDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t("settings.yesDeleteIt")}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {t("settings.thisActionCannotBeUndone")}
                    </p>
                    <p className="text-sm text-red-700">
                      {t(
                        "settings.allConversationsSettingsAndDataAssociatedWithThisAssistantWillBePermanentlyDeleted"
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="destructive" onClick={handleDeleteAssistant}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("common.confirm")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
