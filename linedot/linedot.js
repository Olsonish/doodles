var servdata = {
    "data": [
        {
            "measureTimes": ["2014-06-18T19:02:33","2014-06-18T19:31:27","2014-06-18T19:35:26","2014-06-18T19:57:39","2014-06-18T22:33:29","2014-06-19T00:30:23","2014-06-19T02:05:03","2014-06-19T03:18:02","2014-06-19T04:11:48","2014-06-19T04:35:29","2014-06-19T06:20:45","2014-06-19T07:28:41","2014-06-19T09:00:22","2014-06-19T09:29:23","2014-06-19T10:17:29","2014-06-20T11:57:15","2014-06-20T12:02:34","2014-06-20T12:20:25","2014-06-20T13:40:42","2014-06-20T15:03:25","2014-06-20T15:19:31","2014-06-20T16:34:26","2014-06-20T19:20:52","2014-06-20T21:49:08","2014-06-20T21:59:20","2014-06-21T00:47:21","2014-06-21T01:47:45","2014-06-21T02:18:22","2014-06-21T04:50:31","2014-06-21T05:48:04","2014-06-21T05:49:50","2014-06-21T05:58:00","2014-06-21T07:34:15","2014-06-21T08:46:14","2014-06-21T12:32:51","2014-06-21T13:36:23","2014-06-21T15:54:31","2014-06-21T16:51:54","2014-06-21T17:34:57","2014-06-21T18:52:14","2014-06-21T19:38:18","2014-06-21T20:17:37","2014-06-21T20:29:40","2014-06-21T21:52:02","2014-06-21T23:19:02","2014-06-22T00:08:08","2014-06-22T01:48:20","2014-06-22T02:55:09","2014-06-22T02:57:19","2014-06-22T06:41:20","2014-06-22T06:50:28","2014-06-22T09:10:03","2014-06-22T10:41:39","2014-06-22T12:56:01","2014-06-22T13:34:36","2014-06-22T14:21:12","2014-06-22T15:08:55","2014-06-22T16:57:35","2014-06-22T18:21:49","2014-06-22T19:09:05","2014-06-23T15:06:08","2014-06-23T17:10:50","2014-06-23T17:20:42"],
            "sensorSources": [
                {
                    "sourceName": "bpSystolic",
                    "sourceUnits": "mmHg",
                    "indexes": [1,7,16,21,30,40,51,59,61],
                    "values": [null,111.511799381,null,null,null,null,null,null,null,null,null,null,null,null,null,null,117.652247362,null,null,null,null,117.421887077,null,null,null,null,null,null,null,null,123.212880357,null,null,null,null,null,null,null,null,null,122.854427991,null,null,null,null,null,null,null,null,null,null,118.69029247,null,null,null,null,null,null,null,117.381241228,null,null,null]
                }
            ]
        }
    ]
};

var datum = servdata.data[0];
var datasources = datum.sensorSources;
var measuretimes = datum.measureTimes;

var btnBackward = d3.select('#backward');
var btnForward = d3.select('#forward');
var btnReset = d3.select('#reset');

var config = {
    width: 900,
    height: 500,
    margin: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    }
};

var svg = d3.select('#svg').append('svg');
svg.attr('width', config.width)
    .attr('height', config.height);

// setup min maxes
var axismin, axismax, xmin, xmax;

xmin = new Date(d3.min(datum.measureTimes));
xmax = new Date(d3.max(datum.measureTimes));

var ymin = d3.min(datum.sensorSources[0].indexes, function(d) {
               return datum.sensorSources[0].values[d];
           });
var ymax = d3.max(datum.sensorSources[0].indexes, function(d) {
               return datum.sensorSources[0].values[d];
           });

// how much to shift time scale by
// 1 day shift is 24h * 60m * 60s * 1000 (milliseconds)
// or 1/4 shift is xmin minus xmax (milliseconds) / 4 
// var timeshift = 24 * 60 * 60 * 1000;
var timeshift = (xmax - xmin) / 4;

