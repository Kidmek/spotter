import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import { Button } from "../atoms/Button";
import { Trip } from "../types";
import { ELDStateManager } from "./ELDStateManager";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { LogGrid } from "../molecules/LogGrid";
// Fix for default marker icons in React-Leaflet
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface TripViewProps {
  trip: Trip;
  onGeneratePDF: () => Promise<void>;
}

const getMarkerColor = (type: "pickup" | "dropoff" | "current") => {
  switch (type) {
    case "pickup":
      return "#10B981"; // Green
    case "dropoff":
      return "#EF4444"; // Red
    case "current":
      return "#3B82F6"; // Blue
    default:
      return "#6B7280"; // Gray
  }
};

const getLineColor = (type: "pickup" | "current") => {
  switch (type) {
    case "pickup":
      return "#10B981"; // Green
    case "current":
      return "#3B82F6"; // Blue
    default:
      return "#6B7280"; // Gray
  }
};

export const TripView: React.FC<TripViewProps> = ({
  trip: trip,
  onGeneratePDF,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onGeneratePDF();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to generate PDF"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Trip Details</h1>
          <Button onClick={handleGeneratePDF} disabled={isLoading}>
            {isLoading ? "Generating PDF..." : "Generate PDF"}
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Pickup Location
            </h3>
            <p className="mt-1 text-sm text-gray-900">
              {trip.pickup_location.address}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Dropoff Location
            </h3>
            <p className="mt-1 text-sm text-gray-900">
              {trip.dropoff_location.address}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Starting Location
            </h3>
            <p className="mt-1 text-sm text-gray-900">
              {trip.current_location.address}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Initial Cycle Used
            </h3>
            <p className="mt-1 text-sm text-gray-900">
              {trip.current_cycle_used} hours
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Map</h2>
          <div className="h-[400px] w-full rounded-lg overflow-hidden">
            <MapContainer
              center={[trip.current_location.lat, trip.current_location.lng]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Markers */}
              <Marker
                position={[
                  trip.current_location.lat,
                  trip.current_location.lng,
                ]}
                icon={L.divIcon({
                  className: "custom-marker",
                  html: `<div style="background-color: ${getMarkerColor(
                    "current"
                  )}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })}
              >
                <Popup>Starting Location</Popup>
              </Marker>

              <Marker
                position={[trip.pickup_location.lat, trip.pickup_location.lng]}
                icon={L.divIcon({
                  className: "custom-marker",
                  html: `<div style="background-color: ${getMarkerColor(
                    "pickup"
                  )}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })}
              >
                <Popup>Pickup Location</Popup>
              </Marker>

              <Marker
                position={[
                  trip.dropoff_location.lat,
                  trip.dropoff_location.lng,
                ]}
                icon={L.divIcon({
                  className: "custom-marker",
                  html: `<div style="background-color: ${getMarkerColor(
                    "dropoff"
                  )}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })}
              >
                <Popup>Dropoff Location</Popup>
              </Marker>

              {/* Route Lines */}
              <Polyline
                positions={
                  [
                    [trip.current_location.lat, trip.current_location.lng],
                    [trip.pickup_location.lat, trip.pickup_location.lng],
                  ] as [number, number][]
                }
                color={getLineColor("current")}
                weight={3}
              />
              <Polyline
                positions={
                  [
                    [trip.pickup_location.lat, trip.pickup_location.lng],
                    [trip.dropoff_location.lat, trip.dropoff_location.lng],
                  ] as [number, number][]
                }
                color={getLineColor("pickup")}
                weight={3}
              />
            </MapContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ELD Logs</h2>
          <ELDStateManager
            tripId={trip.id?.toString() || ""}
            trip={trip}
            currentLocation={trip.current_location}
          />
        </div>

        <div className="mt-4 print:mt-8">
          <LogGrid logs={trip.eld_logs} />
        </div>
      </div>
    </div>
  );
};
