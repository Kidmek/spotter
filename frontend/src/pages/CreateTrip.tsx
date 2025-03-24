import React from "react";
import { TripForm } from "../organisms/TripForm";
import { api } from "../services/api";
import { TripFormData } from "../types";
import { useNavigate } from "react-router-dom";

export const CreateTrip: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (trip: TripFormData) => {
    try {
      const newTrip = await api.createTrip(trip);
      navigate(`/trips/${newTrip.id}`);
    } catch (error) {
      console.error("Error creating trip:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Trip
          </h1>
          <TripForm
            onSubmit={handleSubmit}
            onCancel={() => navigate("/")}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
};
