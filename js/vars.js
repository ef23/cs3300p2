var windowHeight = window.screen.availHeight;
var windowWidth = window.screen.availWidth;

var heatmapWidth = .90 * windowWidth;
var heatmapHeight = .5 * windowHeight;

var donutWidth = .225 * windowWidth;
var donutHeight = .3 * windowHeight;

var donutWidth2 = .9 * windowWidth;

var mapData; // the map projection stuff
var carbonData; // raw data for carbon emissions by year
var carbonPerCapitaData; // raw data for carbon emissions per capita
var countryCodes; // raw data for the iso-3166-codes json
var countries; // data of the countries from the map project
var salesData; // data on automobile sales per country
var populationData; // data on population by country
var gdpData; // data on gdp by country

var mapView = true;

var hmapKey;

var projection = d3.geoEquirectangular().scale(75);
var pathGenerator = d3.geoPath().projection(projection);

var minYear = 1850;
var maxYear= 2014;

// the variable to indicate if we are using the total carbon emissions or per capita data
var perCapita = false;

// linear scale based on emissions for the year, from yellow (least) -> red (most)
var colorScale = d3.scaleLinear()
  .interpolate(d3.interpolateHcl)
  .range(["#feeeee","#ce5755"])

// linear scale to color the year based on the maximum emissions that year
var yearTitleScale = d3.scaleLinear()
  .interpolate(d3.interpolateHcl)
  .range(["#feeeee","#ce5755"])

// sqrt scale since the flags are circles, based on emissions for the year
var flagScale = d3.scaleSqrt()
  .range([.2,1])

// data for the current year
var yearData;

// more filtered out data for the current year (excludes non-country data)
var validData;

// USE THIS ARRAY FOR EVERYTHING! this is a "standardized" data array across both datasets
var dataArr;
var heatmapTitle = " ";


var heatmapLegend;
var heatmapLegendKey;
var heatmapLegendAxis;
var heatmapLegendAxisTitle;

var baseWidth = heatmapWidth*.2;
var heatmapLegendWidth;

var maxEmissions = 0;
var minmaxEmissions = Number.POSITIVE_INFINITY;

var heatmapLegendWidthScale = d3.scaleLinear().range([baseWidth, heatmapWidth*.89])
var hmapRange;

// toggle button
function togglePerCapita() {
  perCapita = !perCapita;
  if (!mapView) {
    page2();
  }
  if (perCapita) {
   heatmapTitle = "";
    d3.select("#toggle")
      .classed("enabled-button", false)
      .classed("disabled-button", true);
  } else {
    heatmapTitle = "";
    d3.select("#toggle")
      .classed("enabled-button", true)
      .classed("disabled-button", false);
  }
  updateMap(prevVal, true);
  updateHeatmapLegend(true);
}

d3.select("#toggle")
  .on("click", () => togglePerCapita())
// *****************  end button *****************  //

var svg = d3.select(".page1").append("div").attr("class", "heatmap-div").append("svg").attr("height", heatmapHeight).attr("width", heatmapWidth).attr("class", "heatmap");
d3.select(".page1").append("div").attr("id", "playslider").style("top", "-50px").style("left", "5px").style("position", "relative").style("display", "inline");
d3.select(".page1").append("div").attr("id", "yearslider").style("display", "inline");
var slidertitle = d3.select(".page1").append("div").attr("class", "slidertitle");
var donut = d3.select(".page1").append("div").attr("class", "donut-div").append("svg").attr("height", donutHeight).attr("width", .9*windowWidth).attr("class", "donut");