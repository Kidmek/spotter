import axios from "axios";
import { Trip, ELDLog } from "../types";

const API_URL = "http://localhost:8000/api";

export const api = {
  // Trip endpoints
  createTrip: async (
    trip: Omit<Trip, "id" | "created_at" | "updated_at" | "eld_logs">
  ) => {
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
