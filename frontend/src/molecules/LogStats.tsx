import React from "react";
import { Trip } from "../types";
import { StatCard } from "../atoms/StatCard";

interface LogStatsProps {
  trip: Trip;
}

export const LogStats: React.FC<LogStatsProps> = ({ trip }) => {
  const getCycleColor = () => {
    if (trip.current_cycle_used >= 11) return "red";
    if (trip.current_cycle_used >= 8) return "yellow";
    return "green";
  };

  const calculateSleeperHours = () => {
    return (
      trip.eld_logs
        ?.filter((log) => log.status === "SLEEPER")
        .reduce((total, log) => {
          const start = new Date(log.start_time);
          const end = new Date(log.end_time);
          return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }, 0)
        .toFixed(1) || "0.0"
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Driving Hours"
          value={`${trip.driving_hours} hrs`}
          color="blue"
          maxValue={11}
        />
        <StatCard
          label="On Duty Hours"
          value={`${trip.on_duty_hours} hrs`}
          color="green"
          maxValue={14}
        />
        <StatCard
          label="Off Duty Hours"
          value={`${trip.off_duty_hours} hrs`}
          color="yellow"
          minValue={10}
        />
        <StatCard
          label="Sleeper/Bath"
          value={`${calculateSleeperHours()} hrs`}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1">
        <StatCard
          label="Cycle Used"
          value={`${trip.cycle_used} hrs`}
          color={getCycleColor()}
          maxValue={11}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          FMCSA Regulations
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Maximum 11 hours of driving time</li>
          <li>• Maximum 14 hours of on-duty time</li>
          <li>• Minimum 10 hours of off-duty time</li>
        </ul>
      </div>
    </div>
  );
};
