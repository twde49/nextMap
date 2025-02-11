"use client"
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const WebSocketComponent = () => {
  const [userCount, setUserCount] = useState(0);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const socket = io("https://nextmapws.thibautstachnick.com/");

    // Request user's geolocation when component mounts
    if ("geolocation" in navigator) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          socket.emit("updateLocation", userPosition);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );

      // Set up continuous location watching
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const userPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          socket.emit("updateLocation", userPosition);
        },
        (error) => {
          console.error("Error watching location:", error);
        }
      );

      // Clean up the watch when component unmounts
      return () => navigator.geolocation.clearWatch(watchId);
    }

    // Listen for initial data from server
    socket.on("initialData", (data) => {
      console.log(`compris${data.userCount}`)
      setUserCount(data.userCount);
      setPositions(data.positions);
    });

    // Listen for updates from server
    socket.on("updateData", (data) => {
      setUserCount(data.userCount);
      setPositions(data.positions);
    });

    // Cleanup function
    return () => {
      socket.off("initialData");
      socket.off("updateData");
      socket.disconnect();
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // You can pass these states to parent components using props if needed
  return null;
};

export default WebSocketComponent;