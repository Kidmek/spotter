import React, { createContext, useContext, useState, useEffect } from "react";
import { Location } from "../types";

interface LocationContextType {
  currentLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  setCurrentLocation: (location: Location) => void;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError(null);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location: Location = {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, // Placeholder address
          };
          setCurrentLocation(location);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError(getLocationErrorMessage(error.code));
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
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

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        isLoading,
        error,
        setCurrentLocation,
        refreshLocation: getCurrentLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
