import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trip } from "../types";
import { api } from "../services/api";
import { Marker, Popup } from "react-leaflet";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import { ELDStateManager } from "../organisms/ELDStateManager";
import { Button } from "../atoms/Button";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default marker icons in React-Leaflet
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const getMarkerColor = (type: "pickup" | "dropoff" | "current") => {
  switch (type) {
    case "pickup":
      return "#10B981"; // Green
    case "dropoff":
      return "#EF4444"; // Red
    case "current":
      return "#3B82F6"; // Blue
    default:
      return "#6B7280"; // Gray
  }
};

const getLineColor = (type: "pickup" | "current") => {
  switch (type) {
    case "pickup":
      return "#10B981"; // Green
    case "current":
      return "#3B82F6"; // Blue
    default:
      return "#6B7280"; // Gray
  }
};

export const TripView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetch, setRefetch] = useState(false);

  const fetchTrip = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [id, fetchTrip, refetch]);

  const handleGeneratePDF = async () => {
    try {
      if (!id) return;
      setGeneratingPdf(true);
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
    } finally {
      setGeneratingPdf(false);
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Trip Details
                </h1>
                <Button onClick={handleGeneratePDF} disabled={generatingPdf}>
                  {generatingPdf ? "Generating PDF..." : "Generate PDF"}
                </Button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Pickup Location
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {trip.pickup_location.address}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Dropoff Location
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {trip.dropoff_location.address}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Starting Location
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {trip.current_location.address}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Initial Cycle Used
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {trip.current_cycle_used} hours
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Trip Map
                </h2>
                <div className="h-[400px] w-full rounded-lg overflow-hidden">
                  <MapContainer
                    center={[
                      trip.current_location.lat,
                      trip.current_location.lng,
                    ]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Markers */}
                    <Marker
                      position={[
                        trip.current_location.lat,
                        trip.current_location.lng,
                      ]}
                      icon={L.divIcon({
                        className: "custom-marker",
                        html: `<div style="background-color: ${getMarkerColor(
                          "current"
                        )}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                      })}
                    >
                      <Popup>Starting Location</Popup>
                    </Marker>

                    <Marker
                      position={[
                        trip.pickup_location.lat,
                        trip.pickup_location.lng,
                      ]}
                      icon={L.divIcon({
                        className: "custom-marker",
                        html: `<div style="background-color: ${getMarkerColor(
                          "pickup"
                        )}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                      })}
                    >
                      <Popup>Pickup Location</Popup>
                    </Marker>

                    <Marker
                      position={[
                        trip.dropoff_location.lat,
                        trip.dropoff_location.lng,
                      ]}
                      icon={L.divIcon({
                        className: "custom-marker",
                        html: `<div style="background-color: ${getMarkerColor(
                          "dropoff"
                        )}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                      })}
                    >
                      <Popup>Dropoff Location</Popup>
                    </Marker>

                    {/* Route Lines */}
                    <Polyline
                      positions={
                        [
                          [
                            trip.current_location.lat,
                            trip.current_location.lng,
                          ],
                          [trip.pickup_location.lat, trip.pickup_location.lng],
                        ] as [number, number][]
                      }
                      color={getLineColor("current")}
                      weight={3}
                    />
                    <Polyline
                      positions={
                        [
                          [trip.pickup_location.lat, trip.pickup_location.lng],
                          [
                            trip.dropoff_location.lat,
                            trip.dropoff_location.lng,
                          ],
                        ] as [number, number][]
                      }
                      color={getLineColor("pickup")}
                      weight={3}
                    />
                  </MapContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  ELD Logs
                </h2>
                <ELDStateManager
                  tripId={trip.id?.toString() || ""}
                  trip={trip}
                  refreshTrip={() => setRefetch(!refetch)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
