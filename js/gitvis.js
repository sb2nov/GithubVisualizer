// Global variables
var repoSelected = null;
var userSelected = null;
var firstClick = null;
var secondClick = null;
var choiceSelected = 'commits';

// Data Variables
var rawdata = null;
var uniTimeSeries = null;
var numOfDays = 0;
var extentOfDays = [];

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
    width_half = width/2.1;

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
    userMapDiv = d3.select("#treemap-user-div")
        .style("position", "relative")
        .style("width", width_half + margin.left + margin.right + "px")
        .style("height", height_single + margin.top + margin.bottom + "px")
        .style("top", margin.top + "px");

    userTreeMap = d3.layout.treemap()
        .size([(width_half + margin.left + margin.right), (height_single + margin.top + margin.bottom)])
        // .sticky(true)
        .children(function(d) { return d.values; })
        .value(getChoice())
        .round(false);

    // ----------------------------- //
    // ----------------------------- //

    // HeatMap Initialization
    heatMapDiv = d3.select("#heatmap-div")
        .style("position", "relative")
        .style("width", width + margin.left + margin.right + "px")
        .style("height", height_single + margin.top + margin.bottom + "px")
        .style("top", margin.top + "px")
        .style("left", margin.left + "px");
    
    heatMapSvg = heatMapDiv.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr("height", height_single + margin.top + margin.bottom)
        .attr('class', 'heatSvgClass')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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
    d3.selectAll(".mode-radio").on("change", function() { radioUpdate(this.value);});


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
        if(filteredData.length == 0){
            filteredData = rawdata;
            extentVals = xScaleTimeBrush.domain();
        }
    };

    allChartTimeLineNest = d3.nest()
        .key(function(d) {return d.timestamp;})
        .sortKeys(compareDates)
        .rollup(rollLeaves)
        .entries(filteredData);

    if(allChartTimeLineNest.length > 0)
        extentOfDays = [allChartTimeLineNest[0].key, allChartTimeLineNest[allChartTimeLineNest.length-1].key];
    else
        extentOfDays = extentVals;

    numOfDays = moment(extentOfDays[1]).diff(extentOfDays[0], 'days');

    repoMapDataNest = null;
    userMapDataNest = null;
    heatMapDataNest = null;
    secondChartTimeLineNest = null;
    thirdChartTimeLineNest = null;

    if(!firstClick){
        repoMapDataNest = d3.nest()
            .key(function(d) {return d.repo;})
            .rollup(rollLeaves)
            .entries(filteredData);
            
        userMapDataNest = d3.nest()
            .key(function(d) {return d.username;})
            .rollup(rollLeaves)
            .entries(filteredData);
        
        heatMapDataNest = d3.nest()
            .key(function(d) {return d.repo;})
            .key(function(d) { return determineScale(d.timestamp);})
            .sortKeys(compareDates)
            .rollup(rollLeaves)
            .entries(filteredData);
    }
    
    if(firstClick=='repo'){
        
        filterFirstClickData = filteredData.filter(function(d) {return d.repo == repoSelected;});

        repoMapDataNest = d3.nest()
            .key(function(d) {return d.repo;})
            .rollup(rollLeaves)
            .entries(filteredData);

        userMapDataNest = d3.nest()
            .key(function(d) {return d.username;})
            .rollup(rollLeaves)
            .entries(filterFirstClickData);
        
        secondChartTimeLineNest = d3.nest()
            .key(function(d) {return d.timestamp;})
            .sortKeys(compareDates)
            .rollup(rollLeaves)
            .entries(filterFirstClickData);

    }
    
    if(firstClick=='user'){

        filterFirstClickData = filteredData.filter(function(d) {return d.username == userSelected;});

        repoMapDataNest = d3.nest()
            .key(function(d) {return d.repo;})
            .rollup(rollLeaves)
            .entries(filterFirstClickData);

        userMapDataNest = d3.nest()
            .key(function(d) {return d.username;})
            .rollup(rollLeaves)
            .entries(filteredData);

        secondChartTimeLineNest = d3.nest()
            .key(function(d) {return d.timestamp;})
            .sortKeys(compareDates)
            .rollup(rollLeaves)
            .entries(filterFirstClickData);

    }

    if(secondClick){
        filterSecondClickData = filterFirstClickData.filter(function(d) { return d.username == userSelected && d.repo == repoSelected;});

        thirdChartTimeLineNest = d3.nest()
            .key(function(d) {return d.timestamp;})
            .sortKeys(compareDates)
            .rollup(rollLeaves)
            .entries(filterSecondClickData);
    }

    repoMapDataNest = {values: repoMapDataNest, key:'repoMap'};
    userMapDataNest = {values: userMapDataNest, key:'userMap'};
    
    objData = new Object();
    // TimeStamp Filters
    objData['all_timeline_data'] = allChartTimeLineNest;
    objData['first_timeline_data'] = secondChartTimeLineNest;
    objData['second_timeline_data'] = thirdChartTimeLineNest;

    // Treemap Data Filters
    objData['repo_map_data'] = repoMapDataNest;
    objData['user_map_data'] = userMapDataNest;
    
    //Heatmap Data Filters
    objData['heat_map_data'] = heatMapDataNest;
    
    return objData;
}


