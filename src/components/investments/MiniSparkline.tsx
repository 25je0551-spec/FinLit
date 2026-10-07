import React from 'react';

interface MiniSparklineProps {
  data: number[];
  isPositive: boolean;
  width?: number;
  height?: number;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  isPositive,
  width = 110,
  height = 36,
}) => {
  if (!data || data.length < 2) {
    return <div className="h-9 w-28 bg-[#F0F5FA] rounded-md animate-pulse" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Add 10% padding top and bottom so lines don't clip
  const paddingY = 4;
  const usableHeight = height - paddingY * 2;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - paddingY - ((val - min) / range) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#059669' : '#E11D48'; // emerald-600 vs rose-600
  const fillColor = isPositive ? 'rgba(5, 150, 105, 0.08)' : 'rgba(225, 29, 72, 0.08)';

  // Closed area polygon for gentle gradient fill
  const firstX = '0';
  const lastX = width.toString();
  const bottomY = height.toString();
  const areaPoints = `${firstX},${bottomY} ${points} ${lastX},${bottomY}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <polygon points={areaPoints} fill={fillColor} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
