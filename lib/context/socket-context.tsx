"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    let socketInstance: Socket | null = null;

    // inicjalizacja socket.io przez API route
    fetch("/api/socket")
      .then(() => {
        socketInstance = io({
          path: "/api/socket",
          addTrailingSlash: false,
        });

        socketInstance.on("connect", () => {
          console.log("Socket connected:", socketInstance?.id);
          setIsConnected(true);

          // automatyczne dolaczanie do pokoju jesli uzytkownik jest zalogowany
          if (session?.user?.email) {
            socketInstance?.emit("join", session.user.email);
          }
        });

        socketInstance.on("disconnect", () => {
          console.log("Socket disconnected");
          setIsConnected(false);
        });

        setSocket(socketInstance);
      })
      .catch((error) => {
        console.error("Failed to initialize socket:", error);
      });

    return () => {
      if (socketInstance) {
        console.log("Cleaning up socket connection");
        socketInstance.disconnect();
      }
    };
  }, [session?.user?.email]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