function renderFunc(error, csv){
    rawdata = csv;
    console.log(rawdata[0]);

    // Data Manipulation
    var dataobj = filterData(null);
    uniTimeSeries = $.extend(true, [], dataobj.all_timeline_data);
    console.log(dataobj);

    render_routine(dataobj);
    renderTimeBrush();
}

function render_routine(dataobj){
    // Render Funcs
    renderTimeLine(dataobj);
    renderRepoMap(dataobj);
    renderUserMap(dataobj);
    renderFirstSelection(dataobj);
    renderSecondSelection(dataobj);
    renderHeatMap(dataobj);
}

function renderTimeLine(dataobj){

    var timeData = dataobj.all_timeline_data;

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
    var wTemp = width / timeStampDiff(xScaleTimeLine.domain());

    timeSvg.selectAll('.timeAllBar')
        .data(timeData)
        .transition()
        .attr('class','timeAllBar')
        .attr('x', function(d){return xScaleTimeLine(new Date(d.key));})
        .attr("width", wTemp)
        .attr("y", function(d){return yScaleTimeLine(getChoice()(d));})
        .attr('height', function(d){return height_single - yScaleTimeLine(getChoice()(d));});

    timeSvg.selectAll('.timeAllBar')
        .data(timeData)
        .on("mouseover", function(d){
            tooltip_div       
                .style("visibility", "visible")
                .transition().duration(150)
                .style("opacity", 1);
                var putImageInTooltip = function() {
                    tooltip_div.html(tooltipString(d));    
                }
                putImageInTooltip();
        })
        .on("mouseout",function(){
            tooltip_div.transition()      
                .duration(200)
                .style("opacity", 0);
        });

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

    var wTemp = width / timeStampDiff(xScaleTimeBrush.domain());

    timeBrushSvg.selectAll('.timeBrushAllBar')
        .data(uniTimeSeries)
        .transition()
        .attr('class','timeBrushAllBar')
        .attr('x', function(d){return xScaleTimeBrush(new Date(d.key));})
        .attr("width", wTemp)
        .attr("y", function(d){return yScaleTimeBrush(getChoice()(d));})
        .attr('height', function(d){return height_brush_div - yScaleTimeBrush(getChoice()(d));});

    timeBrushSvgXaxis.transition().call(xAxisTimeBrush);

    timeBrushSvgContext
        .selectAll('.brush')
            .call(brush)
        .selectAll("rect")
            .attr("y", -6)
            .attr("height", height_brush_div + 7);
}


