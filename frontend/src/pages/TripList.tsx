import React, { useState, useEffect } from "react";
import { TripList as TripListComponent } from "../organisms/TripList";
import { Trip } from "../types";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export const TripList: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await api.getTrips();
        setTrips(data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || "Failed to fetch trips"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleSelectTrip = async (trip: Trip) => {
    navigate(`/trips/${trip.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Trips</h1>
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <TripListComponent
            trips={trips}
            onSelectTrip={handleSelectTrip}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
