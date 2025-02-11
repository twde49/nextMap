"use client"
import { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

interface WebSocketContextType {
  userCount: number;
  positions: Array<{ lat: number; lng: number }>;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  userCount: 0,
  positions: [],
});

export const WebSocketProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [positions, setPositions] = useState<Array<{ lat: number; lng: number }>>(
    []
  );
  console.log(socket)

  useEffect(() => {
    const newSocket = io("https://nextmapws.thibautstachnick.com/");
    setSocket(newSocket);

    newSocket.on("initialData", (data) => {
      setUserCount(data.userCount);
      setPositions(data.positions);
    });

    newSocket.on("updateData", (data) => {
      setUserCount((prev) => (prev !== data.userCount ? data.userCount : prev));
      setPositions((prev) =>
        JSON.stringify(prev) !== JSON.stringify(data.positions) ? data.positions : prev
      );
    });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          newSocket.emit("updateLocation", userPosition);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const userPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          newSocket.emit("updateLocation", userPosition);
        },
        (error) => {
          console.error("Error watching location:", error);
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }

    return () => {
      newSocket.off("initialData");
      newSocket.off("updateData");
      newSocket.disconnect();
      console.log('terminated')
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ userCount, positions }}>
      {children}
    </WebSocketContext.Provider>
  );
};