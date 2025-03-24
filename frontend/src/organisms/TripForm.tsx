import React, { useState } from "react";
import { TripFormData } from "../types";
import { Button } from "../atoms/Button";
import { MapInput } from "../atoms/MapInput";
import { FormInput } from "../atoms/FormInput";

interface TripFormProps {
  onSubmit: (trip: TripFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<TripFormData>({
    pickup_location: {
      lat: 0,
      lng: 0,
      address: "",
    },
    dropoff_location: {
      lat: 0,
      lng: 0,
      address: "",
    },
    current_location: {
      lat: 0,
      lng: 0,
      address: "",
    },
    current_cycle_used: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.pickup_location.address) {
      newErrors.pickup_address = "Pickup address is required";
    }

    if (!formData.dropoff_location.address) {
      newErrors.dropoff_address = "Dropoff address is required";
    }

    if (!formData.current_location.address) {
      newErrors.current_address = "Current location is required";
    }

    if (formData.current_cycle_used < 0) {
      newErrors.current_cycle_used = "Cycle used cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        pickup_location: formData.pickup_location,
        dropoff_location: formData.dropoff_location,
        current_location: formData.current_location,
        current_cycle_used: formData.current_cycle_used,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({
        submit: "Failed to create trip. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <MapInput
          label="Starting Location"
          value={formData.current_location}
          onChange={(location) =>
            setFormData((prev) => ({
              ...prev,
              current_location: location,
            }))
          }
          error={errors.current_address}
          isCurrentLocation
        />
        <MapInput
          label="Pickup Location"
          value={formData.pickup_location}
          onChange={(location) =>
            setFormData((prev) => ({
              ...prev,
              pickup_location: location,
            }))
          }
          error={errors.pickup_address}
        />

        <MapInput
          label="Dropoff Location"
          value={formData.dropoff_location}
          onChange={(location) =>
            setFormData((prev) => ({
              ...prev,
              dropoff_location: location,
            }))
          }
          error={errors.dropoff_address}
        />

        <FormInput
          label="Current Cycle Used (in hours)"
          type="number"
          min="0"
          step="1"
          value={formData.current_cycle_used}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              current_cycle_used: parseFloat(e.target.value) || 0,
            }))
          }
          error={errors.current_cycle_used}
        />
      </div>

      {errors.submit && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {errors.submit}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating Trip..." : "Create Trip"}
        </Button>
      </div>
    </form>
  );
};
