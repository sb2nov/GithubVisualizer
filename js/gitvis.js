var chart;
var height = 600
var width = 600
var transitionDuration = 500;
var rootRepo;
var nodeRepo;

//Gets called when the page is loaded.
function init(){
  chart = d3.select('#vis').append('svg')
    .attr('width', width + 100)
    .attr('height', height + 100)
    .style('margin-left', 100)

  vis = chart.append('svg:g')
  defs = chart.append("defs");
  //PUT YOUR INIT CODE BELOW

  colorscale = d3.scale.category20()
  treemapRepo = d3.layout.treemap()
    .size([width, height])

  d3.csv('data/balancedDataFull.csv',update)
}

//Callback for when data is loaded
function update(rawdata){

  data=d3.nest()
    .key(function(d) {return d.repo;})
    // .sortKeys(d3.ascending)
    .rollup(function(d) { return d3.sum(d, function(g){return g.total;});})
    .entries(rawdata)
  
  data_repo = data.map(function(d){ return {"name":d.key, "value":d.values}})
  // data_repo = data_repo.slice(0,5);
  data_repo = {name:"", "children":data_repo}
  // console.log(data_repo)  
  
  treemapRepo = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .round(false)
    .mode("squarify")
    .nodes(data_repo)
  // console.log(treemapRepo)

  var filter = defs.append("svg:filter")
    .attr("id", "outerDropShadow")
    .attr("x", "-20%")
    .attr("y", "-20%")
    .attr("width", "140%")
    .attr("height", "140%");

  filter.append("svg:feOffset")
    .attr("result", "offOut")
    .attr("in", "SourceGraphic")
    .attr("dx", "3")
    .attr("dy", "3");

  filter.append("svg:feColorMatrix")
    .attr("result", "matrixOut")
    .attr("in", "offOut")
    .attr("type", "matrix")
    .attr("values", "1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 .5 0");

  filter.append("svg:feGaussianBlur")
    .attr("result", "blurOut")
    .attr("in", "matrixOut")
    .attr("stdDeviation", "3");

  filter.append("svg:feBlend")
    .attr("in", "SourceGraphic")
    .attr("in2", "blurOut")
    .attr("mode", "normal");

  var cellsRepo = vis.selectAll(".cellRepo")
    .data(treemapRepo)
    .enter()
      .append("g")
      .attr("class", "cellRepo")
      .on("mouseover", function() {
        d3.select(this).selectAll('rect')
          .attr("filter", "url(#outerDropShadow)")
          // .style("z-index", 1000)
          .attr("stroke", "#000");
      })
      .on("mouseout", function() {
        d3.select(this).selectAll('rect')
          .attr("filter", "")
          .attr("stroke", "#fff");
      })
      .on("click", function() {
        d3.select(this).selectAll("text")
          .text(function(d){ console.log(d.name); return d.name;})
      })
  // console.log(cellsRepo)

  cellsRepo.append("rect")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .attr("width", function(d) { return d.dx; })
    .attr("height", function(d) { return d.dy; })
    .attr("fill", function(d) {return d.value ? colorscale(d.name) : null; })
    .attr("stroke", "#FFF");

  cellsRepo.append("text")
    .attr("x", function(d) {return d.x + d.dx/2 })
    .attr("y", function(d) {return d.y + d.dy/2 })
    .attr("text-anchor", "middle")
    .text(function(d) {return d.value ? d.name : ''; })

}

