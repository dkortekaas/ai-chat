"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import {
  Plus,
  ChevronDown,
  MoreVertical,
  Check,
  Users,
  Mail,
  Pencil,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { InviteTeamMemberModal } from "@/components/team/InviteTeamMemberModal";
import { InvitationsList } from "@/components/team/InvitationsList";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/lib/logger";
import { TeamMember } from "@/types/account";

export function TeamTab() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterJoined, setFilterJoined] = useState(false);
  const [filterLastLogin, setFilterLastLogin] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "invitations">(
    "members"
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const t = useTranslations();

  const setupCompany = async () => {
    try {
      const response = await fetch("/api/team/setup-company", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to setup company");
      }
      return true;
    } catch (error) {
      logger.error("Error setting up company:", {
        context: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return false;
    }
  };

  const fetchTeamMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/team/members");
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else if (response.status === 400) {
        // User not associated with a company, try to setup one
        const setupSuccess = await setupCompany();
        if (setupSuccess) {
          // Retry fetching team members
          const retryResponse = await fetch("/api/team/members");
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setMembers(data.members || []);
          } else {
            throw new Error("Failed to fetch team members after setup");
          }
        } else {
          throw new Error("Failed to setup company");
        }
      } else {
        throw new Error("Failed to fetch team members");
      }
    } catch (error) {
      logger.error("Error fetching team members:", {
        context: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      toast({
        title: t("error.unknownError"),
        variant: "destructive",
        description: t("error.failedToLoadMembers"),
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTeamMembers();
  }, [refreshTrigger, fetchTeamMembers]);

  const handleClearFilters = () => {
    setFilterJoined(false);
    setFilterLastLogin(false);
  };

  const handleInvite = () => {
    setShowInviteModal(true);
  };

  const handleInviteSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          {t("account.team.title")}
        </h2>
        <Button
          onClick={handleInvite}
          className="bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("account.team.invite")}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("members")}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === "members"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <Users className="w-4 h-4 inline mr-2" />
            {t("account.team.members")}
          </button>
          <button
            onClick={() => setActiveTab("invitations")}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === "invitations"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            {t("account.team.invitations")}
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === "members" ? (
        <>
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterJoined(!filterJoined)}
              className={cn(
                "rounded-full",
                filterJoined
                  ? "bg-purple-100 border-purple-300 text-indigo-600"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              )}
            >
              {filterJoined && <Check className="w-3 h-3 mr-1" />}
              {t("account.team.joined")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterLastLogin(!filterLastLogin)}
              className={cn(
                "rounded-full",
                filterLastLogin
                  ? "bg-purple-100 border-purple-300 text-indigo-600"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              )}
            >
              {filterLastLogin && <Check className="w-3 h-3 mr-1" />}
              {t("account.team.lastLogin")}
            </Button>
            {(filterJoined || filterLastLogin) && (
              <Button
                onClick={handleClearFilters}
                className="bg-white text-sm text-indigo-500 hover:text-indigo-600"
              >
                {t("common.clearFilters")}
              </Button>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">{t("common.loading")}</div>
            </div>
          ) : (
            /* Team Members Table */
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        {t("account.team.user")}
                        <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        {t("account.team.role")}
                        <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        {t("account.team.registered")}
                        <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        {t("account.team.lastLogin")}
                        <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">
                        {t("account.team.actions")}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {t("account.team.noMembersFound")}
                      </td>
                    </tr>
                  ) : (
                    members.map((member, index) => (
                      <tr
                        key={member.id}
                        className={cn(
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        )}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium text-sm">
                                {member.initials}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {t(`roles.${member.role.toLowerCase()}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.registered}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.lastLogin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">
                                  {t("common.openMenu")}
                                </span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => console.log("Edit", member.name)}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                {t("common.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  console.log("Remove", member.name)
                                }
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                {t("common.remove")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <InvitationsList refreshTrigger={refreshTrigger} />
      )}

      {/* Invite Modal */}
      <InviteTeamMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
}
