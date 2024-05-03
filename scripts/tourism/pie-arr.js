function drawPieArrv(year) {
  var specifiedYear = year

  d3.json("data/tourism/tourism_arr_dep.json").then(data => {
    data = data.filter(d => d.Year === specifiedYear)
            .map(d => ({
                country: d.Country,
                year: d.Year,
                arrival: d.Arrivals,
                continent: d.Continent
            }));

    // Group data by continent and calculate the sum for each continent
    var continentData = Array.from(d3.group(data, d => d.continent),
      ([key, values]) => ({
        key,
        value: d3.sum(values, d => d.arrival)
     }));

    // console.log(continentData);

    const pa_margin = { top: 60, right: 50, bottom: 60, left: 50 };
    const pa_width = 600 - pa_margin.left - pa_margin.right;
    const pa_height = 500 - pa_margin.top - pa_margin.bottom;
    const pa_radius = Math.min(pa_width, pa_height) / 2 - 20;

    color = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select('#pie-arrv')
      .append('svg')
      .attr("width", pa_width)
      .attr("height", pa_height)
      .append("g")
      .attr("transform", `translate(${pa_width - 300},${pa_height / 2})`);

    const pie = d3.pie()
      .value(d => d.value);

    const arc = d3.arc()
      .outerRadius(pa_radius)
      .innerRadius(0);

    const arcs = svg.selectAll("arc")
      .data(pie(continentData))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i));

    // Add plot title
    svg.append("text")
      .attr("x", 55)
      .attr("y", -175)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text(`Tourism Arrivals by Continent in Year ${specifiedYear}`);

    // Add captions
    svg.append("text")
      .attr("x", 55)
      .attr("y", 175)
      .attr('text-anchor', 'start')
      .style('font-size', '14px')
      .text('Hover to see percentages.');

    // Add legend
    const legend = svg.selectAll(".legend")
      .data(continentData)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
      .attr("x", 175)
      .attr("y", -50)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (d, i) => color(i));

    legend.append("text")
      .attr("x", 200)
      .attr("y", -40)
      .attr("dy", ".35em")
      .style('font-size', '14px')
      .style("text-anchor", "start")
      .text(d => d.key);

    // On hoover, display the percentages
    var pa_tooltip = d3.select("#pie-arrv")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i))
        .on("mouseover", function (event, d) {
            const percentage = ((d.value / d3.sum(continentData, d => d.value)) * 100).toFixed(2);
            pa_tooltip.transition()
                .duration(200)
                .style("opacity", .9);
                pa_tooltip.html(`${d.data.key}: ${percentage}%`)
                .style("left", (event.pageX - 225) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            pa_tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
})}
