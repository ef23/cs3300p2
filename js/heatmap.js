// renders the heatmap + donut graph
function page1(){
  heatmapHeight = .5 * windowHeight;
  generateSlider(".page1", minYear, maxYear, heatmapOnChange)
  initMap();
}

slidertitle.append("div").append("button").attr("id", "slider-title").text("Emissions");
slidertitle.append("div").attr("id", "slider-text").text("Amount of CO2 released by a country compared with current global leader.");

// ***************** BEGIN HEATMAP ***************** //
// for the heatmap, grabs the emission value
function getEmission(countryCode, yearData) {
  for (var i in dataArr) {
    var country = dataArr[i];
    if (countryCode === country["id"]){
      return (country["Emissions"])
    }
  }
  return 0;
}

// sets the domain of the colorscale to be the year and the dataArr to reflect the data of the current year
function setDomain(year) {
  dataArr = [];
  var data = perCapita ? carbonPerCapitaData : carbonData;

  // grab only countries and also filter out everything with > 0 emissions
  yearData = data.filter(d => d.Year === String(year) && d.Country !== "World" && d.Country !== "European Union (28)")
  validData = yearData.filter(d => (d.Emissions) > 0)

  colorScale.domain(d3.extent(validData, d => (d.Emissions)));
  flagScale.domain(d3.extent(validData, d => (d.Emissions)));

  // generates the data array for this year
  for (var i in validData) {
    var country = validData[i];
    var id;
    var code;
    var region;
    var name = perCapita ? country["Code"] : country["Country"];
    for (var i in countryCodes) {
      var codes = countryCodes[i];
      if (perCapita) {
        if (name === codes["alpha-3"]) {
          code = codes["alpha-2"]
          id = codes["country-code"]
          region = codes["region"]
          break;
        }
      } else {
        if (name === codes["name"]) {
          code = codes["alpha-2"]
          id = codes["country-code"]
          region = codes["region"]
          break;
        }
      }
    }
    // basically normalizes the data across the datasets
    // Country => the name of the country as a String
    // Emissions => the total Emissions as a Number
    // id => the country's ISO-3166 code (for the heatmap)
    // code => the country's ISO-3166 2-letter code (for the flag)
    // region => the country's ISO-3166 region (for the donut graph)
    dataArr.push({
      Country: country.Country,
      Emissions: country.Emissions,
      id: id,
      code: code,
      region: region
    })
  }
}

// scales the tip text to fit within the box
function scaleTipText(){
  var length = tip.node().getComputedTextLength();
    // rescale text accordingly
  if (length > donutWidth){
    tip.style("font-size",  Math.round(length/30))
  } else {
    tip.style("font-size", 11)
  }
}

var currentId = -1;
var clicked = false;
// sets the tip for the country to be displayed, with the flag and emissions
function setTip(updateClicked) {
  for (var i in dataArr) {
    var country = dataArr[i];
    if (currentId === country["id"]){
      if (!clicked || updateClicked) {
        tip.text(country.Country)
        countrybackground.attr("fill", "#000")
        scaleTipText();
        emissions.text(country.Emissions + " Mt CO2" + (perCapita ? " per capita" : ""))

        //resize the flag
        flag.attr("href", "data/flags/" + country.code + ".png")
          .attr("height", flagScale(country.Emissions) * donutWidth*.25)
          .attr("width", flagScale(country.Emissions) * donutWidth*.25)
        var flagWidth = flag.node().getBBox().width/2;
        var flagHeight = flag.node().getBBox().height/2;
        flag.attr("x", donutWidth/3.5 - flagWidth)
            .attr("y", donutHeight*.3 - flagHeight)

        var flagLegendxPos = hmapRange(country.Emissions)
        // ternary statement for x will ensure the flag stays within bounds of the scale
        flagLegend.attr("href", "data/flags/" + country.code + ".png")
          .transition().attr("x", flagLegendxPos - (flagLegendxPos > flagLegendSize ? flagLegendSize : 0))
        flagLegendStroke
          .transition()
          .attr("cx", flagLegendxPos + flagLegendSize/2 - (flagLegendxPos > flagLegendSize ? flagLegendSize : 0))
          .attr("cy", scalePadding - h/2 + flagLegendSize/2)
      }
      return true;
    }
  }
  // if there was no data for this country, disable hover and remove tip
  tip.text(null)
  countrybackground.attr("fill", "#d6dee0")
  emissions.text(null)
  flag.attr("href", null)
  flagLegend.attr("href", null)
  flagLegendStroke.attr("r", null)
  return false;
}

