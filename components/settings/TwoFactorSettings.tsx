// components/settings/TwoFactorSettings.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Smartphone, Calendar, AlertTriangle } from "lucide-react";
import TwoFactorSetup from "@/components/auth/TwoFactorSetup";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";

type TrustedDevice = {
  id: string;
  deviceName: string | null;
  lastUsedAt: Date;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
};

type TwoFactorSettingsProps = {
  user: {
    id: string;
    twoFactorEnabled: boolean;
  };
  companyRequires2FA?: boolean;
};

export default function TwoFactorSettings({
  user,
  companyRequires2FA = false,
}: TwoFactorSettingsProps) {
  const t = useTranslations();
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(
    user.twoFactorEnabled
  );
  const [showSetup, setShowSetup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState<boolean>(false);

  useEffect(() => {
    // Update state if props change
    setIs2FAEnabled(user.twoFactorEnabled);
  }, [user.twoFactorEnabled]);

  const loadTrustedDevices = useCallback(async () => {
    if (!is2FAEnabled) return;

    setIsLoadingDevices(true);
    try {
      const response = await fetch("/api/auth/trusted-devices");

      if (!response.ok) {
        throw new Error(t("error.errorLoadingDevices"));
      }

      const data = await response.json();
      setTrustedDevices(data.devices || []);
    } catch (error) {
      console.error("Error loading trusted devices:", error);
      toast({
        title: t("error.errorLoadingDevices"),
        description: t("error.errorLoadingDevicesDescription"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoadingDevices(false);
    }
  }, [is2FAEnabled, t]);

  useEffect(() => {
    loadTrustedDevices();
  }, [loadTrustedDevices]);

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/auth/trusted-devices/${deviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast({
          title: t("error.errorRemovingDevice"),
          description: t("error.errorRemovingDeviceDescription"),
          variant: "destructive",
          duration: 3000,
        });
      }

      // Remove device from list
      setTrustedDevices((prev) =>
        prev.filter((device) => device.id !== deviceId)
      );
      toast({
        title: t("success.deviceRemovedSuccessfully"),
        description: t("success.deviceRemovedSuccessfullyDescription"),
        variant: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error removing trusted device:", error);
      toast({
        title: t("error.errorRemovingDevice"),
        description: t("error.errorRemovingDeviceDescription"),
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleDisable2FA = async () => {
    if (!password) {
      toast({
        title: t("error.passwordRequired"),
        description: t("error.passwordRequiredDescription"),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast({
          title: t("error.errorDisabling2FA"),
          description: data.error || t("error.errorDisabling2FADescription"),
          variant: "destructive",
          duration: 3000,
        });
        throw new Error(data.error || t("error.errorDisabling2FA"));
      }

      setIs2FAEnabled(false);
      setShowDisableConfirm(false);
      setPassword("");
      toast({
        title: t("success.twoFactorDisabledSuccessfully"),
        description: t("success.twoFactorDisabledSuccessfullyDescription"),
        variant: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      toast({
        title:
          error instanceof Error ? error.message : t("error.errorDisabling2FA"),
        description: t("error.errorDisabling2FADescription"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date to human-readable string
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get device name from user agent if not available
  const getDeviceName = (device: TrustedDevice): string => {
    if (device.deviceName) return device.deviceName;

    if (device.userAgent) {
      if (
        device.userAgent.includes("iPhone") ||
        device.userAgent.includes("iPad")
      ) {
        return device.userAgent.includes("iPad") ? "iPad" : "iPhone";
      } else if (device.userAgent.includes("Android")) {
        return t("androidDevice");
      } else if (device.userAgent.includes("Windows")) {
        return t("windowsPC");
      } else if (device.userAgent.includes("Mac")) {
        return t("macDevice");
      } else if (device.userAgent.includes("Linux")) {
        return t("linuxPC");
      }
    }

    return t("unknownDevice");
  };

  const renderTrustedDevices = () => {
    if (isLoadingDevices) {
      return (
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex items-center justify-between py-3'>
              <div className='flex items-center space-x-3'>
                <Skeleton className='h-5 w-5 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-3 w-24' />
                </div>
              </div>
              <Skeleton className='h-8 w-20' />
            </div>
          ))}
        </div>
      );
    }

    if (trustedDevices.length === 0) {
      return (
        <div className='text-sm text-gray-500'>
          {t("settings.noTrustedDevices")}
        </div>
      );
    }

    return (
      <div className='mt-4 divide-y divide-gray-200'>
        {trustedDevices.map((device) => (
          <div
            key={device.id}
            className='py-3 flex justify-between items-center'
          >
            <div>
              <div className='flex items-center'>
                <Smartphone className='h-5 w-5 text-gray-400 mr-2' />
                <span className='text-sm font-medium text-gray-900'>
                  {getDeviceName(device)}
                </span>
              </div>
              <div className='mt-1 flex items-center text-xs text-gray-500'>
                <Calendar className='h-4 w-4 mr-1' />
                <span>
                  {t("settings.expiresOn")} {formatDate(device.expiresAt)}
                </span>
              </div>
            </div>
            <Button
              variant='ghost'
              onClick={() => handleRemoveDevice(device.id)}
              className='text-red-600 hover:text-red-900'
            >
              {t("settings.removeDevice")}
            </Button>
          </div>
        ))}
      </div>
    );
  };

  if (showSetup) {
    return <TwoFactorSetup />;
  }

  return (
    <ErrorBoundary
      fallback={
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <div className='ml-2'>
            <h3 className='text-sm font-medium'>
              {t("error.errorLoading2FASettings")}
            </h3>
            <AlertDescription>
              {t("error.errorLoading2FASettingsDescription")}
            </AlertDescription>
          </div>
        </Alert>
      }
    >
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='rounded-full bg-declair-blue-50 dark:bg-declair-blue-900 p-3 mr-4'>
                <Shield className='h-6 w-6 text-declair-blue-400 dark:text-declair-blue-400' />
              </div>
              <div>
                <CardTitle>{t("settings.twoFactorAuthentication")}</CardTitle>
                <CardDescription>
                  {t("settings.twoFactorAuthenticationDescription")}
                </CardDescription>
              </div>
            </div>
            <div>
              {is2FAEnabled ? (
                <Badge variant='success' className='text-sm font-medium'>
                  {t("common.enabled")}
                </Badge>
              ) : (
                <Badge variant='destructive' className='text-sm font-medium'>
                  {t("common.disabled")}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {companyRequires2FA && !is2FAEnabled && (
            <Alert variant='default' className='mb-4'>
              <AlertTriangle className='h-4 w-4' />
              <div className='ml-2'>
                <h3 className='text-sm font-medium'>
                  {t("settings.twoFactorAuthenticationRequired")}
                </h3>
                <AlertDescription>
                  {t("settings.twoFactorAuthenticationRequiredDescription")}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {!is2FAEnabled ? (
            <div className='mt-6'>
              <Button
                className='bg-declair-blue-400 hover:bg-declair-blue-500'
                onClick={() => setShowSetup(true)}
              >
                <Smartphone className='mr-2 h-4 w-4' />
                {t("settings.enable2FA")}
              </Button>
            </div>
          ) : (
            <>
              {/* Trusted Devices Section */}
              <div className='mt-6 border-t border-gray-200 dark:border-gray-700 pt-6'>
                <h4 className='text-base font-medium text-gray-900 dark:text-white'>
                  {t("settings.trustedDevices")}
                </h4>
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
                  {t("settings.trustedDevicesDescription")}
                </p>
                {renderTrustedDevices()}
              </div>

              {/* Disable 2FA Section */}
              {!companyRequires2FA && (
                <div className='mt-6 border-t border-gray-200 dark:border-gray-700 pt-6'>
                  <h4 className='text-base font-medium text-gray-900 dark:text-white'>
                    {t("settings.disable2FA")}
                  </h4>
                  <p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
                    {t("settings.disable2FADescription")}
                  </p>

                  {!showDisableConfirm ? (
                    <Button
                      variant='destructive'
                      onClick={() => setShowDisableConfirm(true)}
                    >
                      {t("settings.disable2FA")}
                    </Button>
                  ) : (
                    <div className='bg-red-50 dark:bg-red-900/30 p-4 rounded-md'>
                      <h5 className='text-sm font-medium text-red-800 dark:text-red-200 mb-2'>
                        {t("settings.disable2FAConfirmation")}
                      </h5>
                      <p className='text-xs text-red-700 dark:text-red-300 mb-4'>
                        {t("settings.disable2FAConfirmationDescription")}
                      </p>
                      <div className='flex items-center gap-2'>
                        <Input
                          type='password'
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t("settings.passwordPlaceholder")}
                          className='flex-1'
                        />
                        <Button
                          onClick={handleDisable2FA}
                          disabled={isLoading || !password}
                          variant='destructive'
                        >
                          {isLoading
                            ? t("common.loading")
                            : t("common.confirm")}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowDisableConfirm(false);
                            setPassword("");
                          }}
                          variant='outline'
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
