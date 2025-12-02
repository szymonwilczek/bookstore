"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Search, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/routing";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddBook?: () => void;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  onAddBook,
}: SearchBarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const t = useTranslations("listings");

  const handleCreateOfferClick = () => {
    if (session) {
      onAddBook?.();
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative flex-1">
            <Input
              placeholder={t("searchBarPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
          </div>
        </PopoverTrigger>
      </Popover>
      {onAddBook && (
        <Button
          variant="default"
          onClick={handleCreateOfferClick}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("createOffer")}
        </Button>
      )}
    </div>
  );
}
