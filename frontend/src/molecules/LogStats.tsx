import React from "react";
import { ELDLog } from "../types";
import { StatCard } from "../atoms/StatCard";

interface LogStatsProps {
  logs: ELDLog[];
}

export const LogStats: React.FC<LogStatsProps> = ({ logs }) => {
  const calculateHours = (status: ELDLog["status"]) => {
    return logs
      .filter((log) => log.status === status)
      .reduce((total, log) => {
        const start = new Date(log.start_time);
        const end = new Date(log.end_time);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0)
      .toFixed(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Driving Hours"
        value={`${calculateHours("DRIVING")} hrs`}
        color="blue"
      />
      <StatCard
        label="On Duty Hours"
        value={`${calculateHours("ON_DUTY")} hrs`}
        color="green"
      />
      <StatCard
        label="Off Duty Hours"
        value={`${calculateHours("OFF_DUTY")} hrs`}
        color="yellow"
      />
      <StatCard
        label="Sleeper Hours"
        value={`${calculateHours("SLEEPER")} hrs`}
        color="purple"
      />
    </div>
  );
};
