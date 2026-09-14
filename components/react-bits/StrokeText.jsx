import { useEffect, useRef, useState } from 'react';
import './StrokeText.css';

const StrokeText = ({
  text,
  strokeWidth = 2,
  strokeColor = '#ffffff',
  className = '',
  fontSize = '4rem',
  fontWeight = 800,
  duration = 2,
  delay = 0,
  animate = true
}) => {
  const [paths, setPaths] = useState([]);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;

    const createTextPaths = () => {
      // Create a temporary canvas to measure text and generate a path-like structure
      // SVG text element doesn't expose its path directly without complex font parsing.
      // We will use an SVG <text> element with stroke styling and CSS animation for the effect.
    };
    createTextPaths();
  }, [text]);

  return (
    <div className={`stroke-text-container ${className}`}>
      <svg
        ref={svgRef}
        className="stroke-text-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
      >
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fontSize={fontSize}
          fontWeight={fontWeight}
          className={`stroke-text ${animate ? 'animate' : ''}`}
          style={{
            '--duration': `${duration}s`,
            '--delay': `${delay}s`
          }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
};

export default StrokeText;