function renderFirstSelection(dataobj){
    if(!firstClick) { return; }
    
    var timeData = dataobj.first_timeline_data;

    // Add the svg and bar elements
    timeSvgClassSelect = timeSvg.selectAll('.timeSvgClassFirst')
        .data(timeData)
        .enter()
            .append('svg:rect')
            .attr('class','timeFirstBar');

    // wTemp = width / timeData.length;
    var wTemp = width / timeStampDiff(xScaleTimeLine.domain());

    timeSvg.selectAll('.timeFirstBar')
        .data(timeData)
        .transition()
        .attr('class','timeFirstBar')
        .attr('x', function(d){return xScaleTimeLine(new Date(d.key));})
        .attr("width", wTemp)
        .attr("y", function(d){return yScaleTimeLine(getChoice()(d));})
        .attr('height', function(d){return height_single - yScaleTimeLine(getChoice()(d));});

    timeSvg.selectAll('.timeFirstBar')
        .data(timeData)
        .on("mouseover", function(d){
            tooltip_div       
                .style("visibility", "visible")
                .transition().duration(150)
                .style("opacity", 1);
                var putImageInTooltip = function() {
                    tooltip_div.html(tooltipString(d));    
                }
                putImageInTooltip();
        })
        .on("mouseout",function(){
            tooltip_div.transition()      
                .duration(200)
                .style("opacity", 0);
        });

    timeSvg.selectAll('.timeSvgClassFirst')
        .data(timeData)
        .exit().remove();
    
    timeSvg.selectAll('.timeFirstBar')
        .data(timeData)
        .exit().remove();
}


function renderSecondSelection(dataobj){
    if(!secondClick) { return; }
    
    var timeData = dataobj.second_timeline_data;

    // Add the svg and bar elements
    timeSvgClassSelect = timeSvg.selectAll('.timeSvgClassSecond')
        .data(timeData)
        .enter()
            .append('svg:rect')
            .attr('class','timeSecondBar');

    // wTemp = width / timeData.length;
    var wTemp = width / timeStampDiff(xScaleTimeLine.domain());

    timeSvg.selectAll('.timeSecondBar')
        .data(timeData)
        .transition()
        .attr('class','timeSecondBar')
        .attr('x', function(d){return xScaleTimeLine(new Date(d.key));})
        .attr("width", wTemp)
        .attr("y", function(d){return yScaleTimeLine(getChoice()(d));})
        .attr('height', function(d){return height_single - yScaleTimeLine(getChoice()(d));});

    timeSvg.selectAll('.timeSecondBar')
        .data(timeData)
        .on("mouseover", function(d){
            tooltip_div       
                .style("visibility", "visible")
                .transition().duration(150)
                .style("opacity", 1);
                var putImageInTooltip = function() {
                    tooltip_div.html(tooltipString(d));    
                }
                putImageInTooltip();
        })
        .on("mouseout",function(){
            tooltip_div.transition()      
                .duration(200)
                .style("opacity", 0);
        });

    timeSvg.selectAll('.timeSvgClassSecond')
        .data(timeData)
        .exit().remove();
    
    timeSvg.selectAll('.timeSecondBar')
        .data(timeData)
        .exit().remove();
}


