import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Location } from "../types";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Modal } from "./Modal";

// Create a custom icon
const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapInputProps {
  value: Location;
  onChange: (location: Location) => void;
  label: string;
  error?: string;
  isCurrentLocation?: boolean;
}

const LocationMarker: React.FC<{
  position: [number, number];
  onChange: (location: Location) => void;
  label: string;
}> = ({ position, onChange, label }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onChange({
        lat,
        lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, // We'll update this with real address later
      });
    },
  });

  return (
    <Marker position={position} icon={customIcon}>
      <Popup>{label}</Popup>
    </Marker>
  );
};

export const MapInput: React.FC<MapInputProps> = ({
  value,
  onChange,
  label,
  error,
  isCurrentLocation = false,
}) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLocationError, setShowLocationError] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (value.lat && value.lng) {
      setPosition([value.lat, value.lng]);
      getAddressFromCoordinates(value.lat, value.lng);
    }
  }, [value.lat, value.lng]);

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
        onChange({
          lat,
          lng,
          address: data.display_name,
        });
      }
    } catch (error) {
      console.error("Error getting address:", error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          if (isCurrentLocation) {
            onChange({
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            });
            getAddressFromCoordinates(latitude, longitude);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(getLocationErrorMessage(error.code));
          setShowLocationError(true);
          setIsLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setShowLocationError(true);
      setIsLoading(false);
    }
  };

  const getLocationErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return "Location access was denied. Please enable location services in your browser settings.";
      case 2:
        return "Location information is unavailable. Please check your device's location settings.";
      case 3:
        return "Location request timed out. Please try again.";
      default:
        return "An error occurred while getting your location. Please try again.";
    }
  };

  if (!position) {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <div className="h-[300px] w-full rounded-md overflow-hidden border border-gray-300 relative">
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-gray-700">Getting location...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="h-[300px] w-full rounded-md overflow-hidden border border-gray-300 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-gray-700">Getting location...</div>
          </div>
        )}
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && (
            <LocationMarker
              position={position}
              onChange={onChange}
              label={label}
            />
          )}
        </MapContainer>
      </div>
      {address && <div className="text-sm text-gray-600 mt-1">{address}</div>}
      {error && <span className="text-sm text-red-500">{error}</span>}

      <Modal
        isOpen={showLocationError}
        onClose={() => setShowLocationError(false)}
        title="Location Access Required"
      >
        <div className="space-y-4">
          <p>{locationError}</p>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowLocationError(false);
                getCurrentLocation();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
