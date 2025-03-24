import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  color: "blue" | "green" | "yellow" | "purple" | "red";
  maxValue?: number;
  minValue?: number;
}

const getColorClasses = (color: StatCardProps["color"]) => {
  switch (color) {
    case "blue":
      return "bg-blue-50 text-blue-700";
    case "green":
      return "bg-green-50 text-green-700";
    case "yellow":
      return "bg-yellow-50 text-yellow-700";
    case "purple":
      return "bg-purple-50 text-purple-700";
    case "red":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  color,
  maxValue,
  minValue,
}) => {
  const currentValue = parseFloat(value);
  const isOverLimit = maxValue !== undefined && currentValue > maxValue;
  const isUnderLimit = minValue !== undefined && currentValue < minValue;

  return (
    <div className={`p-4 rounded-lg ${getColorClasses(color)}`}>
      <h3 className="text-sm font-medium">{label}</h3>
      <div className="mt-1 flex items-baseline">
        <p className="text-2xl font-semibold">{value}</p>
        {maxValue && (
          <p className="ml-2 text-sm font-medium">/ {maxValue} hrs</p>
        )}
      </div>
      {(isOverLimit || isUnderLimit) && (
        <p className="mt-1 text-xs font-medium">
          {isOverLimit
            ? `Exceeds limit by ${(currentValue - maxValue!).toFixed(1)} hrs`
            : `Under minimum by ${(minValue! - currentValue).toFixed(1)} hrs`}
        </p>
      )}
    </div>
  );
};
