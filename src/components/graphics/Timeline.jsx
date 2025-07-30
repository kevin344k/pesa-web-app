import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

export default function Timeline({ machineId, timeRange }) {
  const ref = useRef();
  const [logs, setLogs] = useState([]);
  const [containerWidth, setContainerWidth] = useState(600); // ancho inicial

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SOCKET_URL}/timeline/${machineId}?range=${timeRange}`
        );

        if (!res.ok) throw new Error("Error al obtener timeline");

        const data = await res.json();

        const formatted = data.map((d) => ({
          start: d.start_timestamp,
          end: d.end_timestamp,
          status: d.status,
        }));

        setLogs(formatted);
      } catch (err) {
        console.error("Error obteniendo timeline:", err);
      }
    };

    if (machineId) fetchData();
  }, [machineId, timeRange]);

  // Detectar el ancho del contenedor dinámicamente
  useEffect(() => {
    const container = ref.current?.parentElement;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      setContainerWidth(container.clientWidth);
    });

    observer.observe(container);
    setContainerWidth(container.clientWidth);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!logs.length) return;

    const svgContainer = d3.select(ref.current);
    svgContainer.selectAll("*").remove();

    const margin = { top: 5, right: 5, bottom: 5, left: 5 };
    const height = 40;
    const parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
    const formatTime = d3.timeFormat("%m-%d %H:%M");
    const now = new Date();

    const data = logs.map((d) => ({
      start: parseTime(d.start),
      end: d.end ? parseTime(d.end) : now,
      status: d.status,
    }));

    const svg = svgContainer
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", height + margin.top + margin.bottom)
       .style("display", "block")       // <--- Añadido
  .style("margin", "0 auto") 
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain([d3.min(data, (d) => d.start), d3.max(data, (d) => d.end)])
      .range([0, containerWidth - margin.left - margin.right]);

    // Tooltip global
    let tooltip = d3.select("#tooltip");
    if (tooltip.empty()) {
      tooltip = d3
        .select("body")
        .append("div")
        .attr("id", "tooltip")
        .attr(
          "class",
          "absolute bg-black text-white text-xs p-2 rounded shadow hidden z-50"
        );
    }

    svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.start))
      .attr("y", 10)
      .attr("width", (d) => x(d.end) - x(d.start))
      .attr("height", 20)
        .attr("rx", 1) // esquinas redondeadas
  .attr("ry", 1) // esquinas redondeadas
      .attr("fill", (d) => ({
  RUN: "#4ade80",
  STOP: "#f87171",
  SIN_OP: "#9ca3af",
}[d.status] || "#f87171")) // fallback rojo

      .on("mouseover", function (event, d) {
        const durationMinutes = Math.round((d.end - d.start) / (1000 * 60));
        const durationText =
          durationMinutes >= 60
            ? `${(durationMinutes / 60).toFixed(1)} horas`
            : `${durationMinutes} min`;

        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`)
          .style("display", "block")
          .html(`
            <div><strong>Estado:</strong> ${d.status}</div>
            <div><strong>Inicio:</strong> ${formatTime(d.start)}</div>
            <div><strong>Fin:</strong> ${
              d.end ? formatTime(d.end) : "En curso"
            }</div>
            <div><strong>Duración:</strong> ${durationText}</div>
          `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => tooltip.style("display", "none"));

    // Eje X
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - 5})`)
     
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-45)")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em");
  }, [logs, containerWidth]);

  return <div ref={ref} className="overflow-x-auto  py-5 flex justify-center items-center w-full" />;
}
