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
    return (time.getHours() + time.getMinutes() / 60) * HOUR_WIDTH;
  };

  return (
    <div className="flex items-start print:overflow-visible">
      {/* Status labels outside grid */}
      <div className="flex flex-col" style={{ width: LABEL_WIDTH }}>
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
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="border border-gray-300">
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
            const y = (STATUS_POSITIONS[log.status] + 0.5) * STATUS_ROW_HEIGHT;

            return (
              <line
                key={`log-${index}`}
                x1={startX}
                y1={y}
                x2={endX}
                y2={y}
                stroke="blue"
                strokeWidth="2"
              />
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
  );
};