// gets the leader of emissions for the current year
var leader;
function setLeader() {
  leader = dataArr.reduce((acc, l) => acc.Emissions > l.Emissions ? acc : l)
  leaderTip.text(leader.Country)
  leaderEmissions.text(leader.Emissions + " Mt CO2" + (perCapita ? " per capita" : ""))
  leaderFlag.attr("href", "data/flags/" + leader.code + ".png")
    .attr("height", donutWidth*.25)
    .attr("width", donutWidth*.25)
  var leaderWidth = leaderFlag.node().getBBox().width/2;
  var leaderHeight = leaderFlag.node().getBBox().height/2;
  leaderFlag.attr("x", donutWidth2*.42)
  // .attr("y", donutHeight*.22 - leaderHeight)
}

// resets a path's style to be unselected
function resetCountryStyle(country){
  d3.select(country)
    .style("opacity", 0.8)
    .style("stroke","#ccc")
    .style("stroke-width",0.3);
}

// current country that is selected (clicked on)
var currentSelection;

// initializes the map
function initMap() {
  scaleTipText();
  svg.style("opacity", 0);

  svg.append("text")
  .attr("x", 0)
  .attr("y", 270)
  .style("font-family", "Cubano-Reg, sans-serif")
  .text("Year");


  svg.append("rect")
    .attr("x", 0)
    .attr("y", 280)
    .attr("width", 65)
    .attr("height", 35)
    .attr("fill", "#000");

    var title = svg.append("text")
       .attr("id", "title")
       .attr("x", 10)
       .attr("y", 302)
       .style("font-size", 14)
       .style("font-family", "Helvetica Neue, sans-serif")
       .style("fill", "#fff")
       .style("letter-spacing", 2)
       .text("year");


  setDomain(1969);
  setLeader(1969);

  projection.fitExtent([[0,.01*heatmapHeight], [svg.attr("width"), svg.attr("height")]], countries);

  pathGenerator = d3.geoPath().projection(projection);

  var paths = svg.selectAll("path.country").data(countries.features);
  paths = paths.enter().append("path")
    .attr("class", "country")
    .attr("id", d=>"country" +d.id)
    .attr("opacity", 0.8)
    .attr("fill", "#ccc")
    .style("stroke","#ccc")
    .style("stroke-width",0.3)
    .on('mouseover', function(d) {
      if (!clicked) currentId = d.id;
      if (setTip()) {
        d3.select(this)
          .style("opacity", 1)
          .style("stroke","#bbb")
          .style("stroke-width",0.6);
      }
    })
    .on('mouseout', function(d) {
      if (!clicked){
        resetCountryStyle(this)
      }
    })
    .on('click', function(d) {
      // selecting/deselecting same country
      if (currentId == d.id) {
        // if it is clicked, deselect, otherwise select it
        if (clicked) {
          resetCountryStyle(this);
        } else {
          currentSelection = this;
          d3.select(this)
            .style("opacity", 1)
            .style("stroke","#777")
            .style("stroke-width",0.5);
        }
        clicked = !clicked;
      } else {
        // selecting other country when other country may be selected
        if (clicked) resetCountryStyle(currentSelection); // reset old country if any

        currentSelection = this;
        currentId = d.id;

        // need clicked to be false to update tip, then clicked is true
        clicked = false;
        setTip();
        clicked = true;
        d3.select(this)
            .style("opacity", 1)
            .style("stroke","#777")
            .style("stroke-width",0.5);
      }
      hoverTitle.text(clicked ? "Currently Selected " : "Hover over a country ")
    })
    .merge(paths);
  paths.transition().duration(2000)
    .attr("fill", d => {
      var carbon = getEmission(d.id, validData);
      return carbon === 0 ? "#ccc" : colorScale(carbon)
    })
  paths.attr("d", function(country){
    return pathGenerator(country);
  })
  svg.transition().duration(750).style("opacity", 1);
  initDonut();
  initHeatmapLegend();

  title.html(heatmapTitle + "<tspan >1969</tspan>")
}

// updates the map with the given year
function updateMap(year, isChange) {
  setDomain(year);
  setLeader(year);

  d3.select("#title").html(heatmapTitle + "<tspan >" + year + "</tspan>")

  if (currentId != -1) {
    clicked ? setTip(true) : setTip(false)
  }

  var paths = svg.selectAll("path.country").data(countries.features);
  var addedpaths = paths.enter().append("path")
  var mergedpaths = addedpaths.merge(paths);

  mergedpaths.transition().duration(isChange ? 500 : 0)
    .attr("fill", d => {
      var carbon = getEmission(d.id, validData);
      return carbon === 0 ? "#ccc" : colorScale(carbon)
    })
  drawDonut();
  updateHeatmapLegend();
}
// end heatmap

