var chart;
var height = 600
var width = 600
//DEFINE YOUR VARIABLES UP HERE


//Gets called when the page is loaded.
function init(){
  chart = d3.select('#vis').append('svg')
    .attr('width', width + 100)
    .attr('height', height + 100)
    .style('margin-left', 100)

  vis = chart.append('svg:g')
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
  data_repo = {name:"repomap", "children":data_repo}
  // console.log(data_repo)  
  
  treemapRepo = d3.layout.treemap()
    .size([width, height])
    .mode("squarify")
    .nodes(data_repo)
  // console.log(treemapRepo)

  var cellsRepo = vis.selectAll(".cellRepo")
    .data(treemapRepo)
    .enter()
      .append("g")
      .attr("class", "cellRepo")
  // console.log(cellsRepo)

  cellsRepo.append("rect")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .attr("width", function(d) { return d.dx; })
    .attr("height", function(d) { return d.dy; })
    .attr("fill", function(d) {return d.value ? colorscale(d.name) : null; })
    .attr("stroke", "#fff")
  
  cellsRepo.append("text")
    .attr("x", function(d) {return d.x + d.dx/2 })
    .attr("y", function(d) {return d.y + d.dy/2 })
    .attr("text-anchor", "middle")
    .text(function(d) {return d.value ? d.name : null; })

}

