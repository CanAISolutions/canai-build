import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type EmotionalCompassProps = {
  scores: {
    awe: number;
    ownership: number;
    wonder: number;
    calm: number;
    power: number;
  };
  title?: string;
};

const EmotionalCompass: React.FC<EmotionalCompassProps> = ({
  scores,
  title = 'Emotional Resonance',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 20;
    const center = { x: width / 2, y: height / 2 };

    const emotions = ['Awe', 'Ownership', 'Wonder', 'Calm', 'Power'];
    const values = [
      scores.awe,
      scores.ownership,
      scores.wonder,
      scores.calm,
      scores.power,
    ];

    const angleSlice = (Math.PI * 2) / emotions.length;

    // Create scales
    const rScale = d3.scaleLinear().domain([0, 1]).range([0, radius]);

    // Draw background circles
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      svg
        .append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', (radius / levels) * i)
        .attr('fill', 'none')
        .attr('stroke', '#36d1fe')
        .attr('stroke-opacity', 0.2)
        .attr('stroke-width', 1);
    }

    // Draw axes
    emotions.forEach((emotion, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;

      svg
        .append('line')
        .attr('x1', center.x)
        .attr('y1', center.y)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#36d1fe')
        .attr('stroke-opacity', 0.3)
        .attr('stroke-width', 1);

      // Add labels
      const labelX = center.x + Math.cos(angle) * (radius + 15);
      const labelY = center.y + Math.sin(angle) * (radius + 15);

      svg
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#E6F6FF')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .text(emotion);
    });

    // Create path for radar area
    const lineGenerator = d3
      .line<[number, number]>()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveLinearClosed);

    const pathData: [number, number][] = values.map((value, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = center.x + Math.cos(angle) * rScale(value);
      const y = center.y + Math.sin(angle) * rScale(value);
      return [x, y];
    });

    // Draw radar area
    svg
      .append('path')
      .datum(pathData)
      .attr('d', lineGenerator)
      .attr('fill', '#00CFFF')
      .attr('fill-opacity', 0.2)
      .attr('stroke', '#00CFFF')
      .attr('stroke-width', 2);

    // Draw data points
    pathData.forEach((point, _i) => {
      svg
        .append('circle')
        .attr('cx', point[0])
        .attr('cy', point[1])
        .attr('r', 3)
        .attr('fill', '#00CFFF')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1);
    });
  }, [scores]);

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-sm font-semibold text-canai-light mb-2">{title}</h4>
      <svg
        ref={svgRef}
        width="200"
        height="200"
        className="overflow-visible"
        role="img"
        aria-label={`Emotional compass showing scores for Awe: ${(
          scores.awe * 100
        ).toFixed(0)}%, Ownership: ${(scores.ownership * 100).toFixed(
          0
        )}%, Wonder: ${(scores.wonder * 100).toFixed(0)}%, Calm: ${(
          scores.calm * 100
        ).toFixed(0)}%, Power: ${(scores.power * 100).toFixed(0)}%`}
      />
    </div>
  );
};

export default EmotionalCompass;
