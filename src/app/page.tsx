"use client"
import {MapProvider} from "@/providers/map-provider";
import {MapComponent} from "@/components/map"
import WebSocketComponent from "@/components/webSocketComponent";

export default function Home() {
  return (
    <>
      <MapProvider>
        <main>
          <MapComponent />
          <WebSocketComponent />
        </main>
      </MapProvider>
    </>
  );
}
