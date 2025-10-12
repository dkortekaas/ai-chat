"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Filter, X } from "lucide-react";

interface Filters {
  type: string;
  time: string;
  duration: string;
}

interface ConversationFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function ConversationFilters({
  filters,
  onChange,
}: ConversationFiltersProps) {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onChange({
      type: "all",
      time: "all",
      duration: "all",
    });
  };

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.time !== "all" ||
    filters.duration !== "all";

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Filters:</span>
      </div>

      <Select
        value={filters.type}
        onValueChange={(value) => handleFilterChange("type", value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle types</SelectItem>
          <SelectItem value="rated">Beoordeeld</SelectItem>
          <SelectItem value="unrated">Niet beoordeeld</SelectItem>
          <SelectItem value="empty">Leeg</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.time}
        onValueChange={(value) => handleFilterChange("time", value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Tijd" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle tijd</SelectItem>
          <SelectItem value="today">Vandaag</SelectItem>
          <SelectItem value="week">Deze week</SelectItem>
          <SelectItem value="month">Deze maand</SelectItem>
          <SelectItem value="year">Dit jaar</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.duration}
        onValueChange={(value) => handleFilterChange("duration", value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Duur" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle duur</SelectItem>
          <SelectItem value="fast">Snel (&lt;1s)</SelectItem>
          <SelectItem value="medium">Gemiddeld (1-3s)</SelectItem>
          <SelectItem value="slow">Langzaam (&gt;3s)</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          <X className="h-3 w-3 mr-1" />
          Wis filters
        </Button>
      )}
    </div>
  );
}
