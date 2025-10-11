"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown, MoreVertical, Check, Users, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { InviteTeamMemberModal } from "@/components/team/InviteTeamMemberModal";
import { InvitationsList } from "@/components/team/InvitationsList";

interface TeamMember {
  id: string;
  initials: string;
  name: string;
  email: string;
  registered: string;
  lastLogin: string;
}

const dummyTeamMembers: TeamMember[] = [
  {
    id: "1",
    initials: "PK",
    name: "Phylicia Kaldenhoven",
    email: "phylicia@psinfoodservice.com",
    registered: "7 months ago",
    lastLogin: "6 months ago",
  },
  {
    id: "2",
    initials: "JV",
    name: "Jolijn van Mil",
    email: "jolijn@psinfoodservice.com",
    registered: "8 months ago",
    lastLogin: "6 months ago",
  },
  {
    id: "3",
    initials: "TA",
    name: "Theun Arbeider",
    email: "theun@psinfoodservice.com",
    registered: "8 months ago",
    lastLogin: "7 months ago",
  },
  {
    id: "4",
    initials: "DK",
    name: "Dennis Kortekaas",
    email: "dennis@psinfoodservice.com",
    registered: "8 months ago",
    lastLogin: "31 minutes ago",
  },
  {
    id: "5",
    initials: "MS",
    name: "Martin Siepkes",
    email: "martin@psinfoodservice.com",
    registered: "8 months ago",
    lastLogin: "6 months ago",
  },
];

export function TeamTab() {
  const [members] = useState<TeamMember[]>(dummyTeamMembers);
  const [filterJoined, setFilterJoined] = useState(false);
  const [filterLastLogin, setFilterLastLogin] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "invitations">("members");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const t = useTranslations("account");

  const handleClearFilters = () => {
    setFilterJoined(false);
    setFilterLastLogin(false);
  };

  const handleInvite = () => {
    setShowInviteModal(true);
  };

  const handleInviteSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">{t("team")}</h2>
        <Button
          onClick={handleInvite}
          className="bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("invite")}
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
            {t("members")}
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
            {t("invitations")}
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
              {t("joined")}
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
              {t("lastLogin")}
            </Button>
            {(filterJoined || filterLastLogin) && (
              <Button
                onClick={handleClearFilters}
                className="text-sm text-indigo-500 hover:text-indigo-600"
              >
                {t("clearFilters")}
              </Button>
            )}
          </div>

          {/* Team Members Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {t("user")}
                      <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {t("registered")}
                      <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {t("lastLogin")}
                      <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                    </div>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">{t("actions")}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member, index) => (
                  <tr
                    key={member.id}
                    className={cn(index % 2 === 0 ? "bg-white" : "bg-gray-50")}
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
                            <span className="sr-only">{t("openMenu")}</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => console.log("Edit", member.name)}
                          >
                            {t("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => console.log("Remove", member.name)}
                          >
                            {t("remove")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
