// ***************** generate the slider ***************** //

var prevVal = 1969
var yearslider1;

// the onChange func for the heatmap slider
function heatmapOnChange(val) {
  val = val.getFullYear()
  if (prevVal !== val){
    var isChange = Math.abs(prevVal - val) > 3
    updateMap(val, isChange)
    prevVal = val;
  }
}

// generates a slider with at most 4 tick marks
// params: min --> min Year, max --> max Year, onChange --> change function taking in a val param (the year)
function generateSlider(page, min, max, onChange) {
  minYear = min
  maxYear = max

  var yearTicks = []
  var inc = (maxYear - minYear)/4
  for (var i = minYear+1; i <= maxYear+1; i+=inc){
    yearTicks.push(new Date(i, 0, 0));
  }

  // generate the slider with the bounds and the change func
  var yearslider = slider()
    .min(d3.min(yearTicks))
    .max(d3.max(yearTicks))
    .default(d3.min(yearTicks) > 1969 ? d3.min(yearTicks) : 1969)
    .step(1000 * 60 * 60 * 24 * 365)
    .width(heatmapWidth*.88)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(yearTicks)
    .on('onchange', val => {
      onChange(val)
    });

  if (page === ".page1") {
    yearslider1 = yearslider;
  }

  // delete old slider and put in new one
  d3.select(page + " #yearslider").selectAll("*").remove();
  var g = d3.select(page + " #yearslider").append("svg")
    .attr("id", "yearslidersvg")
    .attr("width", heatmapWidth)
    .attr("height",40)
    .append("g")
    .attr("transform", "translate(20,5)")

  g.call(yearslider);
}

function stop() {
  clearInterval(interval);
}
// TODO what to do with this
var isPlaying = false;
var interval;
var playslider = d3.selectAll("#playslider")
.append("button")
.html("<i class=\"fa fa-play\"></i>")
.on("click", function(){
  isPlaying = !isPlaying;
  this.innerHTML = isPlaying ? "<i class=\"fa fa-pause\"></i>" : "<i class=\"fa fa-play\"></i>"
  if (isPlaying) {
    interval = setInterval(() => {
      if (prevVal <=maxYear && isPlaying) {
        updateMap(prevVal, true);
        yearslider1.value(new Date(prevVal+1, 0, 0));
        prevVal++;
      } else {
        isPlaying = false;
        this.innerHTML = "<i class=\"fa fa-play\"></i>";
        stop();
      }
    }, 250);
  } else {
    clearInterval(interval);
  }
})

// *****************  end slider ***************** //