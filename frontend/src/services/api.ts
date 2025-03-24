import axios from "axios";
import { ELDLog, TripFormData } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = {
  // Trip endpoints
  createTrip: async (trip: TripFormData) => {
    const response = await axios.post(`${API_URL}/trips/`, trip);
    return response.data;
  },

  getTrips: async () => {
    const response = await axios.get(`${API_URL}/trips/`);
    return response.data;
  },

  getTrip: async (id: number) => {
    const response = await axios.get(`${API_URL}/trips/${id}/`);
    return response.data;
  },

  // ELD Log endpoints
  addLog: async (
    tripId: number,
    log: Omit<ELDLog, "id" | "created_at" | "start_time">
  ) => {
    const response = await axios.post(
      `${API_URL}/trips/${tripId}/add_log/`,
      log
    );
    return response.data;
  },

  generatePDF: async (tripId: number) => {
    const response = await axios.get(
      `${API_URL}/trips/${tripId}/generate_pdf/`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};
