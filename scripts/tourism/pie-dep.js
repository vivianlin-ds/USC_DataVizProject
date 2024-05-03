function drawPieDept(year) {
  var specifiedYear = year

  d3.json("data/tourism/tourism_arr_dep.json").then(data => {
    
    data = data.filter(d => d.Year === specifiedYear)
            .map(d => ({
                country: d.Country,
                year: d.Year,
                departures: d.Departures,
                continent: d.Continent
            }));

    // Group data by continent and calculate the sum for each continent
    var continentData = Array.from(d3.group(data, d => d.continent),
      ([key, values]) => ({
        key,
        value: d3.sum(values, d => d.departures)
     }));

    // console.log(continentData);

    const pd_margin = { top: 60, right: 50, bottom: 60, left: 50 };
    const pd_width = 600 - pd_margin.left - pd_margin.right;
    const pd_height = 500 - pd_margin.top - pd_margin.bottom;
    const pd_radius = Math.min(pd_width, pd_height) / 2 - 20;

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select("#pie-dept")
      .append("svg")
      .attr("width", pd_width)
      .attr("height", pd_height)
      .append("g")
      .attr("transform", `translate(${pd_width - 300},${pd_height / 2})`);

    var pie = d3.pie()
      .value(d => d.value);

    var arc = d3.arc()
      .outerRadius(pd_radius)
      .innerRadius(0);

    var arcs = svg.selectAll("arc")
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
      .text(`Tourism Departures by Continent in Year ${specifiedYear}`);

    // Add captions
    svg.append("text")
      .attr("x", 55)
      .attr("y", 175)
      .attr('text-anchor', 'start')
      .style('font-size', '14px')
      .text('Hover to see percentages.');

    // Add legend
    var legend = svg.selectAll(".legend")
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
    var pd_tooltip = d3.select("#pie-dept")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i))
        .on("mouseover", function (event, d) {
            const percentage = ((d.value / d3.sum(continentData, d => d.value)) * 100).toFixed(2);
            pd_tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            pd_tooltip.html(`${d.data.key}: ${percentage}%`)
                .style("left", (event.pageX - 225) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            pd_tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
})}
