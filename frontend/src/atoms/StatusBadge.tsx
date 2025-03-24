import React from "react";
import { ELDLog } from "../types";

interface StatusBadgeProps {
  status: ELDLog["status"];
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

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-sm ${getStatusColor(
        status
      )}`}
    >
      {status}
    </span>
  );
};