// for reuse
var vis = {
    height: config.height - (config.margin.top + config.margin.bottom),
    width: config.width - (config.margin.left + config.margin.right),
    xmin: +xmin,
    xmax: +xmax
};

// clip definitions
defs = svg.append("defs");

// clip area definition
defs.append("clipPath")
    .attr("id", "clipPath")
    .append("rect")
    .attr("width", vis.width)
    .attr("height", vis.height);

// some datum padding so max and min vals do not go to edge
// of axis domains (which are derived from value min and max)
var vpadding = 0.25;
var vsize = ymax - ymin;

// new realMin and realMax with a little padding
axismin = ymin;
axismax = ymax;
axismin = axismin - (vsize * vpadding);
axismax = axismax + (vsize * vpadding);

// setup scales
var xscale = d3.time.scale()
                .domain([vis.xmin, vis.xmax])
                .range([0, vis.width]);
var yscale = d3.scale.linear()
                .domain([axismin, axismax])
                .range([0, vis.height]);

// setup axis
var xaxis = d3.svg.axis().scale(xscale);
var yaxis = d3.svg.axis().scale(yscale);
yaxis.orient('left');
xaxis.orient('bottom');

// setup axis
var yaxisgroup = svg.append("svg:g").attr('class', 'y axis grid');
var xaxisgroup = svg.append("svg:g").attr('class', 'x axis grid');

// append axis
yaxisgroup.attr('transform',
    'translate(' + config.margin.left + ',' + config.margin.top + ')');
yaxisgroup.call(yaxis);
xaxisgroup.attr('transform', 
    'translate(' + config.margin.left + ',' + (config.margin.top + vis.height) + ')');
xaxisgroup.call(xaxis);

// graph group
var graph = svg.append('svg:g')
                .attr('class', 'graph')
                .attr('transform', 'translate(' +
                    config.margin.left + ',' + config.margin.top + ')')
                .attr("clip-path", "url(#clipPath)");

// draw a scatterplot
graph.append('svg:g').attr('class', 'scatter')
        .selectAll('circle')
        .data(datasources[0].indexes, getDVal)
        .enter()
        .append('circle')
            .attr('cx', getXPos)
            .attr('cy', getYPos)
            .attr('r', '4.5');

// draw line
var line = d3.svg.line()
                .defined(function(d) {
                    return datasources[0].values[d] !== null;
                })
                .x(getXPos)
                .y(getYPos);

graph.append('svg:g').attr('class', 'line')
        .append('svg:path')
            .attr('d', line(datasources[0].indexes, getDVal))
            .attr('class', 'path')
            .attr('stroke', 'black');

// behaviors
btnBackward.on('click', function() {

    vis.xmin = vis.xmin - timeshift;
    vis.xmax = vis.xmax - timeshift;

    // update x scale, x axis, and graph
    updateX(vis.xmin, vis.xmax);

});

btnForward.on('click', function() {

    vis.xmin = vis.xmin + timeshift;
    vis.xmax = vis.xmax + timeshift;
    
    // update x scale, x axis, and graph
    updateX(vis.xmin, vis.xmax);

});

btnReset.on('click', function() {

    vis.xmin = + xmin;
    vis.xmax = + xmax;

    // update x scale, x axis, and graph
    updateX(vis.xmin, vis.xmax);

});


// anons for d3
function getXPos(d) {
    return xscale(+ new Date(measuretimes[d]));
}
function getYPos(d) {
    return yscale(datasources[0].values[d]);
}
function getDVal(d) {
    return d;
}
function updateX(min,max) {

    // update scale
    xscale.domain([min, max]);

    // update affected axis
    svg.select('.x.axis')
            .transition()
            .duration(500)
            .call(xaxis);

    // update scatter
    graph.select('.scatter')
            .selectAll('circle')
            .transition()
            .duration(500)
            .ease('quad-in-out')
            .attr('cx', getXPos);

    // update line 
    var path = graph.select('.line').selectAll('path');

    // this method assumes no new data just a domain update refresh
    // for new data after attr d do enter append for new path parts
    path.transition()
        .duration(500)
        .ease('quad-in-out')
        .attr('d', line(datasources[0].indexes, getDVal));

}
