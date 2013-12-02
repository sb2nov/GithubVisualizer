var mouseoverTimer;
var repoSelected = null;
var userSelected = null;

function init(){
    parsetimestamp = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;
    margin = {top: 5, right: 5, bottom: 10, left: 10},
        // bodywidth = 1050;
        windowwidth = d3.select('body').style('width').replace('px',''),
        windowheight = Math.max(d3.select('body').style('height').replace('px',''), 900),
        width = windowwidth - margin.left - margin.right,
        height = windowheight - margin.top - margin.bottom;
        
    timeDiv = d3.select("#timeline-div").append("div")
        .style("position", "relative")
        .style("width", (width + margin.left + margin.right) + "px")
        .style("height", (height + margin.top + margin.bottom) * 0.23 + "px")
        .style("left", margin.left + "px")
        .style("top", margin.top + "px");

    repoMapDiv = d3.select("#treemap-repo-div").append("div")
        .style("position", "relative")
        .style("width", ((width + margin.left + margin.right)*0.4) + "px")
        .style("height", ((height + margin.top + margin.bottom)*0.5) + "px")
        // .style("left", margin.left + "px")
        .style("top", margin.top + "px");

    userMapDiv = d3.select("#treemap-user-div").append("div")
        .style("position", "relative")
        .style("width", width*0.4 + "px")
        .style("height", (height*0.5) + "px")
        .style("left", margin.left+ 150 + "px")
        .style("top", margin.top + "px");

    heatDiv = d3.select("#heatmap-div").append("div")
        .style("position", "relative")
        .style("width", (width + margin.left + margin.right) + "px")
        .style("height", (height + margin.top + margin.bottom) * 0.23 + "px")
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

    repoTreeMap = d3.layout.treemap()
        .size([(width + margin.left + margin.right)*0.5, (height + margin.top + margin.bottom)*0.5])
        // .sticky(true)
        .children(function(d) { return d.values; })
        .value(function(d) { return d.values.total; })
        .round(false);

    userTreeMap = d3.layout.treemap()
        .size([(width)*0.5, (height)*0.5])
        // .sticky(true)
        .children(function(d) { return d.values; })
        .value(function(d) { return d.values.total; })
        .round(false);

    d3.select('#select-score').property('checked', true);

  update();

}

function update(){
  
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

    repoData = d3.nest()
      .key(function(d) {return d.repo;})
      .rollup(function(leaves) { return {"count": leaves.length, "total": d3.sum(leaves, function(d) {return parseFloat(d.total);}), "additions": d3.sum(leaves, function(d) {return parseFloat(d.additions);}), "deletions": d3.sum(leaves, function(d) {return parseFloat(d.deletions);})} })
      .entries(csv);

    userData = d3.nest()
      .key(function(d) {return d.username;})
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

    repoTimeDataObj = new Object();
    repoTimeData.forEach(function(d) {repoTimeDataObj[d.key] = d.values;});

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

    userTimeDataObj = new Object();
    userTimeData.forEach(function(d) {userTimeDataObj[d.key] = d.values;});

    userRepoData = d3.nest()
      .key(function(d) {return d.username;})
      .key(function(d) {return d.repo;})
      .rollup(function(leaves) { return {"count": leaves.length, "total": d3.sum(leaves, function(d) {return parseFloat(d.total);}), "additions": d3.sum(leaves, function(d) {return parseFloat(d.additions);}), "deletions": d3.sum(leaves, function(d) {return parseFloat(d.deletions);})} })
      .entries(csv);

    userRepoDataObj = new Object();
    userRepoData.forEach(function(d) {userRepoDataObj[d.key] = d.values;});

    repoUserData = d3.nest()
      .key(function(d) {return d.repo;})
      .key(function(d) {return d.username;})
      .rollup(function(leaves) { return {"count": leaves.length, "total": d3.sum(leaves, function(d) {return parseFloat(d.total);}), "additions": d3.sum(leaves, function(d) {return parseFloat(d.additions);}), "deletions": d3.sum(leaves, function(d) {return parseFloat(d.deletions);})} })
      .entries(csv);

    repoUserDataObj = new Object();
    repoUserData.forEach(function(d) {repoUserDataObj[d.key] = d.values;});
      
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

    repoUserTimeDataObj = new Object();
    repoUserTimeData.forEach(function(d) {
      tempObj = new Object();
      d.values.forEach(function(d) { tempObj[d.key] = d.values;})
      repoUserTimeDataObj[d.key] = tempObj;}
    );

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

    userRepoTimeDataObj = new Object();
    userRepoTimeData.forEach(function(d) {
      tempObj = new Object();
      d.values.forEach(function(d) { tempObj[d.key] = d.values;})
      userRepoTimeDataObj[d.key] = tempObj;}
    );

      // Main Call
      draw();

}

