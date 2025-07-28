import * as d3 from "d3";
import { useEffect, useRef } from "react";

export default function BarChartMachine({ data }) {
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

        group
          .append("rect")
          .attr("fill", "#f87171")
          .attr("height", barHeight - 6)
          .attr("width", 0) // animación desde 0
          .style("cursor", "pointer")
          .on("click", (event) => {
            const tooltip = d3.select(tooltipRef.current);
            tooltip
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY + "px")
              .style("display", "block")
              .style("position", "absolute")
              .style("background", "#111")
              .style("color", "#fff")
              .style("padding", "8px")
              .style("border-radius", "6px")
              .style("font-size", "12px")
              .html(`<strong>${d.maquina}</strong><br/>${d.descripcion || "Sin descripción"}`);
          })
          .transition()
          .duration(800)
          .attr("width", x(d.horas));

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
      .text((d) => d.maquina);

    // Ocultar tooltip al hacer clic fuera
    const handleClickOutside = (e) => {
      if (!tooltipRef.current.contains(e.target)) {
        d3.select(tooltipRef.current).style("display", "none");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [data]);

  return (
    <>
      <div ref={ref} className="overflow-auto relative m-auto" />
      <div ref={tooltipRef} className="absolute z-50 hidden" />
    </>
  );
}
