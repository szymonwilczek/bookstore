"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X } from "lucide-react";
import { useSocket } from "@/lib/context/socket-context";
import { useSession } from "next-auth/react";

interface MessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
}

export function MessageInput({
  conversationId,
  onSendMessage,
}: MessageInputProps) {
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = () => {
    if (!socket || !isConnected || !session?.user?.id) return;

    // emit typing start
    socket.emit("typing-start", {
      conversationId,
      userId: session.user.id,
      userName: session.user.name,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-stop", {
        conversationId,
        userId: session.user.id,
      });
    }, 1000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isDocument = file.type === "application/pdf";
      return isImage || isDocument;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!content.trim() && attachments.length === 0) || sending) return;

    setSending(true);
    try {
      await onSendMessage(content, attachments);
      setContent("");
      setAttachments([]);

      // emit typing stop
      if (socket && isConnected && session?.user?.id) {
        socket.emit("typing-stop", {
          conversationId,
          userId: session.user.id,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const characterCount = content.length;
  const maxCharacters = 2000;

  return (
    <div className="border-t p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="relative flex items-center gap-2 rounded-md border bg-muted px-3 py-2"
            >
              <span className="text-sm">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={() => removeAttachment(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex-1">
          <Textarea
            placeholder="Napisz wiadomość..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            disabled={sending}
            className="min-h-[60px] resize-none"
            maxLength={maxCharacters}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {characterCount}/{maxCharacters}
          </p>
        </div>

        <Button
          onClick={handleSend}
          disabled={sending || (!content.trim() && attachments.length === 0)}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
