// Global variables
var repoSelected = null;
var userSelected = null;
var firstClick = null;
var secondClick = null;
var choiceSelected = 'commits';

var rawdata = null;
var uniTimeSeries = null;

var usernameNameObj = {External: "Open Source", bninja: "Andrew", dmdj03: "Damon Chin", jkwade: "Jareau Wade", mahmoudimus: "Mahmoud Abdelkader", matin: "Matin Tamizi", mjallday: "Marshall Jones", msherry: "Marc Sherry", timnguyen: "Tim Nguyen"};

// Get Choice Function

function getChoice(){
    if(choiceSelected == 'total'){ return function(d) {return d.values.total;}}
    if(choiceSelected == 'additions'){ return function(d) {return d.values.additions;}}
    if(choiceSelected == 'deletions'){ return function(d) {return d.values.deletions;}}
    if(choiceSelected == 'commits'){ return function(d) {return d.values.count;}}
}


function init(){

    // General Initializations
    parsetimestamp = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;
    parsedatestamp = d3.time.format("%Y-%m-%d").parse;
    color = d3.scale.category20();

    margin = {top: 5, right: 5, bottom: 30, left: 50};
    windowwidth = d3.select('body').style('width').replace('px','');
    windowheight = Math.max(d3.select('body').style('height').replace('px',''), 900);
    width = windowwidth - margin.left - 4*margin.right;
    height = windowheight - margin.top - margin.bottom;
    
    // console.log(width);
    // console.log(height);
    
    height_single = height/4;
    height_brush_div = height/16;
    width_half = 600;

    // ----------------------------- //
    // ----------------------------- //

    // Timeline Initializations

    timeDiv = d3.select("#timeline-div")
        .style("position", "relative")
        .style("width", width + margin.left + margin.right + "px")
        .style("height", height_single + margin.top + margin.bottom + "px")
        // .style("left", margin.left + "px")   
        // .style("margin-bottom", margin.bottom + "px")
        .style("top", margin.top + "px");

    xScaleTimeLine = d3.time.scale()
        .range([0, width]);

    yScaleTimeLine = d3.scale.linear()
        .range([0, height_single]);
    
    xAxisTimeLine = d3.svg.axis()
        .scale(xScaleTimeLine)
        .orient('bottom')
        // .ticks(d3.time.days, 1)
        // .tickFormat(d3.time.format('%a %d'))
        .tickSize(5,1)
        .tickPadding(8);

    yAxisTimeLine = d3.svg.axis()
        .scale(yScaleTimeLine)
        .orient('left')
        .tickSize(5,1)
        .tickPadding(8);
    
    timeSvg = timeDiv.append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height_single + margin.top + margin.bottom)
        .attr('class', 'timeSvgClass')
        .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    timeSvgYaxis = timeSvg.append('svg:g')
        .attr('class', 'axis')

    timeSvgXaxis = timeSvg.append('svg:g')
        .attr('transform', 'translate('+ (0) +','+ height_single+')')
        .attr('class', 'axis')

    // ----------------------------- //
    // ----------------------------- //

    // TimeLine Brush Initializatoin
    timeBrushDiv = d3.select("#timeline-brush-div")
        .style("position", "relative")
        .style("width", width + margin.left + margin.right + "px")
        .style("height", height_brush_div + margin.top + margin.bottom + "px")
        .style("top", margin.top + "px");

    xScaleTimeBrush = d3.time.scale()
        .range([0, width]);

    yScaleTimeBrush = d3.scale.linear()
        .range([0, height_brush_div]);

    xAxisTimeBrush = d3.svg.axis()
        .scale(xScaleTimeBrush)
        .orient('bottom')
        .tickSize(5,1)
        .tickPadding(8);

    brush = d3.svg.brush()
        .x(xScaleTimeBrush)
        .on("brush", brushed);

    timeBrushSvg = timeBrushDiv.append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height_brush_div + margin.top + margin.bottom)
        .attr('class', 'timeBrushSvgClass')
        .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    timeBrushSvgXaxis = timeBrushSvg.append('svg:g')
        .attr('transform', 'translate('+ (0) +','+ height_brush_div +')')
        .attr('class', 'axis')

    timeBrushSvgContext = timeBrushSvg.append('svg:g')

    timeBrushSvgContext.append("g")
            .attr("class", "x brush")
        .selectAll("rect")
            .attr("y", -6)
            .attr("height", height_brush_div + 7);

    // ----------------------------- //
    // ----------------------------- //

    // RepoMap Initialization
    repoMapDiv = d3.select("#treemap-repo-div")
        .style("position", "relative")
        .style("width", width_half + margin.left + margin.right + "px")
        .style("height", height_single + margin.top + margin.bottom + "px")
        .style("top", margin.top + "px");

    repoTreeMap = d3.layout.treemap()
        .size([(width_half + margin.left + margin.right), (height_single + margin.top + margin.bottom)])
        // .sticky(true)
        .children(function(d) { return d.values; })
        .value(getChoice())
        .round(false);

    // ----------------------------- //
    // ----------------------------- //

    // UserMap Initialization


    // ----------------------------- //
    // ----------------------------- //

    // HeatMap Initialization


    // ----------------------------- //
    // ----------------------------- //

    // Tooltip Initialization
    tooltip_div = d3.select("body").append("div")   
        .attr("class", "tooltip")
        .attr('id', 'tooltip')
        .style("visibility", "hidden");

    d3.select(document)
        .on("mousemove", function() {
            var mouse_x = d3.event.pageX;
            var mouse_y = d3.event.pageY;
            var tooltip_width = d3.select('#tooltip').style('width').replace('px','')
            tooltip_div
                .style("left", mouse_x < windowwidth-400 ? (mouse_x + 20) + "px" : (mouse_x - 20 - tooltip_width) + "px")
                .style("top", (mouse_y - 40) + "px");
        });


    // ----------------------------- //
    // ----------------------------- //

    // Other Initialization
    format = d3.format("0,000");
    d3.select('#select-score').property('checked', true);

    // Update Page Function
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
           dateob: new Date(d.timestamp.substring(0,10) + " (UTC)"),
           monthob: new Date(d.timestamp.substring(0,7) + " (UTC)"),
           message: d.message,
           userURL: d.userURL,
           repoURL: d.repoURL
         };
       }, renderFunc) 
}


