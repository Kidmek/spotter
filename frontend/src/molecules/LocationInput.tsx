import React from "react";
import { MapInput } from "../atoms/MapInput";
import { Location } from "../types";

interface LocationInputProps {
  label: string;
  value: Location;
  onChange: (location: Location) => void;
  error?: string;
  isCurrentLocation?: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  value,
  onChange,
  error,
  isCurrentLocation = false,
}) => {
  return (
    <div className="space-y-2">
      <MapInput
        label={label}
        value={value}
        onChange={onChange}
        error={error}
        isCurrentLocation={isCurrentLocation}
      />
    </div>
  );
};
