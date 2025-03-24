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
import { useLocation } from "../contexts/LocationContext";
import { getAddressFromCoordinates } from "../util";

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
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
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
  const {
    currentLocation,
    isLoading,
    error: locationError,
    refreshLocation,
  } = useLocation();

  useEffect(() => {
    if (isCurrentLocation && currentLocation) {
      setPosition([currentLocation.lat, currentLocation.lng]);
      getAddressFromCoordinates(currentLocation.lat, currentLocation.lng).then(
        (address) => {
          onChange({
            ...currentLocation,
            address,
          });
        }
      );
    } else if (value.lat && value.lng) {
      setPosition([value.lat, value.lng]);
      getAddressFromCoordinates(value.lat, value.lng).then((address) => {
        onChange({
          ...value,
          address,
        });
      });
    } else if (!value.lat && !value.lng && currentLocation) {
      setPosition([currentLocation.lat, currentLocation.lng]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.lat, value.lng, currentLocation, isCurrentLocation]);

  if (!position) {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xl font-medium text-gray-700">{label}</label>
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
        <label className="text-xl font-medium text-gray-700">{label}</label>
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
      {value.address && (
        <div className="text-sm text-gray-600 mt-1">{value.address}</div>
      )}
      {error && <span className="text-sm text-red-500">{error}</span>}

      <Modal
        isOpen={!!locationError}
        onClose={() => {}}
        title="Location Access Required"
      >
        <div className="space-y-4">
          <p>{locationError}</p>
          <div className="flex justify-end">
            <button
              onClick={refreshLocation}
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
