import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function Dash() {
  const [animatedData, setAnimatedData] = useState([
    { name: "Bodega PT", porcentaje: 0 },
    { name: "Bodega FOAM 1", porcentaje: 0 },
    { name: "Bodega FOAM 2", porcentaje: 0 },
  ]);

  const targetData = [
    { name: "Bodega FOAM 1", porcentaje: 70 },
    { name: "Bodega FOAM 2", porcentaje: 30 },
  ];

  const data = [
    { date: "2025-01-01", value: 20 },
    { date: "2025-01-02", value: 40 },
    { date: "2025-01-03", value: 25 },
    { date: "2025-01-04", value: 60 },
    { date: "2025-01-05", value: 45 },
    { date: "2025-01-06", value: 80 },
    { date: "2025-01-07", value: 70 },
  ];

  const chartRef = useRef();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedData(targetData);
    }, 200);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const container = chartRef.current;
    const svgEl = d3.select(container);
    svgEl.selectAll("*").remove();

    const containerWidth = container.clientWidth || 400;
    const containerHeight = 200;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = svgEl
      .attr("width", "100%")
      .attr("height", containerHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");
    const formattedData = data.map((d) => ({
      date: parseDate(d.date),
      value: d.value,
    }));

    const x = d3
      .scaleTime()
      .domain(d3.extent(formattedData, (d) => d.date))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(formattedData, (d) => d.value)])
      .nice()
      .range([height, 0]);

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "areaGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(168, 85, 247, 0.7)");
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(169, 85, 247, 0.04)");

    const area = d3
      .area()
      .x((d) => x(d.date))
      .y0(y(0))
      .y1((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    const path = svg
      .append("path")
      .datum(formattedData)
      .attr("fill", "url(#areaGradient)")
      .attr("d", area)
      .attr("opacity", 0);

    path
      .transition()
      .duration(1000)
      .attr("opacity", 1)
      .attrTween("d", function () {
        const interpolator = d3.interpolateArray(
          formattedData.map((d) => ({ ...d, value: 0 })),
          formattedData
        );
        return (t) => area(interpolator(t));
      });

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%b %d")))
      .selectAll("text")
  .style("fill", "#fff"); // texto blanco
    svg.append("g").call(d3.axisLeft(y).ticks(5));

svg.selectAll(".domain, .tick line") // línea base y ticks
  .style("stroke", "#aaa"); // líneas más claras
// Eje Y
const yAxis = svg.append("g").call(d3.axisLeft(y).ticks(5));
yAxis.selectAll("text").style("fill", "#fff"); // texto blanco
yAxis.selectAll(".domain, .tick line").style("stroke", "#aaa"); // líneas claras




  }, [data]);

  return (
    <div className="bg-secondary-night min-h-screen p-6">
      <p className="text-center font-bold text-white text-xl mb-4">Dashboard</p>
      <p className="text-neutral-500">Bodegas Rollos FOAM </p>

      <div className="grid grid-cols-2 gap-6 text-center mt-4 place-content-center">
        {animatedData.map((dat, index) => (
          <div
            key={index}
            className="relative bg-[#313133] rounded-xl h-32 shadow-lg flex flex-col justify-end overflow-hidden border border-neutral-700"
          >
            <div
              className="absolute bottom-0 border-t-2 border-purple-700 left-0 w-full transition-all duration-700"
              style={{
                height: `${dat.porcentaje}%`,
                background:
                  "linear-gradient(to top,rgba(169, 85, 247, 0.06), rgba(169, 85, 247, 0.44))",
              }}
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <p className="text-white font-bold text-lg">{dat.porcentaje}%</p>
              <p className="text-sm text-neutral-300 mt-1">{dat.name}</p>
            </div>
          </div>
        ))}

        <div className="col-span-2 bg-[#313133] rounded-md p-4 mt-6 shadow-lg border border-neutral-700">
          <p className="text-white text-sm mb-2">Toneladas Producidas</p>
          <svg ref={chartRef} className="w-full"></svg>
        </div>
      </div>
    </div>
  );
}
