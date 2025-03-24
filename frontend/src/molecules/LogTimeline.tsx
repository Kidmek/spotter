import React from "react";
import { ELDLog } from "../types";
import { LogEntry } from "./LogEntry";

interface LogTimelineProps {
  logs: ELDLog[];
}

export const LogTimeline: React.FC<LogTimelineProps> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Log Timeline</h3>
      <div className="space-y-4">
        {logs.map((log, index) => (
          <LogEntry key={index} log={log} />
        ))}
      </div>
    </div>
  );
};
