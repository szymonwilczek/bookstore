import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket as NetSocket } from "net";

interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

// mapa uzytkownikow online
const userSockets = new Map<string, string>();

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io server...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // uzytkownik dolacza ze swoim id
      socket.on("join", (userEmail: string) => {
        console.log(`User ${userEmail} joined`);
        socket.join(`user:${userEmail}`);
        userSockets.set(userEmail, socket.id);
      });

      // dolaczanie do konkretnej konwersacji
      socket.on("join-conversation", (conversationId: string) => {
        console.log(
          `Socket ${socket.id} joined conversation ${conversationId}`
        );
        socket.join(`conversation:${conversationId}`);
      });

      // opuszczanie konwersacji
      socket.on("leave-conversation", (conversationId: string) => {
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
        socket.leave(`conversation:${conversationId}`);
      });

      // wysylanie wiadomosci na konwersacji
      socket.on(
        "send-message",
        (data: {
          conversationId: string;
          participantEmails: string[];
          message: {
            _id: string;
            sender: {
              _id: string;
              name?: string;
              email: string;
              image?: string;
            };
            content: string;
            attachments?: Array<{ type: string; url: string; name: string }>;
            createdAt: Date;
            readBy: string[];
            deliveredTo: string[];
          };
        }) => {
          console.log(`Message sent to conversation ${data.conversationId}`);
          console.log(`Participant emails:`, data.participantEmails);

          socket
            .to(`conversation:${data.conversationId}`)
            .emit("new-message", data.message);

          data.participantEmails.forEach((participantEmail) => {
            console.log(
              `Emitting to user:${participantEmail} for conversation list update`
            );
            io.to(`user:${participantEmail}`).emit("conversation-update", {
              ...data.message,
              conversationId: data.conversationId,
            });
          });
        }
      );

      // potwierdzenie dostarczenia wiadomosci
      socket.on(
        "message-delivered",
        (data: {
          messageId: string;
          userId: string;
          conversationId: string;
        }) => {
          console.log(`Message ${data.messageId} delivered to ${data.userId}`);
          io.to(`conversation:${data.conversationId}`).emit(
            "message-delivered",
            data
          );
        }
      );

      // odczytanie wiadomosci
      socket.on(
        "messages-read",
        (data: {
          conversationId: string;
          userId: string;
          messageIds: string[];
        }) => {
          console.log(
            `Messages read in conversation ${data.conversationId} by ${data.userId}`
          );
          socket
            .to(`conversation:${data.conversationId}`)
            .emit("messages-read", data);
        }
      );

      // indykatory pisania
      socket.on(
        "typing-start",
        (data: {
          conversationId: string;
          userId: string;
          userName: string;
        }) => {
          socket
            .to(`conversation:${data.conversationId}`)
            .emit("typing-start", {
              userId: data.userId,
              userName: data.userName,
            });
        }
      );

      socket.on(
        "typing-stop",
        (data: { conversationId: string; userId: string }) => {
          socket.to(`conversation:${data.conversationId}`).emit("typing-stop", {
            userId: data.userId,
          });
        }
      );

      // wysylanie powiadomienia do konkretnego uzytkownika
      socket.on(
        "send-notification",
        (data: {
          userId: string;
          notification: {
            _id: string;
            type: string;
            title: string;
            message: string;
            read: boolean;
            createdAt: Date;
            data?: Record<string, unknown>;
          };
        }) => {
          console.log(`Notification sent to user ${data.userId}`);
          io.to(`user:${data.userId}`).emit(
            "new-notification",
            data.notification
          );
        }
      );

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        // usuwanie z mapy uzytkownikow online
        for (const [userId, socketId] of userSockets.entries()) {
          if (socketId === socket.id) {
            userSockets.delete(userId);
            break;
          }
        }
      });
    });

    res.socket.server.io = io;
    console.log("Socket.io server initialized");
  } else {
    console.log("Socket.io server already running");
  }

  res.end();
}
