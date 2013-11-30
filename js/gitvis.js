var mouseoverTimer;

function init(){
    parsetimestamp = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;
    margin = {top: 5, right: 0, bottom: 10, left: 0},
        bodywidth = 1050;
        windowwidth = d3.select('body').style('width').replace('px',''),
        width = bodywidth - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    div = d3.select("#treemap-div").append("div")
        .style("position", "relative")
        .style("width", (width + margin.left + margin.right) + "px")
        .style("height", (height + margin.top + margin.bottom) + "px")
        .style("left", margin.left + "px")
        .style("top", margin.top + "px");

    tooltip_div = d3.select("body").append("div")   
            .attr("class", "tooltip")
            .attr('id', 'tooltip')
            .style("visibility", "hidden");

    currentPost = "";

    d3.select(document)
            .on("mousemove", function() {
                 var mouse_x = d3.event.pageX;
                 var mouse_y = d3.event.pageY;
                 var tooltip_width = d3.select('#tooltip').style('width').replace('px','')
                 tooltip_div
                     .style("left", mouse_x < windowwidth-400 ? (mouse_x + 20) + "px" : (mouse_x - 20 - tooltip_width) + "px")
                     .style("top", (mouse_y - 40) + "px");
            });


    format = d3.format("0,000");

    color = d3.scale.category20()

    treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(true)
        .children(function(d) { return d.values; })
        .value(function(d) { return d.values.total; })
        // .sort(function(a,b) {return a.total - b.total})
        .round(false);

    d3.csv('data/balancedDataFull.csv',update) 

}

function update(csv){
  d3.select('#select-score').property('checked', true);
  data=d3.nest()
    .key(function(d) {return d.repo;})
    // .key(function(d) {
    //   if(parseInt(d.type) == 1){
    //     return d.name;
    //   }
    //   else {
    //     var st = "External";
    //     return st;
    //   }
    // })
    .rollup(function(leaves) { return {"count": leaves.length, "total": d3.sum(leaves, function(d) {return parseFloat(d.total);}), "additions": d3.sum(leaves, function(d) {return parseFloat(d.additions);}), "deletions": d3.sum(leaves, function(d) {return parseFloat(d.deletions);})} })
    .entries(csv);
  data={key:'repo_treemap', values:data};

  console.log(data)

  var nodelink = div.datum(data).selectAll(".nodelink")
      .data(treemap.nodes)
    .enter().append("a")
      .attr("class", "nodelink")
      .attr('href',function(d)  {return d.values.total ? d.key : null; } )

  var node = nodelink
    .append("div")
      .attr("class", "node")
      .call(position)
      .attr("stroke", "#FFF")
      .style("background", function(d) { return d.values ? d3.rgb(color(d.key)) : null; })
           .on("mouseover", function(d){
                tooltip_div       
                    .style("visibility", "visible")
                    .transition().duration(150)
                    .style("opacity", 1);
                  var putImageInTooltip = function() {
                      tooltip_div.html("<b class='tooltip tooltitle'>" + d.key + "</b><div>"
                         + "<table><tr><td><b># Commits</b></td><td>" + format(d.values.count) + "</td></tr>"
                         + "<tr><td><b>Total</b></td><td>" + format(d.values.total) + "</td></tr>"
                         + "<tr><td><b>Additions</b></td><td>" + format(d.values.additions) + "</td></tr>"
                         + "<tr><td><b>Deletions</b></td><td>" + format(d.values.deletions) + "</td></tr></table></div>");    
                  }
                      putImageInTooltip();
          })
          .on("mouseout",function(){
                tooltip_div.transition()      
                    .duration(200)
                    .style("opacity", 0);
          });
    var nodeAnchors = node.append("a")
      .html(function(d) { return d.values.total ? (d.key =="test post please ignore" ?
                                                         "<span style='font-size: 16px'><b>Top scoring reddit post of all time:</b></span><br> test post please ignore" :
                                                          d.key) : null ;})
      .attr('href',function(d)  {return d.values.total ? d.key : null; } )
  
    // var setLinkDestinations = function(commentsPageBool) {
    //    nodeAnchors
    //        .attr("href", function(d) {return d.children ? null : ( commentsPageBool ? d.comment_link : d.direct_links ) } )
    //    nodelink
    //        .attr('href',function(d)  {return d.children ? null : ( commentsPageBool ? d.comment_link : d.direct_links ) } )
    // }
    // setLinkDestinations(d3.select('#comments-page').property('checked'));


    // var d = color.domain();
    // d[0] = "";
    // d[17] = "";
    // color.domain(d);
    // var r = color.range();
    // r[0] = "white";
    // color.range(r);
    
    // var legendWidth = 1000, legendHeight=75;
    // var colourLegendSvg = d3.select('#legend-div').append('svg')
    //     .attr('id', 'colour-legend-svg')
    //     .attr('width', legendWidth).attr('height',legendHeight);
    // var colourLegendXInterval = 140;
    // colourLegendSvg.selectAll(".legend-box")
    //     .data(color.range()).enter()
    //     .append('rect')
    //     .attr('class', 'legend-box')
    //     .attr('fill', function(d) {return d;})
    //     .attr('x', function(d,i) {return -60 + (i>6 ? (i>12 ? i-12 : i-6) : i) * colourLegendXInterval + 43})
    //     .attr('y', function(d,i) {return i > 6 ? (i>12 ? 60 : 30) : 0})
    //     .attr('width', 18)
    //     .attr('height', 12) 
    // colourLegendSvg.selectAll(".legend-text")
    //     .data(color.domain()).enter()
    //     .append('text')
    //     .attr('class', 'legend-text')
    //     .attr('x', function(d,i) {return -47 + (i>6 ? (i>12 ? i-12 : i-6) : i) * colourLegendXInterval + 53})
    //     .attr('y', function(d,i) {return i > 6 ? (i>12 ? 71 : 41) : 11})
    //     .text(function(d) {return d});
    // colourLegendSvg.append('text')
    //     .attr('x', 0)
    //     .attr('y', 11)
    //     .attr('font-weight', 'bold')
    //     .text("RepoMap:");

    d3.selectAll(".mode-radio").on("change", function change() {
      var value = this.value === "score"
        ? function(d) { return d.values.total; }
        : function(d) { return d.values.count; };

      node
        .data(treemap.value(value).nodes)
        .transition()
        .duration(1500)
        .call(position);
    });
    // d3.selectAll(".link-radio").on("change", function() {setLinkDestinations(this.value === "comments-page")});

};


function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}
