import React from "react";
import { Trip } from "../types";

interface TripCardProps {
  trip: Trip;
  onClick: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg 
      transition-shadow duration-200 cursor-pointer overflow-hidden border border-gray-100
      "
    >
      <div className="p-6 space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2"></div>
          <span className="text-sm font-medium text-blue-600">
            {trip.current_cycle_used} hours
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm">P</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Pickup</h3>
              <p className="text-sm text-gray-900">
                {trip.pickup_location.address}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-sm">D</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Dropoff</h3>
              <p className="text-sm text-gray-900">
                {trip.dropoff_location.address}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 text-sm">C</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Current</h3>
              <p className="text-sm text-gray-900">
                {trip.current_location.address}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-auto">
          <div className="flex flex-col justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-gray-500">
                {new Date(trip.created_at || "").toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-sm text-gray-500">
                {trip.eld_logs?.length || 0} logs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
