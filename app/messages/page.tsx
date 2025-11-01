"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import { useSocket } from "@/lib/context/socket-context";

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    image?: string;
  }>;
  book: {
    _id: string;
    title: string;
    coverImage?: string;
    author: string;
  };
  lastMessage?: {
    content: string;
    sender: string;
    createdAt: Date;
  };
  unreadCount: number;
  updatedAt: Date;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket, isConnected } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("new-message", () => {
      fetchConversations();
    });

    return () => {
      socket.off("new-message");
    };
  }, [socket, isConnected]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    router.push(`/messages?conversation=${conversationId}`, { scroll: false });
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setConversations((prev) =>
          prev.filter((c) => c._id !== conversationId)
        );
        if (activeConversationId === conversationId) {
          setActiveConversationId(null);
          router.push("/messages");
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-muted-foreground">Ładowanie...</p>
      </div>
    );
  }

  const activeConversation = conversations.find(
    (c) => c._id === activeConversationId
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-y-hidden">
      <div className="w-xs min-w-[200px] border-r">
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      <div className="flex-1">
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            currentUserId={session?.user?.id || ""}
          />
        ) : (
          <div className="flex h-full items-center justify-center overflow-y-hidden">
            <div className="text-center">
              <p className="text-xl font-medium text-muted-foreground">
                Wybierz konwersację aby rozpocząć
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
