/* Displays heat map, disables heat map button, and re-enables line graph
 * button */
function viewHeatMap() {
  mapView = true;
  isPlaying = false;
  d3.select("#heat-map-button")
    .classed("enabled-button", false)
    .classed("disabled-button", true)
    .attr("disabled", "true");
  d3.select("#line-graph-button")
    .classed("enabled-button", true)
    .classed("disabled-button", false)
    .attr("disabled", null);;
  d3.select(".page1").style("display", "block");
  d3.select(".page2").style("display", "none");
  d3.select("#dropdown_container").style("visibility", "hidden");
}

/* Displays line graph, disables line graph button, and re-enables heat map
 * button*/
function viewLineGraph() {
  mapView = false;
  isPlaying = false;
  d3.select("#heat-map-button")
    .classed("enabled-button", true)
    .classed("disabled-button", false)
    .attr("disabled", null);
  d3.select("#line-graph-button")
    .classed("enabled-button", false)
    .classed("disabled-button", true)
    .attr("disabled", "true");
  d3.select(".page1").style("display", "none");
  d3.select(".page2").style("display", "block");
  d3.select("#dropdown_container").style("visibility", "visible");
  page2();
}

d3.select("#heat-map-button")
  .on("click", () => viewHeatMap());
d3.select("#line-graph-button")
  .on("click", () => viewLineGraph());

var lineGraphTitles = {
  "sales" : "Automobile Sales",
  "population" : "Population",
  "gdp" : "Gross Domestic Product"
};

var sliderBounds = {
  "sales" : [2005, 2014],
  "population" : [1960, 2014],
  "gdp" : [1960, 2014]
};

var axisLabels = {
  "sales" : "Number of Automobiles Sold",
  "population" : "Population",
  "gdp" : "GDP (USD)"
}

var margin = {top: 50, left: 100, bottom: 80, right: 40};

/* Sets the title of the line graph according to the selected data set and
 * year */
function updateLineGraphTitle(data_option, year) {
  var title = lineGraphTitles[data_option] + " in " + year;
  d3.select("#lineGraphTitle").text(title);
}

var xScale;
var yScale;
var lineGraphMap;
var lineGraphData;
var lineGraphYearData;

/* Filters the selected data set and emissions data set */
function filterData(data_option) {
  var data;
  if (data_option === "sales") {
    data = salesData;
  } else if (data_option === "population") {
    data = populationData;
  } else if (data_option === "gdp") {
    data = gdpData;
  }
  var map = {};
  for (var i = 0; i < data.length; i++) {
    if (map[data[i]["Country"]] == undefined) {
      map[data[i]["Country"]] = {};
    }
    map[data[i]["Country"]][data[i]["Year"]] = data[i];
  }
  var emissionsData = perCapita ? carbonPerCapitaData : carbonData;
  for (var i = 0; i < emissionsData.length; i++) {
    if (map[emissionsData[i]["Country"]] != undefined &&
      map[emissionsData[i]["Country"]][emissionsData[i]["Year"]] != undefined) {
      map[emissionsData[i]["Country"]][emissionsData[i]["Year"]]["Emissions"] =
        emissionsData[i]["Emissions"];
    }
  }
  for (var i = 0; i < countryCodes.length; i++) {
    if (map[countryCodes[i]["name"]] != undefined) {
      map[countryCodes[i]["name"]]["Code"] = countryCodes[i]["alpha-2"];
    }
  }
  lineGraphMap = map;
  var arr = [];
  for (var country in map) {
    if (map[country]["Code"] == undefined) {
      continue;
    }
    for (var year in map[country]) {
      if (year === "Code" || map[country][year]["Emissions"] == undefined) {
        continue;
      }
      map[country][year]["Code"] = map[country]["Code"];
      arr.push(map[country][year]);
    }
  }
  return arr;
}

function updateYearData(year) {
  for (var row in lineGraphYearData) {
    var country = lineGraphYearData[row]["Country"];
    lineGraphYearData[row]["Year"] = String(year);
    lineGraphYearData[row]["Data"] = lineGraphMap[country][year]["Data"];
    lineGraphYearData[row]["Emissions"] = lineGraphMap[country][year]["Emissions"];
  }
}

var lineTip = d3.tip()
  .attr("class", "line_graph_tip")
  .offset([-10, 0])
  .html(function (d) {
    return "<strong>" + d["Country"] + "</strong><br>" +
      "<span>Emissions (Mt CO2): " + d["Emissions"] + "</span><br>" +
      "<span>" + axisLabels[d3.select("#dropdown").node().value] + ": " + d["Data"] + "</span>";
  });