function filterData(extentVals){
    if(!rawdata) {return null};
    
    filteredData = rawdata;
    if(extentVals) {
        filteredData = rawdata.filter(function(d) {
            return d.dateob > extentVals[0] && d.dateob < extentVals[1];
        });
    };

    filteredTimeNest = d3.nest()
        .key(function(d) {return d.timestamp;})
        .sortKeys(compareDates)
        .rollup(rollLeaves)
        .entries(filteredData);
    
    filterTimeRepo = filteredData;
    filterTimeRepoNest = null;
    if(repoSelected) {
        filterTimeRepo = filteredData.filter(function(d) {return d.repo == repoSelected;});

        filterTimeRepoNest = d3.nest()
            .key(function(d) {return d.timestamp;})
            .sortKeys(compareDates)
            .rollup(rollLeaves)
            .entries(filterTimeRepo);
    }
    
    filterRepoNest = d3.nest()
        .key(function(d) {return d.repo;})
        .rollup(rollLeaves)
        .entries(filterTimeRepo);

    filterTimeUser = filteredData;
    filterTimeUserNest = null;
    if(userSelected){
        filterTimeUser = filteredData.filter(function(d) {return d.username == userSelected;});
        
        filterTimeUserNest = d3.nest()
            .key(function(d) {return d.timestamp;})
            .sortKeys(compareDates)
            .rollup(rollLeaves)
            .entries(filterTimeUser);
    }
    
    filterUserNest = d3.nest()
        .key(function(d) {return d.username;})
        .rollup(rollLeaves)
        .entries(filterTimeUser);

    filterTimeRepoUser = filterTimeUser;    
    filterTimeRepoUserNest = null;
    if(userSelected && repoSelected){
        filterTimeRepoUser = filterTimeUser.filter(function(d) {return d.repo == repoSelected;});

        filterTimeRepoUserNest = d3.nest()
            .key(function(d) {return d.timestamp;})
            .sortKeys(compareDates)
            .rollup(rollLeaves)
            .entries(filterTimeRepoUser);
    }
    
    objData = new Object();
    // TimeStamp Filters
    objData['time'] = filteredTimeNest;
    objData['repoTime'] = filterTimeRepoNest;
    objData['userTime'] = filterTimeUserNest;
    objData['userRepoTime'] = filterTimeRepoUserNest;

    // Treemap Data Filters
    objData['repo'] = filterRepoNest;
    objData['user'] = filterUserNest;
    
    //Heatmap Data Filters
    
    return objData;
}


