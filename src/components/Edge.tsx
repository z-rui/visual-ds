// src/components/Edge.tsx
import React from 'react';
import { useSpring, animated } from 'react-spring';

interface EdgeProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  opacity?: number;
}

const Edge: React.FC<EdgeProps> = ({ sourceX, sourceY, targetX, targetY, opacity = 1 }) => {
  const props = useSpring({
    to: {
      x1: sourceX,
      y1: sourceY,
      x2: targetX,
      y2: targetY,
      edgeOpacity: opacity,
    },
    config: {
      tension: 280,
      friction: 60,
    },
  });

  return (
    <animated.line
      x1={props.x1}
      y1={props.y1}
      x2={props.x2}
      y2={props.y2}
      stroke="#555"
      strokeWidth={2}
      style={{ opacity: props.edgeOpacity }}
    />
  );
};

export default Edge;