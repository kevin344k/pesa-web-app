import * as d3 from "d3";
import { useEffect, useRef } from "react";

export default function BarChart({ data }) {
  const ref = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const container = d3.select(ref.current);
    container.selectAll("*").remove(); // limpia el gráfico anterior

    const width = 300;
    const barHeight = 24;
    const height = barHeight * data.length;

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.horas)])
      .range([0, width - 120]);

    svg
      .selectAll("g")
      .data(data)
      .join("g")
      .attr("transform", (_, i) => `translate(50,${i * barHeight})`)
      .each(function (d) {
        const group = d3.select(this);

        const rect = group
          .append("rect")
          .attr("fill", "#f87171")
          .attr("height", barHeight - 6)
          .attr("width", 0)
          .style("cursor", "pointer")
          .on("click", (event) => {
            const tooltip = d3.select(tooltipRef.current);
            tooltip
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY + "px")
              .style("display", "block")
              .style("position", "absolute")
              .classed("hidden", false)
              .classed("show", true)
              .html(`<strong>${d.codigo}</strong><br>${d.descripcion}`);
          });

        // Aplica la animación separadamente
        rect
          .transition()
          .duration(800)
          .attr("width", x(d.horas));

        // Texto de la cantidad de horas
        group
          .append("text")
          .attr("x", x(d.horas) + 4)
          .attr("y", barHeight / 2)
          .attr("dy", ".35em")
          .attr("fill", "#fff")
          .attr("font-size", "12px")
          .text(`${d.horas.toFixed(1)}h`);
      });

    svg
      .selectAll("text.label")
      .data(data)
      .join("text")
      .attr("class", "label")
      .attr("x", 0)
      .attr("y", (_, i) => i * barHeight + barHeight / 2)
      .attr("dy", ".35em")
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .text((d) => d.codigo);
  }, [data]);

  // Oculta el tooltip si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        d3.select(tooltipRef.current)
          .classed("hidden", true)
          .classed("show", false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <div ref={ref} className="overflow-auto relative m-auto" />
      <div
        ref={tooltipRef}
        className="tooltip absolute z-50 bg-black text-white text-xs p-2 rounded shadow hidden max-w-[250px] pointer-events-none"
      ></div>
    </>
  );
}
