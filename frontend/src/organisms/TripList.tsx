import React from "react";
import { Trip } from "../types";
import { TripCard } from "../molecules/TripCard";

interface TripListProps {
  trips: Trip[];
  onSelectTrip: (trip: Trip) => Promise<void>;
  isLoading: boolean;
}

export const TripList: React.FC<TripListProps> = ({
  trips,
  onSelectTrip,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No trips found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Create a new trip to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          onClick={() => onSelectTrip(trip)}
        />
      ))}
    </div>
  );
};
