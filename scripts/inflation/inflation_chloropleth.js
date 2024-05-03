// Define the dimensions of your map and legend
var mapWidth = 550;  // Adjust the width of the map
var legendWidth = 400;
var height = 400;
var borderWidth = 2; // Width of the black border

// Create an SVG element to append to the body
var svg = d3.select("#inflation").append("svg")
    .attr("width", mapWidth + legendWidth + 2 * borderWidth) // Include border width
    .attr("height", height)
    .style("border", borderWidth + "px solid black") // Add black border

// Define a projection (you can choose different projections based on your preference)
var projection = d3.geoMercator()
    .scale(125)
    .translate([mapWidth / 2 + 100, height / 2 + 50]);

// Create a path generator using the projection
var path = d3.geoPath()
    .projection(projection);

var tooltip = d3.select("#inflation").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "10px")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px");

// Function to draw the map based on the selected year
function drawMap(selectedYear) {
    // Load the GeoJSON data and the additional data for the selected year
    Promise.all([
        d3.json("data/world.geojson"),
        d3.json("scripts/inflation/inflation_files/chloropleth_data.json")
    ]).then(function ([world, inflationData]) {
        // Draw the countries
        svg.selectAll("path").remove(); // Remove existing paths before redrawing
        svg.selectAll("path")
            .data(world.features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function (d) {
                var countryCode = d.properties.iso_a3;
                var inflationValue = inflationData[countryCode] ? inflationData[countryCode][selectedYear] : "null";
                // Check if the value is "null" or numerical
                if (inflationValue === "null") {
                    return "black";
                } else {
                    inflationValue = parseFloat(inflationValue);
                    if (inflationValue >= 0) {
                        // Positive values in blue
                        return d3.interpolateReds(inflationValue / 10); // Adjust the scale as needed
                    } else {
                        // Negative values in red
                        return d3.interpolateBlues(-inflationValue); // Adjust the scale as needed
                    }
                }
            })
            .style("stroke", "gray") // Customize the stroke color
            .on("mouseover", function (event, d) {
                showTooltip(event, d, inflationData, selectedYear);
            })
            .on("mouseout", function () {
                hideTooltip();
            })
            .on("click", function (event, d) {
                var countryCode = d.properties.iso_a3;
                var countryName = d.properties.admin;
                handleCountryClick(countryCode, countryName);
            });
        drawLegend(selectedYear, inflationData);
    });
}

// Function to handle the click event on a country
function handleCountryClick(countryCode, countryName) {
    // Define the filenames
    var filenames = ['ccpi.json', 'ecpi.json', 'ppi.json', 'fcpi.json'];

    // Load all data files
    Promise.all(filenames.map(function (filename) {
        var filePath = 'scripts/inflation/inflation_files/' + filename;
        return d3.json(filePath);
    })).then(function ([ccpiData, ecpiData, ppiData, fcpiData]) {
        // Filter out data for the specific countryCode
        var filteredCCPIData = ccpiData[countryCode];
        var filteredECPIData = ecpiData[countryCode];
        var filteredPPIData = ppiData[countryCode];
        var filteredFCPIData = fcpiData[countryCode];

        // Call the generateGraphs function with the filtered data
        generateGraphs(countryCode, countryName, filteredCCPIData, filteredECPIData, filteredPPIData, filteredFCPIData);
    });
}

function generateGraphs(countryCode, countryName, ccpiData, ecpiData, ppiData, fcpiData) {
    // Clear existing line graphs and titles
    d3.selectAll('.line-chart').remove();

    // Check if any of the filtered data is undefined
    var definedData = {
        'ccpi-chart': ccpiData,
        'ppi-chart': ppiData,
        'ecpi-chart': ecpiData,
        'fcpi-chart': fcpiData
    };

    // Add padding between charts only if there's at least one chart
    if (Object.values(definedData).some(data => data && !Object.values(data).every(value => value === "null"))) {
        // Add padding between charts
        d3.select("#inflation")
            .append("div")
            .style("height", "20px")
            .attr('class', 'line-chart'); // Adjust the height for the desired padding

        // Add a title with the country name
        d3.select("#inflation")
            .append("h3")
            .attr('class', 'line-chart')
            .text(`Inflation Data for ${countryName}`);
    }

    Object.entries(definedData).forEach(([chartId, data]) => {
        // Check if data is truthy before attempting to use Object.values(data)
        if (data && !Object.values(data).every(value => value === "null")) {
            // Add a title and call createLineGraphs only if not all values are "null"
            createLineGraphs(chartId, data, `${chartId} Data`);
        }
    });
}

