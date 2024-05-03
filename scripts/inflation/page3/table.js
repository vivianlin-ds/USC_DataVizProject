// main.js

// Load CSV data and create the main table
d3.csv("scripts/inflation/page3/main.csv").then(function(data) {
  // Create a main table element
  const mainTable = d3.select("#table-container").append("table");

  // Append header row to the main table
  mainTable.append("thead")
    .append("tr")
    .selectAll("th")
    .data(data.columns)
    .enter()
    .append("th")
    .text(d => d);

  // Append data rows to the main table
  const mainRows = mainTable.append("tbody")
    .selectAll("tr")
    .data(data)
    .enter()
    .append("tr")
    .attr("class", d => (parseInt(d.Year, 10) > 2022) ? "after-2022" : "")
    .on("mouseover", function() {
      d3.select(this).style("background-color", "#ffcc00"); // Change background color on hover
    })
    .on("mouseout", function() {
      d3.select(this).style("background-color", ""); // Revert to original color on mouseout
    });

  // Append cells in each row of the main table
  mainRows.selectAll("td")
    .data(d => Object.values(d))
    .enter()
    .append("td")
    .text(d => d)
    .attr("class", (d, i) => (i === 0 && parseInt(d, 10) > 2022) ? "after-2022" : "");


});
