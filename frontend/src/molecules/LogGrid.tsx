import React from "react";
import { ELDLog } from "../types";

interface LogGridProps {
  logs?: ELDLog[];
  width?: number;
  height?: number;
}

export const LogGrid: React.FC<LogGridProps> = ({
  logs = [],
  width = 1000,
  height = 400,
}) => {
  const HOUR_WIDTH = width / 24;
  const GRID_HEIGHT = height * 0.7;
  const REMARKS_HEIGHT = height * 0.3;
  const STATUS_ROW_HEIGHT = GRID_HEIGHT / 4;
  const LABEL_WIDTH = 120;

  const STATUS_POSITIONS = {
    OFF_DUTY: 0,
    SLEEPER: 1,
    DRIVING: 2,
    ON_DUTY: 3,
  };

  const timeToPosition = (time: Date): number => {
    // Convert to UTC hours and minutes
    const utcHours = time.getUTCHours();
    const utcMinutes = time.getUTCMinutes();
    return (utcHours + utcMinutes / 60) * HOUR_WIDTH;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col">
      {/* Print button */}
      <div className="print:hidden self-end">
        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Print Log
        </button>
      </div>

      {/* Grid container with print styles */}
      <div className="flex items-start mt-12 logGrid">
        {/* Status labels outside grid */}
        <div className="flex flex-col " style={{ width: LABEL_WIDTH }}>
          <div
            style={{ height: STATUS_ROW_HEIGHT }}
            className="flex items-center"
          >
            Off Duty
          </div>
          <div
            style={{ height: STATUS_ROW_HEIGHT }}
            className="flex items-center"
          >
            Sleeper Berth
          </div>
          <div
            style={{ height: STATUS_ROW_HEIGHT }}
            className="flex items-center"
          >
            Driving
          </div>
          <div
            style={{ height: STATUS_ROW_HEIGHT }}
            className="flex items-center"
          >
            On Duty (Not Driving)
          </div>
          <div style={{ height: REMARKS_HEIGHT }} className="flex items-center">
            REMARKS
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto ">
          <svg
            width={width}
            height={height}
            className="border border-gray-300 print:scale-90"
          >
            {/* Status grid section */}
            <g>
              {/* Draw horizontal status lines */}
              {Array.from({ length: 5 }).map((_, i) => (
                <line
                  key={`status-${i}`}
                  x1={0}
                  y1={i * STATUS_ROW_HEIGHT}
                  x2={width}
                  y2={i * STATUS_ROW_HEIGHT}
                  stroke="black"
                  strokeWidth="1"
                />
              ))}

              {/* Draw vertical hour lines and interval marks (only in status grid) */}
              {Array.from({ length: 25 }).map((_, i) => (
                <React.Fragment key={`hour-${i}`}>
                  {/* Hour line */}
                  <line
                    x1={i * HOUR_WIDTH}
                    y1={0}
                    x2={i * HOUR_WIDTH}
                    y2={GRID_HEIGHT}
                    stroke="black"
                    strokeWidth="1"
                  />
                  {/* Interval marks between hours */}
                  {i < 24 &&
                    Array.from({ length: 4 }).map((_, row) => (
                      <React.Fragment key={`intervals-${i}-${row}`}>
                        {/* 30-minute mark */}
                        <line
                          x1={i * HOUR_WIDTH + HOUR_WIDTH / 2}
                          y1={row * STATUS_ROW_HEIGHT}
                          x2={i * HOUR_WIDTH + HOUR_WIDTH / 2}
                          y2={row * STATUS_ROW_HEIGHT + STATUS_ROW_HEIGHT / 2}
                          stroke="black"
                          strokeWidth="0.5"
                        />
                        {/* 15-minute mark */}
                        <line
                          x1={i * HOUR_WIDTH + HOUR_WIDTH / 4}
                          y1={row * STATUS_ROW_HEIGHT}
                          x2={i * HOUR_WIDTH + HOUR_WIDTH / 4}
                          y2={row * STATUS_ROW_HEIGHT + STATUS_ROW_HEIGHT / 4}
                          stroke="black"
                          strokeWidth="0.5"
                        />
                        {/* 45-minute mark */}
                        <line
                          x1={i * HOUR_WIDTH + (HOUR_WIDTH * 3) / 4}
                          y1={row * STATUS_ROW_HEIGHT}
                          x2={i * HOUR_WIDTH + (HOUR_WIDTH * 3) / 4}
                          y2={row * STATUS_ROW_HEIGHT + STATUS_ROW_HEIGHT / 4}
                          stroke="black"
                          strokeWidth="0.5"
                        />
                      </React.Fragment>
                    ))}
                  {/* Hour labels */}
                  {i < 24 && (
                    <text
                      x={i * HOUR_WIDTH}
                      y={height - REMARKS_HEIGHT + 15}
                      fontSize="12"
                      textAnchor="start"
                    >
                      {i.toString().padStart(2, "0")}:00
                    </text>
                  )}
                </React.Fragment>
              ))}
            </g>

            {/* Draw status lines based on logs */}
            {logs.map((log, index) => {
              const startX = timeToPosition(new Date(log.start_time));
              const endX = timeToPosition(new Date(log.end_time));
              const y =
                (STATUS_POSITIONS[log.status] + 0.5) * STATUS_ROW_HEIGHT;
              let endY = y;
              const nextLog = logs[index + 1];

              // Calculate diagonal line points if status changes
              let diagonalLine = null;
              let remarkText = null;

              if (nextLog && nextLog.status !== log.status) {
                endY =
                  (STATUS_POSITIONS[nextLog.status] + 0.5) * STATUS_ROW_HEIGHT;

                // Add diagonal line to remarks section
                diagonalLine = (
                  <line
                    key={`diagonal-${index}`}
                    x1={endX}
                    y1={endY}
                    x2={endX - 50}
                    y2={height - 20}
                    stroke="blue"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                );

                // Add remark text if exists
                if (log.remarks) {
                  remarkText = (
                    <text
                      key={`remark-${index}`}
                      x={endX - 85}
                      y={height - 5}
                      fontSize="10"
                      fill="blue"
                    >
                      {log.remarks}
                    </text>
                  );
                }
              }

              return (
                <React.Fragment key={`log-${index}`}>
                  {/* Status line */}
                  <line
                    x1={startX}
                    y1={y}
                    x2={endX}
                    y2={y}
                    stroke="blue"
                    strokeWidth="2"
                  />
                  {/* Vertical line for status change */}
                  {endY !== y && (
                    <line
                      x1={endX}
                      y1={y}
                      x2={endX}
                      y2={endY}
                      stroke="blue"
                      strokeWidth="2"
                    />
                  )}
                  {/* Diagonal line to remarks */}
                  {diagonalLine}
                  {/* Remark text */}
                  {remarkText}
                </React.Fragment>
              );
            })}

            {/* Remarks section - just horizontal lines, no vertical lines */}
            <line
              x1={0}
              y1={GRID_HEIGHT}
              x2={width}
              y2={GRID_HEIGHT}
              stroke="black"
              strokeWidth="1"
            />
            <line
              x1={0}
              y1={height}
              x2={width}
              y2={height}
              stroke="black"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
