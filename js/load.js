d3.queue()
  .defer(d3.json, "data/world-50m.json")
  .defer(d3.json, "data/iso-3166-codes.json")
  .defer(d3.csv, "data/co-emissions.csv", parseEmissions)
  .defer(d3.csv, "data/co-emissions-per-capita.csv", parseEmissions)
  .defer(d3.csv, "data/sales.csv", parseData)
  .defer(d3.csv, "data/population.csv", parseData)
  .defer(d3.csv, "data/gdp.csv", parseData)
  .await(loadData);

// convert all Emissions to be numbers for both emissions datasets
function parseEmissions(row) {
  row["Emissions"] = Number(row["Emissions"]);
  return row;
}

function parseData(row) {
  row["Data"] = Math.trunc(Number(row["Data"]));
  return row;
}

// callback func for the data and calls to init the first page
function loadData(error, map, codes, carbon, carbonPerCapita, sales, population, gdp) {
  mapData = map;
  countryCodes = codes.map(d => {
    d["country-code"] = Number(d["country-code"])
    return d;
  });
  carbonData = carbon;
  carbonPerCapitaData = carbonPerCapita;
  salesData = sales;
  populationData = population;
  gdpData = gdp;
  countries = topojson.feature(mapData, mapData.objects.countries);
  page1();
}