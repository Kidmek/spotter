import React from "react";
import { ELDLog } from "../types";
import { FormSelect } from "../atoms/FormSelect";
import { FormInput } from "../atoms/FormInput";
import { FormTextarea } from "../atoms/FormTextarea";

interface LogFormProps {
  selectedStatus: ELDLog["status"];
  endTime: string;
  remarks: string;
  onStatusChange: (status: ELDLog["status"]) => void;
  onEndTimeChange: (time: string) => void;
  onRemarksChange: (remarks: string) => void;
  errors?: {
    status?: string;
    endTime?: string;
    remarks?: string;
  };
}

export const LogForm: React.FC<LogFormProps> = ({
  selectedStatus,
  endTime,
  remarks,
  onStatusChange,
  onEndTimeChange,
  onRemarksChange,
  errors = {},
}) => {
  const statusOptions = [
    { value: "ON_DUTY", label: "On Duty (Not Driving)" },
    { value: "DRIVING", label: "Driving" },
    { value: "OFF_DUTY", label: "Off Duty" },
    { value: "SLEEPER", label: "Sleeper Berth" },
  ];

  return (
    <div className="space-y-4">
      <FormSelect
        label="Status"
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value as ELDLog["status"])}
        options={statusOptions}
        error={errors.status}
      />

      <FormInput
        label="End Time"
        type="datetime-local"
        value={endTime}
        onChange={(e) => onEndTimeChange(e.target.value)}
        error={errors.endTime}
      />

      <FormTextarea
        label="Remarks"
        value={remarks}
        onChange={(e) => onRemarksChange(e.target.value)}
        rows={3}
        placeholder="Add any remarks about this log entry..."
        error={errors.remarks}
      />
    </div>
  );
};
