function drawChoropleth(year) {

    const margin = { top: 50, right: 50, bottom: 30, left: 50 };
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    Promise.all([
        d3.json("data/tourism/tourism_arr_dep.json"),
        d3.json("data/world.geojson")
    ]).then(([tourism, map]) => {        
        var filteredTourism = tourism.filter(entry => entry.Year === year);
        // console.log(filteredTourism);

        var projection = d3.geoMercator()
            .scale(100) 
            .translate([width / 2, height / 2 + 70]);;

        var svg = d3.select('#choropleth-ratio')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Clear path first
        svg.selectAll("path").remove();

        var path = d3.geoPath().projection(projection);

        // Create a color scale for the departure/arrival ratio data
        var ratioExtent = d3.extent(filteredTourism, d => d.DA_Ratio);
        var colorScale = d3.scaleSequential(function(t) {
            return t >=1 ? d3.interpolateReds(t/ 5) : d3.interpolateBlues(1 - t);
        }).domain([-1, 1]);

        // Draw the map features
        svg.selectAll("path")
            .data(map.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", d => {
                // Find the corresponding country in the tourism dataset
                var countryData = filteredTourism.find(country => country.Country_code === d.properties.iso_a3);
                if (countryData && countryData.DA_Ratio !== null) {
                    var ratio = countryData.DA_Ratio;
                    if (ratio >= 1) {
                        return colorScale(ratio);
                        // return d3.interpolateReds(ratio);
                    }
                    else {
                        return colorScale(ratio);
                        // return d3.interpolateBlues(ratio);
                    }
                }

                // Handle missing data with a default color
                return 'black';
            })
            .attr("stroke", "gray")
            .attr("stroke-width", 1)
            // Add hover functionality
            .on("mouseover", function (event, d) {
                var countryData = filteredTourism.find(country => country.Country_code === d.properties.iso_a3);
                var ratioTooltip = (countryData && countryData.DA_Ratio) ? countryData.DA_Ratio.toFixed(2) : "No Data";
                var tooltipText = countryData ? `${countryData.Country}: ${ratioTooltip}` : "No Data";
                // Show tooltip
                c_tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                c_tooltip.html(tooltipText)
                    .style("left", (event.pageX - 225) + "px")
                    .style("top", (event.pageY - 50) + "px");
            })
            .on("mouseout", function (d) {
                // Hide tooltip on mouseout
                c_tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add plot title
        svg.append("text")
        .attr("x", 200)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text(`Departure Over Arrival Ratio in ${year}`);

        // Add a color legend
        const legendWidth = 200;
        const legendHeight = 20;
        const numColorBands = 10;

        var legend = svg.append('g')
            .attr('transform', 'translate(' + (width / 2 - legendWidth / 2) + ',' + '10)');

        var legendColorScale = d3.scaleLinear()
            .domain([0, numColorBands - 1])
            .range(ratioExtent);

        legend.selectAll('rect')
            .data(d3.range(numColorBands))
            .enter()
            .append('rect')
            .attr('x', d => d * (legendWidth / numColorBands) + 225)
            .attr('width', legendWidth / numColorBands)
            .attr('height', legendHeight)
            .style('fill', d => colorScale(legendColorScale(d)))
            .style('stroke', 'white');

        var format = d3.format('~s');

        legend.append('text')
            .attr('x', 220)
            .attr('y', legendHeight / 2)
            .attr('dy', '0.35em')
            .style('text-anchor', 'end')
            .style('font-size', '12px')
            .text(format(ratioExtent[0]));

        legend.append('text')
            .attr('x', legendWidth + 230)
            .attr('y', legendHeight / 2)
            .attr('dy', '0.35em')
            .style('text-anchor', 'start')
            .style('font-size', '12px')
            .text(format(ratioExtent[1]));

        svg.append('text')
            .attr('x', 150)
            .attr('y', height - 40)
            .attr('text-anchor', 'start')
            .style('font-size', '14px')
            .text('Color intensities correlated to Departure/Arrival ratio. Blacked out countries are nulls.');

        svg.append('text')
            .attr('x', 150)
            .attr('y', height - 25)
            .attr('text-anchor', 'start')
            .style('font-size', '14px')
            .text('Blue colors show ratios < 1, red colors show ratios >= 1.');

        svg.append('text')
            .attr('x', 150)
            .attr('y', height - 55)
            .attr('text-anchor', 'start')
            .style('font-size', '14px')
            .text('Hover on countries to see name and ratio.');

        // Add hover capabilities
        var c_tooltip = d3.select("#choropleth-ratio")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    });
}