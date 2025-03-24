export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Trip {
  id?: number;
  current_location: Location;
  pickup_location: Location;
  dropoff_location: Location;
  current_cycle_used: number;
  cycle_used: number;
  created_at?: string;
  updated_at?: string;
  eld_logs?: ELDLog[];
  driving_hours: number;
  on_duty_hours: number;
  off_duty_hours: number;
}

export interface ELDLog {
  id: string;
  trip_id: string;
  status: "ON_DUTY" | "DRIVING" | "OFF_DUTY" | "SLEEPER";
  start_time: string;
  end_time: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  remarks?: string;
  created_at: string;
}