function renderRepoMap(dataobj){
    // Repomap Render Function

    repoTreeMap
        .value(getChoice())
    
    var repoData = repoTreeMap.nodes(dataobj.repo_map_data)

    nodelinkRepo = repoMapDiv.selectAll(".nodelink")
        .data(repoData)
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
        .data(repoData)
        .exit().remove();

    nodeRepo = repoMapDiv.selectAll(".node")
        .data(repoData)
        .exit().remove()

    nodeRepo = repoMapDiv.selectAll(".node")
        .data(repoData)
        .attr("class", "node")
        .transition().call(position)
        .attr("stroke", "#FFF")
        .style("background", function(d) { return d.values ? color(d.key) : null; });
    
    repoMapDiv.selectAll(".node")
        .data(repoData)
        .on("mouseover", function(d){
            tooltip_div       
                .style("visibility", "visible")
                .transition().duration(150)
                .style("opacity", 1);
                var putImageInTooltip = function() {
                    tooltip_div.html(tooltipString(d));    
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
            if(firstClick == 'repo' && secondClick) {return;}
            if(!firstClick) {firstClick = 'repo';}
            if(firstClick != 'repo') {secondClick = 'repo';}
            brushed();
        });

    nodeAnchorsRepo = repoMapDiv.selectAll(".nodeanchor")
        .data(repoData)
        .html(function(d) { return d.values.total ? d.key : 'No contribution for any repository under this selection' ;})
        .exit().remove();
}


function  renderUserMap(dataobj){
    
    userTreeMap
        .value(getChoice())
    
    // Usermap Render Function
    var userData = userTreeMap.nodes(dataobj.user_map_data)
    
    nodelinkUser = userMapDiv.selectAll(".nodelink")
        .data(userData)
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
        .data(userData)
        .exit().remove();

    nodeUser = userMapDiv.selectAll(".node")
        .data(userData)
        .exit().remove()

    nodeUser = userMapDiv.selectAll(".node")
        .data(userData)
        .attr("class", "node")
        .transition().call(position)
        .attr("stroke", "#FFF")
        .style("background", function(d) { return d.values ? color(d.key) : null; });

    userMapDiv.selectAll(".node")
        .data(userData)
        .on("mouseover", function(d){
            tooltip_div       
                .style("visibility", "visible")
                .transition().duration(150)
                .style("opacity", 1);
                var putImageInTooltip = function() {
                    tooltip_div.html(tooltipString(d));    
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
            if(firstClick == 'user' && secondClick) {return;}
            if(!firstClick) {firstClick = 'user';}
            if(firstClick != 'user') {secondClick = 'user';}
            brushed();
        });

    nodeAnchorsUser = userMapDiv.selectAll(".nodeanchor")
        .data(userData)
        .html(function(d) { return d.values.total ? d.key : 'No contribution by any user under this selection' ;})
        .exit().remove();

}


function renderHeatMap(dataobj) {

    var data = dataobj.heat_map_data;
    if (!data) { return; }

    var heatMapPadding = 0;
    var yAxisData = data.map(function(d) {return d.key;});
    // var totalSteps = moment(extentOfDays[1]).diff(extentOfDays[0],'months');
    // var cellSize = computeCellSize(totalSteps, data.length, heatMapPadding);
    cellSize = 17;
    console.log(data);
    var heatMapData = fillMissingData(data, heatMapPadding, cellSize);
    console.log(heatMapData);

    var heatMapWidth = heatMapData[0].length * cellSize;
    var heatMapHeight = data.length * cellSize;

    // Y-Axis Scale
    var yScaleHeatMap = d3.scale.ordinal()
        .domain(yAxisData)
        .rangeBands([heatMapPadding, heatMapHeight-heatMapPadding]);

    // Define the Color Scale
    var zscale = d3.scale.linear()
        .domain([0, d3.max(heatMapData.map(function(d) { return d3.max(d, function(e) {return e.value;}) }))])
        .range(['red', 'green']);
    // console.log(zscale.domain());

    var yAxisHeatMap = d3.svg.axis()
        .scale(yScaleHeatMap)
        .tickSize(0)
        .orient('left');

    // Row Stuff
    heatMapRow = heatMapSvg.selectAll(".heatMapRow")
        .data(heatMapData)
        .enter()
            .append("svg:g")
            .attr("class", "heatMapRow");

    heatMapSvg.selectAll(".heatMapRow")
        .data(heatMapData)
        .exit().remove();

    heatMapSvg.selectAll('.heatMapRow')
        .data(heatMapData)
        .transition();
    
    
    // Cell Stuff
    heatMapRow.selectAll('.heatMapCell')
        .data(function(d) { return d; })
        .enter()
            .append('svg:rect')
            .attr('class', 'heatMapCell');

    heatMapRow.selectAll('.heatMapCell')
        .data(function(d) { return d; })
        .exit().remove();

    heatMapCell = heatMapRow.selectAll('.heatMapCell')
        .data(function(d) { return d; })
        .transition()
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return (yScaleHeatMap(d.names)); })
        .attr("width", function(d) { return d.width; })
        .attr("height", function(d) { return d.height; })
    
    heatMapRow.selectAll('.heatMapCell')
        .data(function(d) {return d;})
        .on("mouseover", function(d){
            tooltip_div       
                .style("visibility", "visible")
                .transition().duration(150)
                .style("opacity", 1);
                var putImageInTooltip = function() {
                    tooltip_div.html(tooltipStringHeat(d));    
                }
                putImageInTooltip();
        })
        .on("mouseout",function(){
            tooltip_div.transition()      
                .duration(200)
                .style("opacity", 0);
        });
}


