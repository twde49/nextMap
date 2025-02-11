'use client'
import { Libraries, useJsApiLoader} from "@react-google-maps/api";
import { ReactNode } from "react";

const libs = ['maps','places'];


export function MapProvider({children}:{children:ReactNode}){
    const { isLoaded: scriptLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API as string,
        libraries: libs as Libraries,
      });

      if(loadError) return <p>Encountered error while loading google maps</p>

      if(!scriptLoaded) return <p>Map Script is loading ...</p>

      return children;
}