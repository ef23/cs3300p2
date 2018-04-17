// *****************  begin donut graph of continents ***************** //
var regions = ["Africa", "Americas", "Asia", "Europe", "Oceania"]
var cumulativeData;
var radius = (donutWidth*0.55)/2;
var width = donutWidth/10;
var donutColor = d3.scaleOrdinal().range(["#ce5755", "#ce8482", "#e2bab9", "#e9c3c2", "#feeeee"].reverse())

var arc = d3.arc()
  .innerRadius(radius - width)
  .outerRadius(radius);

var pie = d3.pie()
  .value(function(d) { return d; })
  .sort(null);

var tooltip = d3.select("body").append("div").attr("class", "tooltip");

function accumulate() {
  cumulativeData = [];
  for (var i in regions) {
    var region = regions[i];
    cumulativeData.push(
      dataArr.filter(d => d.region === region)
            .reduce((acc, d) => acc + d.Emissions, 0)
    )

  }
  cumulativeData = cumulativeData.map(d => Number.parseFloat(d).toFixed(3))
}

// initializes the donut chart
function initDonut() {
  accumulate()

  var path = donut.selectAll("path").data(pie(cumulativeData))
  var addedpaths = path.enter().append("path")
  addedpaths.merge(path)
    .attr("transform", "translate(" + (donutWidth2*(5/6)) + "," + (donutHeight*.5) + ")")
    .transition()
      .duration(2000)
      .attrTween("d", initDonutTransition)

  addedpaths.attr("d", arc)
    .attr("stroke", "#d6dee0")
    .attr("stroke-weight", 2)
    .attr("fill", (d, i) => {
      return donutColor(i);
    })
    .on("mousemove", d => {
        var total = d3.sum(cumulativeData);
        var percent = Math.round(1000 * d.data / total) / 10;
        tooltip.style("left", d3.event.pageX+10+"px");
        tooltip.style("top", d3.event.pageY-25+"px");
        tooltip.style("display", "inline-block");
        tooltip.html(regions[d.index]
          +"<br>"+d.data+" Mt CO2"+ (perCapita ? " per capita" : "")
          + "<br>"+percent+"%");
    })
    .on("mouseout", d => {
        tooltip.style("display", "none");
    });

  // build the legend inspired by http://bl.ocks.org/juan-cb/1984c7f2b446fffeedde
  var legendRectSize = radius*0.05;
  var legendSpacing = radius*0.15;
  var legend = donut.selectAll(".donut-legend")
  .data(regions)
  .enter()
  .append("g")
  .attr("class", "donut-legend")
  .attr("transform", (d, i) => {
      var height = donutHeight*.5 - radius/3;
      var offset =  height * 2.5;
      var horz = donutWidth2*(5/6) -radius/4 + legendRectSize;
      var vert = height + i * legendSpacing;
      return "translate(" + horz + "," + vert + ")";
  })
  legend.append("rect")
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .style("fill", (d, i) => donutColor(i))
    .style("stroke", (d, i) => donutColor(i))
  legend.append("text")
    .attr("x", legendRectSize + legendSpacing/2)
    .attr("y", legendRectSize*4 - legendSpacing)
    .style("font-family", "\"Open Sans\", san-serif")
    .style("font-size", donutWidth/30)
    .text(function(d) { return d; });
}

// This function is courtesy of https://bl.ocks.org/mbostock/1346410
// animates the donut chart
function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return t => {
    return arc(i(t));
  };
}

// This function is the function that does the funny twirly thing
function initDonutTransition(b) {
  var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
  return function(t) { return arc(i(t)); };
}

// draws the donut for the current year
function drawDonut() {
  accumulate()

  var path = donut.selectAll("path").data(pie(cumulativeData))
  var addedpaths = path.enter().append("path")
  addedpaths.merge(path)
    .transition().attrTween("d", arcTween)
}
// ***************** end donut graph ***************** //