"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MessageSquare,
  Calendar,
  Database,
  Zap,
  Settings,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface IntegrationsTabProps {
  onChanges: (hasChanges: boolean) => void;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  configured: boolean;
  category: "communication" | "analytics" | "automation" | "data";
}

const availableIntegrations: Integration[] = [
  {
    id: "email",
    name: "Email Integration",
    description: "Send conversation summaries and notifications via email",
    icon: Mail,
    enabled: false,
    configured: false,
    category: "communication",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications in your Slack channels",
    icon: MessageSquare,
    enabled: false,
    configured: false,
    category: "communication",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description:
      "Schedule meetings and appointments directly from conversations",
    icon: Calendar,
    enabled: false,
    configured: false,
    category: "automation",
  },
  {
    id: "analytics",
    name: "Google Analytics",
    description: "Track chatbot performance and user interactions",
    icon: Database,
    enabled: false,
    configured: false,
    category: "analytics",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect with 5000+ apps and automate workflows",
    icon: Zap,
    enabled: false,
    configured: false,
    category: "automation",
  },
];

const categoryLabels = {
  communication: "Communication",
  analytics: "Analytics",
  automation: "Automation",
  data: "Data",
};

export function IntegrationsTab({ onChanges }: IntegrationsTabProps) {
  const [integrations, setIntegrations] = useState<Integration[]>(
    availableIntegrations
  );
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleToggleIntegration = (id: string) => {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === id
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    );
    onChanges(true);
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsConfiguring(true);
  };

  const handleSaveConfiguration = () => {
    if (selectedIntegration) {
      setIntegrations(
        integrations.map((integration) =>
          integration.id === selectedIntegration.id
            ? { ...integration, configured: true, enabled: true }
            : integration
        )
      );
      setIsConfiguring(false);
      setSelectedIntegration(null);
      onChanges(true);
    }
  };

  const groupedIntegrations = integrations.reduce(
    (acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = [];
      }
      acc[integration.category].push(integration);
      return acc;
    },
    {} as Record<string, Integration[]>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Available Integrations
        </h3>
        <p className="text-sm text-gray-600">
          Connect with third-party services and tools to extend your
          chatbot&apos;s capabilities
        </p>
      </div>

      {/* Integration Categories */}
      {Object.entries(groupedIntegrations).map(
        ([category, categoryIntegrations]) => (
          <div key={category} className="space-y-4">
            <h4 className="text-md font-medium text-gray-800">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h4>
            <div className="grid gap-4">
              {categoryIntegrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <Card key={integration.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {integration.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {integration.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {integration.configured ? (
                                <Badge
                                  variant="default"
                                  className="bg-green-100 text-green-800"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Configured
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Not configured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {integration.configured ? (
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={integration.enabled}
                                onCheckedChange={() =>
                                  handleToggleIntegration(integration.id)
                                }
                                className="data-[state=checked]:bg-indigo-500"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleConfigureIntegration(integration)
                                }
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() =>
                                handleConfigureIntegration(integration)
                              }
                              className="bg-indigo-500 hover:bg-indigo-600"
                            >
                              Configure
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Configuration Dialog */}
      {isConfiguring && selectedIntegration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <selectedIntegration.icon className="w-5 h-5" />
              <span>Configure {selectedIntegration.name}</span>
            </CardTitle>
            <CardDescription>{selectedIntegration.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedIntegration.id === "email" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input id="smtp-host" placeholder="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input id="smtp-port" placeholder="587" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-username">Username</Label>
                  <Input id="email-username" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-password">Password</Label>
                  <Input
                    id="email-password"
                    type="password"
                    placeholder="Your password"
                  />
                </div>
              </div>
            )}

            {selectedIntegration.id === "slack" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                  <Input
                    id="slack-webhook"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slack-channel">Default Channel</Label>
                  <Input id="slack-channel" placeholder="#general" />
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Setup Instructions:</strong> Go to your Slack
                    workspace settings, create a new webhook, and paste the URL
                    above.
                  </p>
                </div>
              </div>
            )}

            {selectedIntegration.id === "analytics" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ga-tracking-id">
                    Google Analytics Tracking ID
                  </Label>
                  <Input id="ga-tracking-id" placeholder="GA-XXXXXXXXX-X" />
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Setup Instructions:</strong> Create a Google
                    Analytics property and copy the tracking ID from your GA4
                    dashboard.
                  </p>
                </div>
              </div>
            )}

            {selectedIntegration.id === "zapier" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zapier-webhook">Zapier Webhook URL</Label>
                  <Input
                    id="zapier-webhook"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                  />
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Setup Instructions:</strong> Create a new Zap in
                    Zapier, choose &quot;Webhooks&quot; as the trigger, and copy
                    the webhook URL.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsConfiguring(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveConfiguration}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Having trouble setting up an integration? Check out our
            documentation or contact support.
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Documentation
            </Button>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
