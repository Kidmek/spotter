import React from "react";
import { ELDLog } from "../types";
import { StatusBadge } from "../atoms/StatusBadge";

interface LogEntryProps {
  log: ELDLog;
}

const getStatusColor = (status: ELDLog["status"]) => {
  switch (status) {
    case "DRIVING":
      return "bg-blue-100 text-blue-800";
    case "ON_DUTY":
      return "bg-yellow-100 text-yellow-800";
    case "OFF_DUTY":
      return "bg-green-100 text-green-800";
    case "SLEEPER":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  return (
    <div
      className="border-l-4 pl-4"
      style={{
        borderColor: getStatusColor(log.status).split(" ")[0],
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <StatusBadge status={log.status} />
          <p className="text-sm text-gray-600 mt-1">
            {new Date(log.start_time).toLocaleString()} -{" "}
            {new Date(log.end_time).toLocaleString()}
          </p>
          {log.remarks && (
            <p className="text-sm text-gray-500 mt-1 italic">{log.remarks}</p>
          )}
        </div>
        <div className="text-sm text-gray-500">{log.location.address}</div>
      </div>
    </div>
  );
};
