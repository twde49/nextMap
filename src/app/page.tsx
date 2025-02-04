import {MapProvider} from "@/providers/map-provider";
import {MapComponent} from "@/components/map"

export default function Home() {
  return (
    <>
      <MapProvider>
        <main>
          <MapComponent />
        </main>
      </MapProvider>
    </>
  );
}
