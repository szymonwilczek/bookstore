"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FiltersProps {
  filters: {
    genres: string[];
    conditions: string[];
    dateRange: string;
  };
  setFilters: (filters: any) => void;
}

const conditions = ["new", "used", "damaged"];

export function Filters({ filters, setFilters }: FiltersProps) {
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const t = useTranslations("filters");

  useEffect(() => {
    fetch("/api/books/genres")
      .then((res) => res.json())
      .then((data) => setAvailableGenres(data.genres || []))
      .catch(console.error);
  }, []);

  const handleReset = () => {
    setFilters({
      genres: [],
      conditions: [],
      dateRange: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{t("title")}</h3>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          {t("clear")}
        </Button>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="genres">
          <AccordionTrigger>{t("genres")}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {availableGenres.map((g) => (
                <div key={g} className="flex items-center space-x-2">
                  <Checkbox
                    id={`genre-${g}`}
                    checked={filters.genres.includes(g)}
                    onCheckedChange={(checked) => {
                      setFilters({
                        ...filters,
                        genres: checked
                          ? [...filters.genres, g]
                          : filters.genres.filter((x) => x !== g),
                      });
                    }}
                  />
                  <label
                    htmlFor={`genre-${g}`}
                    className="text-sm cursor-pointer"
                  >
                    {g}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="condition">
          <AccordionTrigger>{t("condition")}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {conditions.map((c) => (
                <div key={c} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${c}`}
                    checked={filters.conditions.includes(c)}
                    onCheckedChange={(checked) => {
                      setFilters({
                        ...filters,
                        conditions: checked
                          ? [...filters.conditions, c]
                          : filters.conditions.filter((x) => x !== c),
                      });
                    }}
                  />
                  <label
                    htmlFor={`condition-${c}`}
                    className="text-sm cursor-pointer"
                  >
                    {c === "new"
                      ? t("conditions.new")
                      : c === "used"
                        ? t("conditions.used")
                        : t("conditions.damaged")}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="date">
          <AccordionTrigger>{t("dateAdded")}</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filters.dateRange}
              onValueChange={(v) => setFilters({ ...filters, dateRange: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("dateRanges.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t("dateRanges.last7")}</SelectItem>
                <SelectItem value="30">{t("dateRanges.last30")}</SelectItem>
                <SelectItem value="90">{t("dateRanges.last90")}</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
