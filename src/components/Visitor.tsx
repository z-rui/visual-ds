// src/components/Visitor.tsx
import React from 'react';

interface VisitorProps {
  cx: number;
  cy: number;
  isVisible: boolean;
}

const Visitor: React.FC<VisitorProps> = ({ cx, cy, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={22} // Slightly larger than the node radius
      fill="none"
      stroke="rgba(255, 165, 0, 0.8)" // A distinct orange color
      strokeWidth={3}
      style={{
        transition: 'cx 400ms ease-in-out, cy 400ms ease-in-out', // Smooth transition
      }}
    />
  );
};

export default Visitor;
