// Define your margin, width, and height
const margin = { top: 40, right: 20, bottom: 80, left: 80 };
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Select the chart container
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the CSV data
d3.csv("scripts/inflation/page3/mainDF.csv").then(function(data) {
  // Initialize variables for sorting and filtering
  let sortColumn = "Arrival";
  let minPopulation = 0;
  let fil = 'all';
  let div = 10;
  // Create scales
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.Year))
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([d3.min(data, d => parseFloat(d[sortColumn].replace(/,/g, ""))), d3.max(data, d => parseFloat(d[sortColumn].replace(/,/g, "")))]).nice()
    .range([height, 0]);

  // Create axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .style("stroke-width", 2)
    .call(xAxis);
    

  svg.append("g")
    .attr("class", "y-axis")
    .style("stroke-width", 2)
    .call(yAxis);

  svg.append("g")
    .attr("class", "x-label")
    .text('pop');
    
  svg.append("g")
    .attr("class", "y-label")
    .text('pop');
  // Function to update the chart
  function updateChart() {
    // Initialize the x and y-axis labels
    console.log(sortColumn);
    console.log(fil);
    let xLabel = "Year";
    let yLabel = "Arrival";
    let top = 'No';
    let last = 'No';
    let div = 10;
  
    // Determine the axis labels based on the selected column
    switch (sortColumn) {
      case "Inflation":
        xLabel = "Year";
        yLabel = "Inflation (Percentage)";
        break;
      case "Departure":
        xLabel = "Year";
        yLabel = "Departure (Millions)";
        break;
      case "Arrival":
        xLabel = "Year";
        yLabel = "Arrival (Millions)";
        break;
      case "Expenditure":
        xLabel = "Year";
        yLabel = "Expenditure( 10 Million USD)";
        break;
      default:
        xLabel = "Year";
        yLabel = "Inflation (Percentage)";
    }
  
    // Sort the data based on the selected column
    // data.sort((a, b) => parseFloat(b[sortColumn].replace(/,/g, "")) - parseFloat(a[sortColumn].replace(/,/g, "")));
  
    // Filter the data based on the minimum population
    if (fil == 'top') {
      var filteredData = data.slice(0, 5);
    } else if (fil == 'last') {
      var filteredData = data.slice(-5);
    } else if (fil == 'all') {
      var filteredData = data.filter(d => parseFloat(d["Inflation"].replace(/,/g, "")) >= minPopulation);
    }
  
    // Update the xScale domain
    xScale.domain(filteredData.map(d => d.Year));
  
    // Create transitions for axis updates
    const t = svg.transition().duration(1000);
  
    // Update x-axis with transition
    t.select(".x-axis")
      .call(xAxis);
  
    // Update y-axis domain
    if (sortColumn != "Inflation") {
      yScale.domain([0, d3.max(filteredData, d => parseFloat(d[sortColumn].replace(/,/g, "")))]);
    } else {
      yScale.domain([d3.min(filteredData, d => parseFloat(d[sortColumn].replace(/,/g, ""))), d3.max(filteredData, d => parseFloat(d[sortColumn].replace(/,/g, "")))]);
    }
  
    // Update y-axis with transition
    t.select(".y-axis")
      .call(yAxis);
  
    svg.selectAll('#Ax').remove();
  
    svg.append("text")      // text label for the x axis
      .attr('id', 'Ax')
      .attr("x", (width / 2))
      .attr("y", height + 50)
      .style("text-anchor", "middle")
      .style("stroke-width", 2)
      .text(xLabel);
  
    svg.append("text")
      .attr('id', 'Ax')
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("stroke-width", 2)
      .text(yLabel);
  
        // Update bars with smooth transitions
    const bars = svg.selectAll(".bar")
    .data(filteredData, d => d.Year);

    bars.exit().remove();

    bars.enter()
    .append("rect")
    .attr("class", "bar")
    .merge(bars)
    .transition()
    .duration(1000)
    .attr("x", d => xScale(d.Year) + xScale.bandwidth() /3)
    .attr("y", d => yScale(parseFloat(d[sortColumn].replace(/,/g, ""))))
    .attr("width", xScale.bandwidth()/4)
    .attr("height", d => height - yScale(parseFloat(d[sortColumn].replace(/,/g, ""))))
    .attr("fill", d => (parseInt(d.Year, 10) > 2022) ? "#bc5090" : "#003f5c");


    // Update line with smooth transitions
    const line = d3.line()
  .x(d => xScale(d.Year) + xScale.bandwidth() / 2)
  .y(d => yScale(parseFloat(d[sortColumn].replace(/,/g, ""))));

    svg.selectAll(".line")
    .data([filteredData])
    .enter()
    .append("path")
    .attr("class", "line")
    .merge(svg.selectAll(".line"))
    .transition()
    .duration(1000)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", d => (parseInt(d[0].Year, 10) > 2022) ? "#ffa600" : "green")
    .style("stroke-width", 2);

  

    // Add text labels on top of the line
    svg.selectAll(".label").remove();
    svg.selectAll(".label")
      .data(filteredData, d => d.Year)
      .enter()
      .append("text")
      .transition()
      .ease(d3.easePoly)
      .delay(500)
      .duration(1000)
      .attr("class", "label")
      .attr("x", d => xScale(d.Year) + xScale.bandwidth() / div)
      .attr("y", d => yScale(parseFloat((d[sortColumn]).replace(/,/g, ""))))
      .text(d => (d[sortColumn]));
  }


  document.getElementById("sortInflation").addEventListener("click", function() {
    sortColumn = "Inflation";
    updateChart();
  });
  
  document.getElementById("Departure").addEventListener("click", function() {
    sortColumn = "Departure";
    updateChart();
  });
  
  document.getElementById("Arrival").addEventListener("click", function() {
    sortColumn = "Arrival";
    updateChart();
  });
  
  document.getElementById("Expenditure").addEventListener("click", function() {
    sortColumn = "Expenditure";
    updateChart();
  });
  
 
 
d3.select("#all").on("click", () => {
  //sortColumn = "balanceOfPayments"; // Change to your desired column
  fil = 'all';
  updateChart();
});

d3.select("#reset").on("click", () => {
  //sortColumn = "balanceOfPayments"; // Change to your desired column
  fil = 'all';
  sortColumn = "Population (Millions)";
  updateChart();
});
  // Initial chart update
  updateChart();
});
const legend = svg.append("g")
  .attr("transform", `translate(${width - 100},${margin.top-80})`);

legend.append("rect")
  .attr("width", 20)
  .attr("height", 20)
  .attr("fill", "#003f5c");


legend.append("text")
  .attr("x", 30)
  .attr("y", 10)
  .text("Actual Data")
  .attr("alignment-baseline", "middle");

legend.append("rect")
  .attr("y", 30)
  .attr("width", 20)
  .attr("height", 20)
  .attr("fill", "#bc5090");

legend.append("text")
  .attr("x", 30)
  .attr("y", 40)
  .text("Prediction")
  .attr("alignment-baseline", "middle");
