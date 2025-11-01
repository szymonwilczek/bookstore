"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name?: string;
    username?: string;
    email: string;
    image?: string;
  }>;
  book: {
    _id: string;
    title: string;
    coverImage?: string;
  };
  lastMessage?: {
    content: string;
    sender: string;
    createdAt: Date;
  };
  unreadCount: number;
  updatedAt: Date;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find(
      (p) => p.email !== session?.user?.email
    );

    if (!otherParticipant) return false;

    const searchLower = searchQuery.toLowerCase();
    const participantName =
      otherParticipant.username ||
      otherParticipant.name ||
      otherParticipant.email;

    return (
      participantName.toLowerCase().includes(searchLower) ||
      conv.book.title.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">Wiadomości</h2>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Szukaj konwersacji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filteredConversations.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? "Brak wyników" : "Brak konwersacji"}
            </p>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(
                (p) => p.email !== session?.user?.email
              );

              if (!otherParticipant) return null;

              const isActive = conversation._id === activeConversationId;
              const participantName =
                otherParticipant.username ||
                otherParticipant.name ||
                otherParticipant.email;

              return (
                <div
                  key={conversation._id}
                  className={cn(
                    "group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent",
                    isActive && "bg-accent"
                  )}
                  onClick={() => onSelectConversation(conversation._id)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherParticipant.image} />
                    <AvatarFallback>
                      {participantName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{participantName}</p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(conversation.lastMessage.createdAt),
                            {
                              addSuffix: true,
                              locale: pl,
                            }
                          )}
                        </span>
                      )}
                    </div>

                    <p className="truncate text-sm text-muted-foreground">
                      {conversation.book.title}
                    </p>

                    {conversation.lastMessage && (
                      <p className="truncate text-sm text-muted-foreground">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {conversation.unreadCount > 0 && (
                      <Badge
                        variant="default"
                        className="h-5 min-w-5 rounded-full px-1"
                      >
                        {conversation.unreadCount}
                      </Badge>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conversation._id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Usuń konwersację
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