function radioUpdate(dataInput){
    choiceSelected = dataInput;

    var dataobj = filterData(null);
    uniTimeSeries = $.extend(true, [], dataobj.all_timeline_data);
    console.log(dataobj);

    render_routine(dataobj);
    renderTimeBrush();   
}


function brushed(){
    extentVals = brush.empty() ? xScaleTimeBrush.domain() : brush.extent();
    xScaleTimeLine.domain(extentVals);
    timeSvgXaxis.transition().call(xAxisTimeLine);

    var dataobj = filterData(extentVals);

    // Render
    render_routine(dataobj);
}


function tooltipString(d){
    return "<b class='tooltip tooltitle'>" + d.key + "</b><div>" + "<table ><tr><td><b>Commits</b></td><td style='text-align: right'>" + format(d.values.count) + "</td></tr>" + "<tr><td><b>Total</b></td><td style='text-align: right'>" + format(d.values.total) + "</td></tr>" + "<tr><td><b>Additions</b></td><td style='text-align: right'>" + format(d.values.additions) + "</td></tr>" + "<tr><td><b>Deletions</b></td><td style='text-align: right'>" + format(d.values.deletions) + "</td></tr></table></div>";
}

function tooltipStringHeat(d){
    var choiceTitle = choiceSelected[0].toUpperCase() + choiceSelected.substring(1,choiceSelected.length);
    
    return "<b class='tooltip tooltitle'>" + d.names + "</b><div>" + "<table ><tr><td><b>Date</b></td><td style='text-align: right'>" + d.time + "</td></tr>" + "<tr><td><b>" + choiceTitle + "</b></td><td style='text-align: right'>" + format(d.value) + "</td></tr></table></div>";
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

function determineScale(timestamp) {
    //var startDate = moment(startDate);
    //var endDate = moment(endDate);
    //console.log(numOfDays);

    if(numOfDays < 40) {
        //console.log(timestamp);
        return timestamp;
    }
    else if(numOfDays/7 < 40) {
        timestamp = new Date(timestamp);
        //console.log(d3.time.day.offset(timestamp, (-1)*timestamp.getDay()));
        return d3.time.day.offset(timestamp, (-1) * timestamp.getDay()).toISOString().substring(0,10);
    }
    else {
        return timestamp.substring(0,7) + "-01";
    }
}

function fillMissingData(data, padding, cellSize) {
     //console.log(numOfDays);
     if(numOfDays < 40){
         return fillDaysWeeks(data, padding, cellSize, true);
     } else if(numOfDays/7 <40) {
         return fillDaysWeeks(data, padding, cellSize, false);
     } else {
        return fillMonths(data, padding, cellSize);
     }
}

function fillDaysWeeks(inputData, padding, cellSize, daily) {
    
    var startDate = null;
    var totalSteps;
    if(daily) {
        startDate = extentOfDays[0];
        totalSteps = numOfDays;
        size = 1;
        console.log("Daily : " + startDate);
    }else{
        var tmpDate = new Date(extentOfDays[0]);
        startDate = d3.time.day.offset(tmpDate, (-1) * tmpDate.getDay()).toISOString().substring(0,10)
        totalSteps = numOfDays/7;
        size = 7;
        console.log("Weekly: " + startDate);
    }

    var svgHeight = inputData.length*cellSize + padding*2;
    var svgWidth = totalSteps*cellSize + padding*2;

    var data = new Array();
    var xcount = totalSteps;
    var ycount = inputData.length;
    var svgHeatMapItemWidth = (svgWidth - padding*2) / xcount;
    var svgHeatMapItemHeight = (svgHeight - padding*2) / ycount;
    var startX = padding;
    var startY = (svgHeight-padding) / 2;
    var stepX = svgHeatMapItemWidth;
    var stepY = svgHeatMapItemHeight;
    var xpos = startX;
    var ypos = startY;
    var newValue = 0;
    var k = 0;

    for (var i = 0; i < ycount; i++)
    {
        data.push(new Array());
        var currDate = startDate;
        k = 0;
        for (var j = 0; j < xcount; j++)
        {
            console.log(currDate);
            if(k < inputData[i].values.length && inputData[i].values[k].key == currDate) {
                data[i].push({ 
                    time: inputData[i].values[k].key,
                    names: inputData[i].key, 
                    value: getChoice()(inputData[i].values[k]),
                    width: svgHeatMapItemWidth,
                    height: svgHeatMapItemHeight,
                    x: xpos,
                    y: ypos,
                });
                k++;
                console.log(k);
            } 
            else {
                data[i].push({ 
                    time: moment(currDate).add('days',1).toISOString().substring(0,10),
                    names: inputData[i].key, 
                    value: 0,
                    width: svgHeatMapItemWidth,
                    height: svgHeatMapItemHeight,
                    x: xpos,
                    y: ypos,
                });
            }
            currDate = d3.time.day.offset(new Date(currDate), size).toISOString().substring(0,10);
            xpos += stepX;
        }
        xpos = startX;
        ypos += stepY;
    }

    //console.log(data);
    return data;
}


function fillMonths(inputData, padding, cellSize) {
    //console.log(inputData);
    
    var totalSteps = moment(extentOfDays[1]).diff(extentOfDays[0],'months');
    var svgHeight = inputData.length*cellSize + padding*2;
    var svgWidth = totalSteps*cellSize + padding*2;

    var data = new Array();
    var xcount = totalSteps;
    var ycount = inputData.length;
    var svgHeatMapItemWidth = (svgWidth - padding*2) / xcount;
    var svgHeatMapItemHeight = (svgHeight - padding*2) / ycount;
    var startX = padding;
    var startY = (svgHeight-padding) / 2;
    var stepX = svgHeatMapItemWidth;
    var stepY = svgHeatMapItemHeight;
    var xpos = startX;
    var ypos = startY;
    var newValue = 0;
    var k = 0;

    for (var i = 0; i < ycount; i++)
    {
        data.push(new Array());
        var currDate = extentOfDays[0].substring(0,7) + "-01";
        k=0;
        for (var j = 0; j < xcount; j++)
        {
            if(k < inputData[i].values.length && inputData[i].values[k].key == currDate) {
                data[i].push({ 
                    time: inputData[i].values[k].key,
                    names: inputData[i].key, 
                    value: getChoice()(inputData[i].values[k]),
                    width: svgHeatMapItemWidth,
                    height: svgHeatMapItemHeight,
                    x: xpos,
                    y: ypos,
                });
                k++;
            } 
            else {
                data[i].push({ 
                    time: moment(currDate).add('months',1).toISOString().substring(0,10),
                    names: inputData[i].key, 
                    value: 0,
                    width: svgHeatMapItemWidth,
                    height: svgHeatMapItemHeight,
                    x: xpos,
                    y: ypos,
                });
            }
            currDate = moment(currDate).add('months',1).toISOString().substring(0,10);
            xpos += stepX;
        }
        xpos = startX;
        ypos += stepY;
    }

    //console.log(data);
    return data;
}

// Done