function createLineGraphs(chartId, data, title) {
    var current = "";
    if (chartId == 'ccpi-chart') {
        current = 'Core Consumer Price Index';
        additionalText = 
        `is a measure that examines the average change in prices paid 
        by consumers for goods and services over time. It is commonly 
        used to gauge inflation and reflect changes in the cost of 
        living. The Core Consumer Price Index specifically excludes 
        certain volatile items, such as food and energy, to provide 
        a more stable and consistent measure of underlying inflation 
        trends.`;
    } else if (chartId == 'fcpi-chart') {
        current = 'Food Price Index';
        additionalText = 
        `is a measure that tracks the average change in prices of a 
        specified basket of food items over time. It is designed to 
        reflect the fluctuations in the cost of food consumed by 
        households and serves as an important indicator for 
        assessing trends in food inflation.`;
    } else if (chartId == 'ecpi-chart') {
        current = 'Energy Price Index';
        additionalText = 
        `is a metric used to measure the average change in the prices 
        of energy-related goods and services over a specific period. 
        It serves as a key indicator for tracking the fluctuations in 
        energy costs, encompassing various sources such as electricity, 
        natural gas, petroleum products, and other forms of energy.`;
    } else if (chartId == 'ppi-chart') {
        current = 'Producer Price Index';
        additionalText = 
        `is a statistical measure that evaluates the average change in 
        the selling prices received by domestic producers for their 
        output over time. It serves as a crucial economic indicator 
        for assessing inflationary pressures at the producer level 
        before those changes are reflected in consumer prices.`;
    }

    // Extract years and inflation values from data
    var years = Object.keys(data);
    var inflationValues = Object.values(data);

    // Filter out "null" values
    var validData = years.reduce(function (acc, year, index) {
        if (inflationValues[index] !== "null") {
            acc.years.push(year);
            acc.inflationValues.push(parseFloat(inflationValues[index])); // Assuming you want numeric values
        }
        return acc;
    }, { years: [], inflationValues: [] });

    // Create an SVG element and apply it directly to the body
    var svg = d3.select("#inflation").append("svg")
        .attr("width", 1010) // Increase the width to 500 to accommodate the shift
        .attr("height", 300)
        .attr("class", "line-chart")
        .append("g") // Append a group element to apply the transform
        .attr("transform", "translate(50,0)"); // Shift the graph to the right by 50 pixels

    // Set up scales
    var xScale = d3.scaleBand()
        .domain(validData.years)
        .range([0, 500])
        .padding(0.2);

    var yScale = d3.scaleLinear()
        .domain([d3.min(validData.inflationValues), d3.max(validData.inflationValues)])
        .range([200, 0]);

    // Draw X-axis with ticks and rotate the ticks
    svg.append("g") // Append a group element for the X-axis
        .attr("transform", "translate(0,200)") // Translate the X-axis to the bottom
        .call(d3.axisBottom(xScale).ticks(validData.years.length)) // Call the axisBottom function with ticks
        .selectAll("text") // Select all text elements within the ticks
        .style("text-anchor", "end") // Set the text-anchor property to "end"
        .attr("dx", "-.8em") // Adjust the x-offset of the text
        .attr("dy", ".15em") // Adjust the y-offset of the text
        .attr("transform", "rotate(-45)"); // Rotate the text by -45 degrees

    // Draw Y-axis with ticks
    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(5)); // Adjust the number of ticks as needed

    // Draw the line
    svg.append("path")
        .datum(validData.inflationValues)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function (d, i) { return xScale(validData.years[i]) + xScale.bandwidth() / 2; })
            .y(function (d) { return yScale(d); })
        );

    // Check if the minimum inflation value is less than 0
    if (d3.min(validData.inflationValues) < -1) {
        // Add a red dashed line at y = 0
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", yScale(0))
            .attr("x2", 500)
            .attr("y2", yScale(0))
            .attr("stroke", "red")
            .attr("stroke-dasharray", "5,5"); // Dashed line
    }

    // Add x-axis label
    svg.append("text")
        .attr("transform", "translate(250,250)")  // Move the label below the chart
        .style("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Year");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 30)
        .attr("x", 0 - 110)
        .style("text-anchor", "middle")
        .style("font-size", "15px")
        .text(`${current} (%)`);

    // Add the text box for the current variable
    svg.append("text")
        .attr("x", 510) // Adjust the x-coordinate as needed
        .attr("y", 18)  // Adjust the y-coordinate as needed
        .html(`<tspan style="font-weight: bold;">${current}</tspan>`);

    var textLines = additionalText.split('\n');
    svg.selectAll("tspan.additionalText")
        .data(textLines)
        .enter().append("text")
        .attr("x", 510) // Adjust the x-coordinate as needed
        .attr("y", function(d, i) { return 18 + i * 18; })  // Adjust the y-coordinate and spacing
        .attr("dy", "1em") // Set additional spacing between lines if needed
        .text(function(d) { return d; });
}

