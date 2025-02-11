"use client";
import React, { useEffect, useState, useContext } from "react";
import { WebSocketContext } from "@/providers/websocket-provider";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Autocomplete,
} from "@react-google-maps/api";
import axios from "axios";

export const defaultMapContainerStyle = {
  width: "100%",
  height: "60vh",
  borderRadius: "15px",
};

const defaultMapZoom = 15;
const defaultMapOptions = {
  zoomControl: true,
  tilt: 0,
  gestureHandling: "auto",
  mapTypeId: "roadmap",
  mapId: "55de5befcc72c4e9",
};

interface PlaceData {
  autocomplete?: google.maps.places.Autocomplete | null;
  value: string | undefined;
  location?: google.maps.LatLngLiteral;
}

const getDataFromIp = async () => {
  const response = await axios.get("https://us1.api-bdc.net/data/client-ip");  
  const data = await response.data;
  const ip = data.ipString;
  const coords = await axios(`https://ipapi.co/${ip}/json/`);
  const coordsData = await coords.data;
  return coordsData;
};

const MapComponent = () => {
  const { userCount, positions } = useContext(WebSocketContext);
  const [newPositions, setNewPositions] = useState<
    Array<{ lat: number; lng: number }>
  >([]);

  
  const [coords, setCoords] = useState<{lat: number, lng: number}>({lat: 0, lng: 0});
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(coords);

    useEffect(() => {
      if (!navigator.geolocation){
        const fetchCoords = async () => {
          const coordsData = await getDataFromIp();
          setCoords({
            lat: coordsData.latitude,
            lng: coordsData.longitude
          });
          setMapCenter({
            lat: coordsData.latitude,
            lng: coordsData.longitude
          });
        };
  
        fetchCoords();
      }
    }, []);
  

  useEffect(() => {
    if (positions && mapCenter) {
      const filteredPositions = positions.filter(
        (pos) => pos.lat !== mapCenter.lat || pos.lng !== mapCenter.lng,
      );
      setNewPositions(filteredPositions);
    }
  }, [positions, mapCenter]);

  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);
  const [destination, setDestination] = useState<PlaceData>({
    value: "",
    autocomplete: null,
  });
  const [waypoints, setWaypoints] = useState<PlaceData[]>([]);

  const fetchRoute = (
    origin: google.maps.LatLngLiteral,
    destinationLoc: google.maps.LatLngLiteral,
    waypointLocations: google.maps.LatLngLiteral[],
  ) => {
    const directionsService = new google.maps.DirectionsService();
    directionsService
      .route(
        {
          origin,
          destination: destinationLoc,
          travelMode: google.maps.TravelMode.WALKING,
          waypoints: waypointLocations.map((p) => ({
            location: p,
            stopover: true,
          })),
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirectionsResponse(result);
          } else {
            alert(`Échec de la requête d'itinéraire : ${status}`);
          }
        },
      )
      .catch();
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setMapCenter(currentPosition);
      });
    }
  }, []);

  const handleCreateRoute = () => {
    if (!destination.location) {
      return alert("Veuillez choisir une destination via l'autocomplete.");
    }
    const validWaypoints: google.maps.LatLngLiteral[] = [];
    for (const wp of waypoints) {
      if (wp.location) {
        validWaypoints.push(wp.location);
      }
    }
    fetchRoute(mapCenter, destination.location, validWaypoints);
  };

  const onLoadDestinationAutocomplete = (
    autocomplete: google.maps.places.Autocomplete,
  ) => {
    setDestination((prev) => ({ ...prev, autocomplete }));
  };

  const onPlaceChangedDestination = () => {
    if (destination.autocomplete) {
      const place = destination.autocomplete.getPlace();
      if (place?.geometry?.location) {
        const location = place.geometry.location;
        setDestination((prev) => ({
          ...prev,
          value: place.formatted_address || place.name || "",
          location: {
            lat: location.lat(),
            lng: location.lng(),
          },
        }));
      } else {
        alert("Veuillez sélectionner une destination valide.");
      }
    }
  };

  const handleAddWaypoint = () => {
    setWaypoints((prev) => [
      ...prev,
      { value: "", autocomplete: null, location: undefined },
    ]);
  };

  const onLoadWaypointAutocomplete = (
    autocomplete: google.maps.places.Autocomplete,
    index: number,
  ) => {
    setWaypoints((prev) => {
      const newWaypoints = [...prev];
      newWaypoints[index].autocomplete = autocomplete;
      return newWaypoints;
    });
  };

  const onPlaceChangedWaypoint = (index: number) => {
    const wp = waypoints[index];
    if (wp.autocomplete) {
      const place = wp.autocomplete.getPlace();
      if (place?.geometry?.location) {
        const location = place.geometry.location;
        setWaypoints((prev) => {
          const newWaypoints = [...prev];
          newWaypoints[index] = {
            ...newWaypoints[index],
            value: place.formatted_address || place.name || "",
            location: {
              lat: location.lat(),
              lng: location.lng(),
            },
          };
          return newWaypoints;
        });
      } else {
        alert("Veuillez sélectionner un point de passage valide.");
      }
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="mb-4 p-4 bg-gray-100 round15">
        <h2 className="text-xl text-black font-bold mb-2">
          Créer un itinéraire
        </h2>
        <div className="mb-4">
          <label
            htmlFor="destination"
            className="block text-black font-medium mb-1"
          >
            Destination :
          </label>
          <Autocomplete
            onLoad={onLoadDestinationAutocomplete}
            onPlaceChanged={onPlaceChangedDestination}
          >
            <input
              name="destination"
              type="text"
              placeholder="Cherchez votre destination"
              className="w-full p-2 border rounded text-black"
            />
          </Autocomplete>
        </div>
        <div className="mb-4">
          <label
            htmlFor="point de passage"
            className="block text-black font-medium mb-1"
          >
            Points de passage :
          </label>
          {waypoints.map((_, idx) => (
            <div key={"waypoint"} className="mb-2">
              <Autocomplete
                onLoad={(autocomplete) =>
                  onLoadWaypointAutocomplete(autocomplete, idx)
                }
                onPlaceChanged={() => onPlaceChangedWaypoint(idx)}
              >
                <input
                  name="point de passage"
                  type="text"
                  placeholder={`Point de passage ${idx + 1}`}
                  className="w-full p-2 border rounded text-black"
                />
              </Autocomplete>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddWaypoint}
            className="mt-2 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ajouter un point de passage
          </button>
        </div>
        <button
          type="button"
          onClick={handleCreateRoute}
          className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Créer l&#39;itinéraire
        </button>
        <br />
        <span className="text-black">
          Nombres utilisateurs actuellement connectés : {userCount}
        </span>
      </div>
      <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={mapCenter}
        zoom={defaultMapZoom}
        options={defaultMapOptions}
      >
        <Marker position={mapCenter} title="Votre position" />
        {destination.location && (
          <Marker
            position={destination.location}
            title="Destination"
            icon="https://maps.google.com/mapfiles/ms/icons/green-dot.png"
          />
        )}
        {waypoints.map(
          (wp, idx) =>
            wp.location &&
            wp.location !== mapCenter && (
              <Marker
                key={"marker"}
                position={wp.location}
                title={`Point de passage ${idx + 1}`}
                icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              />
            ),
        )}
        {newPositions?.map((position, idx) => (
          <Marker
            key={`user-position-${position.lat}-${position.lng}`}
            position={position}
            title={`User ${idx + 1}`}
            icon="https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
          />
        ))}
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}
      </GoogleMap>
    </div>
  );
};

export { MapComponent };
