import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TripView as TripViewComponent } from "../organisms/TripView";
import { Trip } from "../types";
import { api } from "../services/api";

export const TripView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        if (!id) {
          throw new Error("No trip ID provided");
        }
        const tripData = await api.getTrip(parseInt(id));
        setTrip(tripData);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load trip details"
        );
        console.error("Error fetching trip:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleGeneratePDF = async () => {
    try {
      if (!id) return;
      const pdfBlob = await api.generatePDF(parseInt(id));
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `trip-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to generate PDF"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading trip details...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error || "Trip not found"}</div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Trips
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <TripViewComponent trip={trip} onGeneratePDF={handleGeneratePDF} />
        </div>
      </div>
    </div>
  );
};