function plotYearData(data, year) {
  lineGraphYearData = data.filter(d => d["Year"] === String(year));
  datapoints = d3.select("#page2_svg").select("#page2_plot").selectAll("image")
    .data(lineGraphYearData);
  datapoints.transition()
    .duration(1000)
      .attr("x", (d) => xScale(d["Data"]) - 15)
      .attr("y", (d) => yScale(d["Emissions"]) - 15);
  datapoints.enter()
    .append("image")
      .attr("class", "point")
      .attr("x", (d) => xScale(d["Data"]) - 15)
      .attr("y", (d) => yScale(d["Emissions"]) - 15)
      .attr("width", 30)
      .attr("height", 30)
      .attr("xlink:href", (d) => "data/flags/" + d["Code"] + ".png")
      .on("mouseover", lineTip.show)
      .on("mouseout", lineTip.hide)
  .exit()
    .remove();
}

/* Displays the line graph */
function drawLineGraph(data_option, year) {
  d3.select("#page2_svg").select("#page2_plot").append("text")
    .attr("x", (heatmapWidth - margin.left) / 2)
    .attr("y", heatmapHeight - (1.1 * margin.bottom))
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .style("font-family", "Cubano-Reg, sans-serif")
    .style("font-size", 15)
    .style("letter-spacing", 2)
    .text(axisLabels[data_option]);
d3.select("#page2_svg").select("#page2_plot").append("text")
  .attr("x", 0 - (heatmapHeight/3))
  .attr("y", 0 - (margin.left/2))
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .style("font-family", "Cubano-Reg, sans-serif")
  .style("font-size", 15)
  .style("letter-spacing", 2)
  .text("Emissions (MT CO2)");
  d3.select("#page2_svg").select("#page2_plot").append("text")
    .attr("x", margin.left / 2)
    .attr("y", heatmapHeight / 2)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .attr("transform", "rotate(-90) " +
      "translate(-" + (heatmapHeight / 2.5) + ", -" + (heatmapWidth / 3.3) + ")")
    .style("font-family", "Open Sans, sans-serif")
    .style("font-size", 20)
    .text("Emissions (Mt CO2)");
  lineGraphData = filterData(data_option);
  xScale = d3.scaleLog()
    .domain([d3.min(lineGraphData, (d) => d["Data"]),
      d3.max(lineGraphData, (d) => d["Data"])])
    .range([0, heatmapWidth - margin.left - margin.right]);
  yScale = d3.scaleLog()
    .domain([d3.min(lineGraphData, (d) => d["Emissions"]),
      d3.max(lineGraphData, (d) => d["Emissions"])])
    .range([heatmapHeight - margin.top - margin.bottom, 0]);
  var xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(".2s"));
  d3.select("#page2_svg").append("g")
    .attr("class", "axis")
    .attr("transform",
      "translate(" + margin.left + "," + (heatmapHeight - margin.bottom) + ")")
    .call(xAxis);
  var yAxis = d3.axisLeft(yScale).ticks(4).tickFormat(d3.format(".2s"));
  d3.select("#page2_svg").append("g")
    .attr("class", "axis")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")
    .call(yAxis);
  d3.select("#page2_svg").call(lineTip);
  plotYearData(lineGraphData, year);
}

d3.select("#dropdown")
  .on("change", () => page2());

/* Displays page 2 visualization */
function page2() {
  d3.select(".page2").selectAll("*")
    .remove();
  heatmapHeight = .7*windowHeight
  var page2 = d3.select(".page2");
  var page2_svg = page2.append("svg")
    .attr("id", "page2_svg")
    .attr("height", heatmapHeight*1.05)
    .attr("width", heatmapWidth)
  var page2_plot = page2_svg.append("g")
    .attr("id", "page2_plot")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var page2_slider = page2.append("div")
    .attr("id", "yearslider")
    .style("display", "inline")
    .style("margin-left", "5.5%");
  lineGraphTitle = page2_svg.append("text")
    .attr("id", "lineGraphTitle")
    .attr("x", heatmapWidth / 2 + 50)
    .attr("y", 0.075 * heatmapHeight)
    .style("font-family", "Cubano-Reg, sans-serif")
    .style("font-size", 15)
    .style("letter-spacing", 2)
    .style("font-weight", "bold")
    .style("text-anchor", "middle");
  var data_option = d3.select("#dropdown").node().value;
  updateLineGraphTitle(data_option, sliderBounds[data_option][0])
  drawLineGraph(data_option, sliderBounds[data_option][0]);
  generateSlider(".page2", sliderBounds[data_option][0],
    sliderBounds[data_option][1], function (val) {
      updateLineGraphTitle(d3.select("#dropdown").node().value,
        val.getFullYear());
      plotYearData(lineGraphData, val.getFullYear());
    });
}