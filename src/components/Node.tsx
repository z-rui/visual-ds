// src/components/Node.tsx
import React from 'react';
import { useSpring, animated } from 'react-spring';

interface NodeProps {
  cx: number;
  cy: number;
  r: number;
  value: number | string;
  opacity?: number;
  fill?: string;
  stroke?: string;
}

const Node: React.FC<NodeProps> = ({ cx, cy, r, value, opacity = 1, fill = '#4a90e2', stroke = '#333' }) => {
  const { transform, nodeOpacity, fillColor, strokeColor } = useSpring({
    to: {
      transform: `translate(${cx}, ${cy})`,
      nodeOpacity: opacity,
      fillColor: fill,
      strokeColor: stroke,
    },
    config: {
      tension: 280,
      friction: 60,
    },
  });

  return (
    <animated.g transform={transform} style={{ opacity: nodeOpacity }}>
      <animated.circle
        cx={0}
        cy={0}
        r={r}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
      />
      <text
        x={0}
        y={0}
        dy=".3em"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="bold"
        style={{ pointerEvents: 'none' }} // Prevent text from capturing mouse events
      >
        {value}
      </text>
    </animated.g>
  );
};

export default Node;
