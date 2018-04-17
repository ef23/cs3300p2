// *********** LEADER TIP ***************** //
// displays the country's name when hovered
d3.select(".donut").append("text")
  .attr("x", donutWidth2*.42)
  .attr("y", donutHeight*.07)
  //.attr("text-anchor", "middle")
  .style("font-family", "Cubano-Reg, sans-serif")
  .style("font-weight", "bold")
  .style("font-size", 17)
  .style("letter-spacing", 1.5)
  .text("Current Leader")

var countrybackground = d3.select(".donut").append("rect")
  .attr("x", donutWidth2*.42)
  .attr("y", donutHeight*.55)
  .attr("width", donutWidth2/6)
  .attr("height", 35)
  .attr("fill", "#000")

var leaderTip = d3.select(".donut").append("text")
  .attr("class", "leader-tip")
  .attr("x", donutWidth2/2)
  .attr("y", donutHeight*.64)
  .attr("text-anchor", "middle")
  .style("font-family", "Helvetica Neue, sans-serif")
  .style("font-size", "11")
  .style("fill", "#fff")
  .style("letter-spacing", 2)
  .style("text-transform", "uppercase")

// displays the emission
var leaderEmissions = d3.select(".donut").append("text")
  .attr("class", "leader-emissions-tip")
  .attr("x", donutWidth2*.55)
  .attr("y", donutHeight*.3)
  .attr("text-anchor", "middle")
  .style("font-family", "Roboto Mono, sans-serif")
  .style("font-weight", "bold")
  .style("font-size", 15)

// displays the appropriate flag
var leaderFlag = d3.select(".donut").append("image")
  .attr("class", "leader-flag")
  .attr("y", donutHeight*.15)
// *********** END LEADER TIP ************* //

// *********** HOVER TIP ***************** //
var hoverTitle = d3.select(".donut").append("text")
  .attr("x", donutWidth/6)
  .attr("y", donutHeight*.07)
  .style("font-family", "Cubano-Reg, sans-serif")
  .style("font-weight", "bold")
  .style("font-size", 17)
  .style("letter-spacing", 1.5)
  .text("Hover over a country")

// displays the country's name when hovered
var countrybackground = d3.select(".donut").append("rect")
  .attr("x", donutWidth/6)
  .attr("y", donutHeight*.55)
  .attr("width", donutWidth2/6)
  .attr("height", 35)
  .attr("fill", "#d6dee0")

var tip = d3.select(".donut").append("text")
  .attr("class", "country-tip")
  .attr("id", "country-tip")
  .attr("x", donutWidth/2)
  .attr("y", donutHeight*.64)
  .attr("text-anchor", "middle")
  .style("font-family", "Helvetica Neue, sans-serif")
  .style("font-size", "11")
  .style("fill", "#fff")
  .style("letter-spacing", 2)
  .style("text-transform", "uppercase")

// displays the emission
var emissions = d3.select(".donut").append("text")
  .attr("class", "country-emissions-tip")
  .attr("x", donutWidth*.68)
  .attr("y", donutHeight*.3)
  .attr("text-anchor", "middle")
  .style("font-family", "Roboto Mono, sans-serif")
  .style("font-weight", "bold")
  .style("font-size", 15)

// displays the appropriate flag
var flag = d3.select(".donut").append("image")
  .attr("class", "flag")

d3.select(".donut").append("text")
  .attr("x", donutWidth/2)
  .attr("y", donutHeight*.55)
  .attr("text-anchor", "middle")
  .style("font-family", "Open Sans, sans-serif")
  .style("font-size", 12)

d3.select(".donut").append("text")
  .attr("x", donutWidth2*(5/6))
  .attr("y", donutHeight*.07)
  .attr("text-anchor", "middle")
  .style("font-family", "Cubano-Reg, sans-serif")
  .style("font-weight", "bold")
  .style("font-size", 17)
  .style("letter-spacing", 1.5)
  .text("Emissions By Region")

var flagLegend;
var flagLegendStroke;
// *********** END HOVER TIP ************* //