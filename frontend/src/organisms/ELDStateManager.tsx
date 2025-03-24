import React, { useState, useEffect } from "react";
import { ELDLog, Trip } from "../types";
import { LogForm } from "../molecules/LogForm";
import { LogTimeline } from "../molecules/LogTimeline";
import { LogStats } from "../molecules/LogStats";
import { Button } from "../atoms/Button";
import { api } from "../services/api";
import { LogGrid } from "../molecules/LogGrid";

interface ELDStateManagerProps {
  tripId: string;
  trip: Trip;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  refreshTrip: () => void;
}

interface ValidationErrors {
  status?: string;
  endTime?: string;
  remarks?: string;
}

export const ELDStateManager: React.FC<ELDStateManagerProps> = ({
  tripId,
  trip,
  currentLocation,
  refreshTrip,
}) => {
  const [selectedStatus, setSelectedStatus] =
    useState<ELDLog["status"]>("ON_DUTY");
  const [endTime, setEndTime] = useState(new Date().toISOString().slice(0, 16));
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  // Reset form when currentLogs changes
  useEffect(() => {
    setEndTime(new Date().toISOString().slice(0, 16));
    setRemarks("");
    setError(null);
    setValidationErrors({});
  }, [trip.eld_logs]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!selectedStatus) {
      errors.status = "Status is required";
    }

    if (!endTime) {
      errors.endTime = "End time is required";
    }

    if (!remarks) {
      errors.remarks = "Remarks are required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const newLog: Omit<ELDLog, "id" | "created_at" | "start_time"> = {
        trip_id: tripId,
        status: selectedStatus,
        end_time: endTime,
        remarks,
        location: currentLocation,
      };

      await api.addLog(parseInt(tripId), newLog);
      refreshTrip();
    } catch (err: any) {
      if (err.response?.data) {
        // Handle API validation errors
        const apiErrors = err.response.data;
        const newErrors: ValidationErrors = {};

        if (apiErrors.end_time) {
          newErrors.endTime = apiErrors.end_time[0];
        }
        if (apiErrors.status) {
          newErrors.status = apiErrors.status[0];
        }
        if (apiErrors.remarks) {
          newErrors.remarks = apiErrors.remarks[0];
        }

        if (Object.keys(newErrors).length > 0) {
          setValidationErrors(newErrors);
        } else {
          setError(err.response.data.message || "Failed to add log entry");
        }
      } else {
        setError(err.message || "Failed to add log entry");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          ELD State Manager
        </h2>
        <LogForm
          selectedStatus={selectedStatus}
          endTime={endTime}
          remarks={remarks}
          onStatusChange={setSelectedStatus}
          onEndTimeChange={setEndTime}
          onRemarksChange={setRemarks}
          errors={validationErrors}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-4">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Adding Log Entry..." : "Add Log Entry"}
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <LogStats trip={trip} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <LogTimeline logs={trip.eld_logs ?? []} />
      </div>
      <div className="mt-4 print:mt-8">
        <LogGrid logs={trip.eld_logs} />
      </div>
    </div>
  );
};