function draw(){
  if(userSelected){
    repoDataToUse = {values: userRepoDataObj[userSelected]}
  }
  else{
    repoDataToUse = {values: repoData}
  }
  repoDataToUse['key'] = 'repo_treemap'

  if(repoSelected){
    userDataToUse = {values: repoUserDataObj[repoSelected]}
  }
  else{
    userDataToUse = {values: userData}
  }
  userDataToUse['key'] = 'user_treemap'

  drawTreeMap(repoDataToUse, userDataToUse);
}


function drawTreeMap(repoDataToUse, userDataToUse){

  // console.log(repoDataToUse)
  // console.log(repoTreeMap.nodes(repoDataToUse))

  nodelinkRepo = repoMapDiv.selectAll(".nodelink")
    .data(repoTreeMap.nodes(repoDataToUse))
    .enter()
      .append("a")
      .attr("class", "nodelink")
      .each(function(d) {
          d3.select(this)
            .append("div")
            .attr("class", "node")
            .each(function(d) {
                d3.select(this)
                  .append("a")
                  .attr("class", "nodeanchor")
            });  
      })

  repoMapDiv.selectAll(".nodelink")
    .data(repoTreeMap.nodes(repoDataToUse))
    .exit().remove();

  nodeRepo = repoMapDiv.selectAll(".node")
    .data(repoTreeMap.nodes(repoDataToUse))
    .exit().remove()

  nodeRepo = repoMapDiv.selectAll(".node")
      .data(repoTreeMap.nodes(repoDataToUse))
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
          })
          .on("click", function(d){
                repoSelected = d.key;
                if(userSelected==null){
                    draw();                  
                }
          });

  nodeAnchorsRepo = repoMapDiv.selectAll(".nodeanchor")
    .data(repoTreeMap.nodes(repoDataToUse))
    .html(function(d) { return d.values.total ? d.key : null ;})
    .exit().remove();

  if(userSelected){
    repoMapDiv.selectAll(".nodelink")
      .attr('href', function(d){return d.values.total ? "https://github.com/balanced/" + d.key : null;})
      .attr('target', '_blank');
    repoMapDiv.selectAll(".nodeanchor")
      .attr('href', function(d){return d.values.total ? "https://github.com/balanced/" + d.key : null;})
      .attr('target', '_blank');
  }

  // ---------------------------------------

  // console.log(userDataToUse)
  // console.log(userTreeMap.nodes(userDataToUse))

  nodelinkUser = userMapDiv.selectAll(".nodelink")
    .data(userTreeMap.nodes(userDataToUse))
    .enter()
    .append("a")
    .attr("class", "nodelink")
    .each(function(d) {
        d3.select(this)
          .append("div")
          .attr("class", "node")
          .each(function(d) {
              d3.select(this)
                .append("a")
                .attr("class", "nodeanchor")
          });  
    })

  userMapDiv.selectAll(".nodelink")
    .data(userTreeMap.nodes(userDataToUse))
    .exit().remove();

  nodeUser = userMapDiv.selectAll(".node")
    .data(userTreeMap.nodes(userDataToUse))
    .exit().remove()

  nodeUser = userMapDiv.selectAll(".node")
      .data(userTreeMap.nodes(userDataToUse))
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
          })
          .on("click", function(d){
                userSelected = d.key;
                if(repoSelected==null){
                  draw(); 
                }
          });

  nodeAnchorsUser = userMapDiv.selectAll(".nodeanchor")
    .data(userTreeMap.nodes(userDataToUse))
    .html(function(d) { return d.values.total ? d.key : null ;})
    .exit().remove();

  if(repoSelected){
    userMapDiv.selectAll(".nodelink")
      .attr('href', function(d){return d.values.total ? "https://github.com/" + d.key : null;})
      .attr('target', '_blank');
    userMapDiv.selectAll(".nodeanchor")
      .attr('href', function(d){return d.values.total ? "https://github.com/" + d.key : null;})
      .attr('target', '_blank');
  }

  // ---------------------------------------

  d3.selectAll(".mode-radio").on("change", function change() {
    var value = this.value === "total"
      ? function(d) { return d.values.total; }
      : this.value === "additions"
          ? function(d) { return d.values.additions; } 
          : this.value === "deletions" 
              ? function(d) { return d.values.deletions; } 
              : function(d) { return d.values.count; };

    nodeRepo
      .data(repoTreeMap.value(value).nodes(repoDataToUse))
      .transition()
      .duration(500)
      .call(position);
    nodeUser
      .data(userTreeMap.value(value).nodes(userDataToUse))
      .transition()
      .duration(1500)
      .call(position);
  });

}


function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}