// Function to draw the legend
function drawLegend(selectedYear, inflationData) {
    var legendHeight = 200;
    var legendWidth = 50; // Adjusted width for the legend rectangles
    var legendX = mapWidth + 250;
    var legendY = height - legendHeight - 125;

    // Extract inflation values for the selected year
    var inflationValues = Object.values(inflationData).map(function (data) {
        return parseFloat(data[selectedYear]);
    });

    // Filter out "null" values
    var validInflationValues = inflationValues.filter(function (value) {
        return value !== "null";
    });

    // Calculate the minimum and maximum values for the legend scale
    var minValue = d3.min(validInflationValues);
    var maxValue = d3.max(validInflationValues);

    // Set the number of rectangles in the legend
    var numRectangles = 7; // Change this number based on your preference

    // Create legend scale
    var legendDomain = d3.range(minValue, maxValue + 0.001, (maxValue - minValue) / (numRectangles - 1));
    var legendScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([legendHeight, 0]);

    // Define color scale for the legend using interpolateReds and interpolateBlues
    var legendColorScale = d3.scaleSequential()
        .domain([-1, 1])
        .interpolator(function (t) {
            return t >= 0 ? d3.interpolateReds(t / 10) : d3.interpolateBlues(-t);
        });

    // Remove existing legend
    svg.selectAll(".legend").remove();

    // Append new legend group
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + legendX + "," + legendY + ")");

    // Append colored rectangles to the legend
    legend.selectAll("rect")
        .data(legendDomain)
        .enter().append("rect")
        .attr("y", function (d) { return legendScale(d); })
        .attr("width", legendWidth) // Set width to legendWidth
        .attr("height", legendHeight / (numRectangles - 1)) // Fixed height for each rectangle
        .style("fill", function (d) {
            return legendColorScale(d);
        });

    // Append text next to each rectangle in the legend
    legend.selectAll("text")
        .data(legendDomain)
        .enter().append("text")
        .attr("x", legendWidth + 5) // Adjusted x-coordinate for text placement
        .attr("y", function (d) { return legendScale(d) + (legendHeight + 50) / (numRectangles - 1) / 2; }) // Center text vertically
        .text(function (d) { return parseFloat(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'; });
}

// Function to show the tooltip
function showTooltip(event, d, inflationData, selectedYear) {
    var countryCode = d.properties.iso_a3;
    var countryName = d.properties.admin;
    var inflationValue = inflationData[countryCode] ? inflationData[countryCode][selectedYear] : "null";

    tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);

    tooltip.html(function () {
        // Check if the value is "null" or numerical
        if (inflationValue === "null") {
            return "<strong>" + countryName + "</strong><br>No data available";
        } else {
            inflationValue = parseFloat(inflationValue).toFixed(2);
            return "<strong>" + countryName + "</strong><br>HCPI Inflation: " + inflationValue + "%";
        }
    })
    .style("left", (event.pageX - 150) + "px")
    .style("top", (event.pageY - 25) + "px")
}

// Function to hide the tooltip
function hideTooltip() {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

// Default: Draw the map for the year 1995
drawMap(1995);

// Create a dropdown menu above the map
var years = d3.range(1995, 2021); // Array of years from 1995 to 2020
var dropdown = d3.select("#inflation")
    .append("div")
    .attr("class", "dropdown")
    .style("text-align", "center");

// Append a select element for the dropdown
var select = dropdown.append("select")
    .on("change", function () {
        var selectedYear = this.value;
        // Call the drawMap function with the selected year
        drawMap(selectedYear);
    });

// Populate the options in the dropdown
select.selectAll("option")
    .data(years)
    .enter().append("option")
    .text(function (d) { return d; });

// Append a button for clearing charts
dropdown.append("button")
    .text("Clear line charts")
    .on("click", function () {
        d3.selectAll('.line-chart').remove();
    });
