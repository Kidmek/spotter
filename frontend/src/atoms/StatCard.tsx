import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  color: "blue" | "yellow" | "green" | "purple";
}

const getColorClasses = (color: StatCardProps["color"]) => {
  switch (color) {
    case "blue":
      return "bg-blue-50 text-blue-600";
    case "yellow":
      return "bg-yellow-50 text-yellow-600";
    case "green":
      return "bg-green-50 text-green-600";
    case "purple":
      return "bg-purple-50 text-purple-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  return (
    <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
      <p className="text-sm">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
};