function renderFunc(error, csv){
    rawdata = csv;
    console.log(rawdata[0]);

    // Data Manipulation
    var dataobj = filterData(null);
    uniTimeSeries = $.extend(true, [], dataobj.time);
    // console.log(dataobj);

    render_routine(dataobj);
}

function render_routine(dataobj){
    // Render Funcs
    renderTimeLine(dataobj);
    renderTimeBrush();
}

function renderTimeLine(dataobj){

    var timeData = dataobj.time;

    // Scale Domain Set
    xScaleTimeLine.domain([new Date(timeData[0].key), d3.time.day.offset(new Date(timeData[timeData.length - 1].key), 1)]);
    timeDataYvals = timeData.map(getChoice()).sort(d3.ascending);
    // yScaleTimeLine.domain([d3.max(timeData.map(getChoice())), 0]);
    yScaleTimeLine.domain([d3.quantile(timeDataYvals, 1.0), 0]);


    // Add the svg and bar elements
    timeSvgClassSelect = timeSvg.selectAll('.timeSvgClass')
        .data(timeData)
        .enter()
            .append('svg:rect')
            .attr('class','timeAllBar');
        
    // wTemp = width / timeData.length;
    wTemp = width / timeStampDiff(xScaleTimeLine.domain());

    timeSvg.selectAll('.timeAllBar')
        .data(timeData)
        .transition()
        .attr('class','timeAllBar')
        .attr('x', function(d){return xScaleTimeLine(new Date(d.key));})
        .attr("width", wTemp)
        .attr("y", function(d){return yScaleTimeLine(getChoice()(d));})
        .attr('height', function(d){return height_single - yScaleTimeLine(getChoice()(d));});

    timeSvg.selectAll('.timeSvgClass')
        .data(timeData)
        .exit().remove();
    
    timeSvg.selectAll('.timeAllBar')
        .data(timeData)
        .exit().remove();

    timeSvgYaxis.transition().call(yAxisTimeLine);
    timeSvgXaxis.transition().call(xAxisTimeLine);
}


function renderTimeBrush() {
        // Render Brush TimeSeries
    xScaleTimeBrush.domain(xScaleTimeLine.domain());
    yScaleTimeBrush.domain(yScaleTimeLine.domain());
    
    // Add the svg and bar elements
    timeBrushSvgClassSelect = timeBrushSvg.selectAll('.timeBrushSvgClass')
        .data(uniTimeSeries);
    
    timeBrushSvgClassSelect.exit().remove();

    timeBrushSvgClassSelect.enter()
        .append('svg:rect')
        .attr('class','timeBrushAllBar');

    timeBrushSvg.selectAll('.timeBrushAllBar')
        .data(uniTimeSeries)
        .attr('class','timeBrushAllBar')
        .attr('x', function(d){return xScaleTimeBrush(new Date(d.key));})
        .attr("width", wTemp)
        .attr("y", function(d){return yScaleTimeBrush(getChoice()(d));})
        .attr('height', function(d){return height_brush_div - yScaleTimeBrush(getChoice()(d));});

    timeBrushSvgXaxis.call(xAxisTimeBrush);

    timeBrushSvgContext
        .selectAll('.brush')
            .call(brush)
        .selectAll("rect")
            .attr("y", -6)
            .attr("height", height_brush_div + 7);
}


function renderRepoMap(dataobj){
    
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


function brushed(){
    extentVals = brush.empty() ? xScaleTimeBrush.domain() : brush.extent();
    xScaleTimeLine.domain(extentVals);
    timeSvgXaxis.transition().call(xAxisTimeLine);

    var dataobj = filterData(extentVals);

    // Render
    renderTimeLine(dataobj);
}

function compareDates(a,b) {
            var a_date = new Date(Date.parse(a));
            var b_date = new Date(Date.parse(b));
            return a_date - b_date;
}

function rollLeaves(leaves) { 
    return {"count": leaves.length, 
            "total": d3.sum(leaves, function(d) {return parseFloat(d.total);}), 
            "additions": d3.sum(leaves, function(d) {return parseFloat(d.additions);}), 
            "deletions": d3.sum(leaves, function(d) {return parseFloat(d.deletions);})}
}

function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

function timeStampDiff(dateArray){
    var diffInMilliseconds = dateArray[1].getTime() - dateArray[0].getTime();
    // days
    return Math.ceil(diffInMilliseconds / 1000 / 60 / 60 / 24);
}