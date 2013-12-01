var mouseoverTimer;

function init(){
    parsetimestamp = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;
    margin = {top: 5, right: 5, bottom: 10, left: 10},
        // bodywidth = 1050;
        windowwidth = d3.select('body').style('width').replace('px',''),
        windowheight = Math.max(d3.select('body').style('height').replace('px',''), 900),
        width = windowwidth - margin.left - margin.right,
        height = windowheight - margin.top - margin.bottom;
        
    div = d3.select("#timeline-div").append("div")
        .style("position", "relative")
        .style("width", (width + margin.left + margin.right) + "px")
        .style("height", (height + margin.top + margin.bottom) * 0.23 + "px")
        .style("left", margin.left + "px")
        .style("top", margin.top + "px");

    div = d3.select("#treemap-repo-div").append("div")
        .style("position", "relative")
        .style("width", ((width + margin.left + margin.right)*0.4) + "px")
        .style("height", ((height + margin.top + margin.bottom)*0.5) + "px")
        .style("left", margin.left + "px")
        .style("top", (margin.top + (height + margin.top + margin.bottom) * 0.25) + "px");

    div = d3.select("#treemap-user-div").append("div")
        .style("position", "relative")
        .style("width", (width + margin.left + margin.right)*0.4 + "px")
        .style("height", ((height + margin.top + margin.bottom)*0.5) + "px")
        .style("left", ((windowwidth/2.0) + margin.left) + "px")
        .style("top", (margin.top + (height + margin.top + margin.bottom) * 0.25) + "px");

    div = d3.select("#heatmap-div").append("div")
        .style("position", "relative")
        .style("width", (width + margin.left + margin.right) + "px")
        .style("height", (height + margin.top + margin.bottom) * 0.23 + "px")
        .style("left", margin.left + "px")
        .style("top", (margin.top + (height + margin.top + margin.bottom) * 0.75) + "px");


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

    // treemap = d3.layout.treemap()
    //     .size([width, height])
    //     .sticky(true)
    //     .children(function(d) { return d.values; })
    //     .value(function(d) { return d.values.total; })
    //     // .sort(function(a,b) {return a.total - b.total})
    //     .round(false);

    d3.select('#select-score').property('checked', true);

    d3.csv('data/balancedDataFull.csv', function(d) {
         //repo  username  type  name  timestamp additions deletions total message userURL repoURL
         return {
           repo: d.repo,
           timestamp: d.timestamp.substring(0,10),
           username: d.username,
           ietype: +d.type,
           realname: d.name,
           additions: +d.additions,
           deletions: +d.deletions,
           total: +d.total,
           message: d.message,
           userURL: d.userURL,
           repoURL: d.repoURL
         };
       }, formatData) 
}

function formatData(error, csv) {

    timeData = d3.nest()
      .key(function(d) {return d.timestamp;})
      .sortKeys(function(a,b) {
          var a_date = new Date(Date.parse(a));
          var b_date = new Date(Date.parse(b));
          return a_date - b_date;
      })
      .rollup(function(leaves) { return {"count": leaves.length, "total": d3.sum(leaves, function(d) {return parseFloat(d.total);}), "additions": d3.sum(leaves, function(d) {return parseFloat(d.additions);}), "deletions": d3.sum(leaves, function(d) {return parseFloat(d.deletions);})} })
      .entries(csv);

    repoTimeData = d3.nest()
      .key(function(d) {return d.repo;})
      .key(function(d) {return d.timestamp;})
      .sortKeys(function(a,b) {
          var a_date = new Date(Date.parse(a));
          var b_date = new Date(Date.parse(b));
          return a_date - b_date;
      })
      .rollup(function(leaves) { return {"count": leaves.length, "total": d3.sum(leaves, function(d) {return parseFloat(d.total);}), "additions": d3.sum(leaves, function(d) {return parseFloat(d.additions);}), "deletions": d3.sum(leaves, function(d) {return parseFloat(d.deletions);})} })
      .entries(csv);

    userTimeData = d3.nest()
      .key(function(d) {return d.username;})
      .key(function(d) {return d.timestamp;})
      .sortKeys(function(a,b) {
          var a_date = new Date(Date.parse(a));
          var b_date = new Date(Date.parse(b));
          return a_date - b_date;
      })
      .rollup(function(leaves) { return {"count": leaves.length, "total": d3.sum(leaves, function(d) {return parseFloat(d.total);}), "additions": d3.sum(leaves, function(d) {return parseFloat(d.additions);}), "deletions": d3.sum(leaves, function(d) {return parseFloat(d.deletions);})} })
      .entries(csv);


    userRepoData = d3.nest()
      .key(function(d) {return d.username;})
      .key(function(d) {return d.repo;})
      .rollup(function(leaves) { return {"count": leaves.length, "total": d3.sum(leaves, function(d) {return parseFloat(d.total);}), "additions": d3.sum(leaves, function(d) {return parseFloat(d.additions);}), "deletions": d3.sum(leaves, function(d) {return parseFloat(d.deletions);})} })
      .entries(csv);

    repoUserData = d3.nest()
      .key(function(d) {return d.repo;})
      .key(function(d) {return d.username;})
      .rollup(function(leaves) { return {"count": leaves.length, "total": d3.sum(leaves, function(d) {return parseFloat(d.total);}), "additions": d3.sum(leaves, function(d) {return parseFloat(d.additions);}), "deletions": d3.sum(leaves, function(d) {return parseFloat(d.deletions);})} })
      .entries(csv);
      
    repoUserTimeData = d3.nest()
      .key(function(d) {return d.repo;})
      .key(function(d) {return d.username;})
      .key(function(d) {return d.timestamp;})
      .sortKeys(function(a,b) {
          var a_date = new Date(Date.parse(a));
          var b_date = new Date(Date.parse(b));
          return a_date - b_date;
      })
      .rollup(function(leaves) { return {"count": leaves.length, "total": d3.sum(leaves, function(d) {return parseFloat(d.total);}), "additions": d3.sum(leaves, function(d) {return parseFloat(d.additions);}), "deletions": d3.sum(leaves, function(d) {return parseFloat(d.deletions);})} })
      .entries(csv);

    userRepoTimeData = d3.nest()
      .key(function(d) {return d.username;})
      .key(function(d) {return d.repo;})
      .key(function(d) {return d.timestamp;})
      .sortKeys(function(a,b) {
          var a_date = new Date(Date.parse(a));
          var b_date = new Date(Date.parse(b));
          return a_date - b_date;
      })
      .rollup(function(leaves) { return {"count": leaves.length, "total": d3.sum(leaves, function(d) {return parseFloat(d.total);}), "additions": d3.sum(leaves, function(d) {return parseFloat(d.additions);}), "deletions": d3.sum(leaves, function(d) {return parseFloat(d.deletions);})} })
      .entries(csv);

      // Main Call
      draw();

}


function draw(){
    reponame = "balanced-python";
}

function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}
