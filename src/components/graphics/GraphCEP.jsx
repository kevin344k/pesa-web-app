import React, { useEffect, useRef, useState, useContext } from "react";
import * as d3 from "d3";
import { SocketContext } from "../../App"; // ajusta la ruta según tu estructura

export default function GraphCEP({ machineId }) {
  const socket = useContext(SocketContext);
  const ref = useRef();
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SOCKET_URL}/cep/${machineId}`);
      const result = await res.json();

      const formatted = result.map((d) => ({
        hour: d.shift_hour,
        weight:
          (Number(d.weight_1) +
            Number(d.weight_2) +
            Number(d.weight_3) +
            Number(d.weight_4)) /
          4,
      }));

      setData(formatted);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    fetchData();

    if (!socket) return;

    const handler = (payload) => {
      if (payload.machine_id === machineId) {
        fetchData();
      }
    };

    socket.on("spc_update", handler);

    return () => {
      socket.off("spc_update", handler);
    };
  }, [machineId, socket]);

  useEffect(() => {
    if (!data.length) return;

    const svgElement = d3.select(ref.current);
    svgElement.selectAll("*").remove();

    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = svgElement
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.hour))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.weight) || 100])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(168, 85, 247, 0.6)");

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(168, 85, 247, 0)");

    const area = d3
      .area()
      .x((d) => x(d.hour))
      .y0(y(0))
      .y1((d) => y(d.weight))
      .curve(d3.curveMonotoneX);

    svg.append("path").datum(data).attr("fill", "url(#area-gradient)").attr("d", area);

    const line = d3
      .line()
      .x((d) => x(d.hour))
      .y((d) => y(d.weight))
      .curve(d3.curveMonotoneX);

    svg.append("path").datum(data).attr("fill", "none").attr("stroke", "#a855f7").attr("stroke-width", 2).attr("d", line);

    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));
  }, [data]);

  return (
    <div className="bg-[#18181b] p-4 rounded-md">
      <h2 className="text-white mb-2">Control de Peso Promedio</h2>
      <div ref={ref}></div>
    </div>
  );
}