// ***************** begin heatmap legend ***************** //
// recalculates the scale between per capita and regular by setting the length of the scale for emissions
function setHmapLegendScale() {
  maxEmissions = 0;
  minmaxEmissions = Number.POSITIVE_INFINITY;
  var data = perCapita ? carbonPerCapitaData : carbonData;
  for (var i = 1850; i <= 2014; i++) {
    var maxData = data.filter(d => d.Year === String(i) && d.Country !== "World" && d.Country !== "European Union (28)")
    var maxYearEmissions = maxData.reduce((acc, l) => acc.Emissions > l.Emissions ? acc : l).Emissions
    maxEmissions = maxYearEmissions > maxEmissions ? maxYearEmissions : maxEmissions;
    minmaxEmissions = maxYearEmissions < minmaxEmissions ? maxYearEmissions : minmaxEmissions;
  }

  yearTitleScale.domain([minmaxEmissions, maxEmissions])
  heatmapLegendWidthScale.domain([minmaxEmissions, maxEmissions])
}

var scalePadding = 60;
var h = 20;
var flagLegendSize = h*1.5
// builds the heatmap legend
function initHeatmapLegend() {
  setHmapLegendScale();
  heatmapLegendWidth = heatmapLegendWidthScale(leader.Emissions)

  hmapKey = d3.select(".heatmap")
      .append("svg")
      .attr("width", heatmapWidth)
      .attr("height", h+scalePadding*1.3)
      .attr("y", heatmapHeight-h-scalePadding*1.3)

  heatmapLegend = hmapKey.append("defs")
      .append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "100%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

  heatmapLegend.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#feeeee")
      .attr("stop-opacity", 1);

  heatmapLegend.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ce5755")
      .attr("stop-opacity", 1);

  heatmapLegendKey = hmapKey.append("rect")
      .attr("class", "heatmap-legend")
      .attr("width", 0)
      .attr("height", h/2)
      .attr("y", scalePadding)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "url(#gradient)")

  heatmapLegendKey.transition().duration(2000)
      .attr("width", heatmapLegendWidth)

  // set equal to 0 to get transition
  hmapRange = d3.scaleLinear().domain(d3.extent(dataArr, d => d.Emissions)).range([0, 0])
  var hmapAxis = d3.axisTop()
    .scale(hmapRange)
    .ticks(10)
    .tickSize(0)
    .tickSizeOuter(0);

  heatmapLegendAxis = hmapKey.append("g")
    .attr("transform", "translate(0,"+ scalePadding/1.2 + ")")
    .call(hmapAxis)

  heatmapLegendAxisTitle = hmapKey
      .append("text")
      .attr("x",hmapRange.range()[1]/2)
      .attr("y", scalePadding *.2)
      .style("text-anchor", "middle")
      .style("font-size", 15)
      .style("font-family", "\"Open Sans\", sans-serif");
      //.text("Emissions (Mt CO2)");

  hmapRange = d3.scaleLinear().domain(d3.extent(dataArr, d => d.Emissions)).range([0, heatmapLegendWidth])
  hmapAxis = d3.axisTop()
    .scale(hmapRange)
    .ticks(10)
    .tickSize(0)
    .tickSizeOuter(0);

  d3.select(".domain").attr("stroke", "none")

  heatmapLegendAxis
    .transition().duration(2000)
    .call(hmapAxis)

  heatmapLegendAxisTitle
    .transition().duration(2000)
    .attr("x",hmapRange.range()[1]/2)
    .attr("y", scalePadding *.25)

  flagLegend = hmapKey
    .append("image")
    .attr("y", scalePadding - h/2)
    .attr("height", flagLegendSize)
    .attr("width", flagLegendSize)

  flagLegendStroke = hmapKey
    .append("circle")
    .attr("r", flagLegendSize/2)
    .attr("stroke", "#fff")
    .attr("fill", "none")
    .attr("stroke-width", 2)
}

function updateHeatmapLegend(toggle) {
  if (toggle) {
    setHmapLegendScale()
  }
  heatmapLegendWidth = heatmapLegendWidthScale(leader.Emissions)

  heatmapLegendKey
      .transition()
      .attr("width", heatmapLegendWidth)
      .style("fill", "url(#gradient)")

  var extent = d3.extent(dataArr, d => d.Emissions)
  hmapRange = d3.scaleLinear().domain(extent).range([0, heatmapLegendWidth])
  var hmapAxis = d3.axisTop().scale(hmapRange)

  heatmapLegendAxis.transition().call(hmapAxis)

  heatmapLegendAxisTitle
    .transition()
    .attr("x",hmapRange.range()[1]/2)
    .attr("y", scalePadding *.25)
}
// *****************  end heatmap legend ***************** //
