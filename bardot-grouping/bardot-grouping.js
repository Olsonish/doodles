// configs
var config = {
    datumresolution: null
};

// app and this as self to make later migration less painful
var app = {
        currentData: getOData() // use a copy of oData result
    },
    container = d3.select("#content");

// lets draw vis 1 only which may have more than one y axis
var chartDetails = app.currentData.visualizations[1];

// Setup margins then create the SVG
var margin = {
        top: 50,
        right: 40,
        bottom: 50,
        left: 40
    },

    // padding for later use
    vPadding = 0.05,

    // date format
    dateFormat = d3.time.format("%Y-%m-%d"),

    // set min and max dates
    minDate = new Date(app.currentData.startTime),
    maxDate = new Date(app.currentData.endTime),

    // svg base size
    svgWidth = 960,
    svgHeight = 500,
    chartWidth = svgWidth,
    chartHeight = (svgHeight - (margin.top + margin.bottom)),

    // visualization width will be svg width minus margins
    visWidth = svgWidth - margin.left - margin.right,

    // visualization height will be svg height minus margins
    visHeight = svgHeight - margin.top - margin.bottom,

    // create the svg
    svg = container.append("svg:svg")
              .attr("width", svgWidth)
              .attr("height", svgHeight);


// data didn't give us y1 and y2 range so make some up
var yRange = [
    {
        "upper": 140,
        "lower": 60
    },
    {
        "upper": 100,
        "lower": 0
    }
];

// setup y extents
var yAxisInfo = [];

for (var i = 0, len = chartDetails.yAxes.length; i < len; i++) {

    var data = app.currentData.data,
        axis = chartDetails.yAxes[i],
        axisData = {};

    axisData.min = data.cols[axis.dataPoint].min;
    axisData.max = data.cols[axis.dataPoint].max;

    var vSize = axisData.max - axisData.min;

    axisData.min = axisData.min - (vSize * vPadding);
    axisData.max = axisData.max + (vSize * vPadding);

    yAxisInfo.push(axisData);

}

// pad min and max date
console.log(minDate, maxDate);

// setup x scale
var xScale = d3.time.scale()
                    .domain([minDate, maxDate])
                    .range([0, visWidth]);

// setup y scales
var yScales = [];
for (var axisId = 0, len = chartDetails.yAxes.length; axisId < len; axisId++) {

    var data = app.currentData.data,
        dataPoint = chartDetails.yAxes[axisId].dataPoint
        col = data.cols[dataPoint];

    // this is using ranges
    var domain = [yRange[axisId]["lower"], yRange[axisId]["upper"]];


    var scale = d3.scale.linear()
                        .domain(domain)
                        .range([visHeight, 0]);

    yScales.push(scale);

}

// datapoints
var y1dataPoint = chartDetails.yAxes[0].dataPoint,
    y2dataPoint = chartDetails.yAxes[1].dataPoint;

// columns are streams
var stream1 = data.cols[y1dataPoint],
    stream2 = data.cols[y2dataPoint];

var curr_datum = stream1.index.filter(function(d, i) {
    return true;
});

console.log("stream1.index: ", stream1.index);
console.log("curr_datum: ", curr_datum);


// visualization translation
var visTranslation = margin.left + "," + margin.top;

// candlestick group
var csgroup = svg.append("svg:g")
                     .attr("class", "csgroup")
                     .attr("transform", "translate(" + visTranslation + ")");


// render x axis
renderXAxis(xScale);

// render y axes
for (var axisId = 0, len = chartDetails.yAxes.length; axisId < len; axisId++) {

    // function(scale, id)
    renderYAxis(yScales[axisId], axisId);

}

// render graph
updateGraph(stream1.index.filter(function(d, i) {
    return true;
}));






// xaxis render function
var xAxis,
    xAxisTranslation,
    xAxisGroup;

function renderXAxis(xScale) {

    // setup x axis
    xAxis = d3.svg.axis().scale(xScale)
                      .orient("bottom");

    // translation
    xAxisTranslation = margin.left + "," + (visHeight + margin.top);

    // append axis
    xAxisGroup = svg.append("svg:g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(" + xAxisTranslation + ")")
                        .call(xAxis)
                        .selectAll('text')
                            .attr('style', 'font-size:75%;');

}

// y axis render function
function renderYAxis(yScale, axisId) {

    // setup y axis
    var yAxis = d3.svg.axis().scale(yScale);

    // y1 axis goes left, y2 axis goes right
    if (axisId === 0) {

        var yAxisTranslation = margin.left + "," + margin.top;

        // y1 axis orientation
        yAxis = yAxis.orient('left');

        // y1 axis group
        var yAxisGroup = this.svg.append("svg:g")
                    .attr("class", "y axis axis-" + axisId)
                    .attr("transform", "translate(" + yAxisTranslation + ")")
                    .call(yAxis);

    } else {

        var yAxisTranslation = (margin.left + visWidth) + "," + margin.top;

        // y1 axis orientation
        yAxis = yAxis.orient('right');

        // y1 axis group
        var yAxisGroup = this.svg.append("svg:g")
                    .attr("class", "y axis axis-" + axisId)
                    .attr("transform", "translate(" + yAxisTranslation + ")")
                    .call(yAxis);

    }

}


/**
 * Controls
 */
var controls = container.append("div")
                        .attr("id", "controls");

/** Control Input : X Zoom */
input_datumxzoom = {
    el: controls.append("div").attr("class", "control datumxzoom")
};

input_datumxzoom.zoomin = input_datumxzoom.el
                                .append("button")
                                    .attr("id", "control-datumxzoom-in")
                                    .text("Zoom +");
input_datumxzoom.zoomout = input_datumxzoom.el
                                .append("button")
                                    .attr("id", "control-datumxzoom-out")
                                    .text("Zoom -");
input_datumxzoom.demoloop = input_datumxzoom.el
                                .append("button")
                                    .attr("id", "control-datumxzoom-demoloop")
                                    .text("Demo Loop");

input_datumxzoom.zoomin
    .on("click", function() {
        zoomXAxis("in");
    });
input_datumxzoom.zoomout
    .on("click", function() {
        zoomXAxis("out");
    });
input_datumxzoom.demoloop
    .on("click", function() {
        zoomInLoop();
        function zoomOutLoop() {
            // zoom out a few times
            var outtick = 0, outtickmax = 12;
            var outtimer = setInterval(function() {
                if (outtick === outtickmax) {
                    clearInterval(outtimer);
                    zoomInLoop();
                    return;
                }
                zoomXAxis("out", 2500);
                outtick++;
            }, 5000);
        }
        function zoomInLoop() {
            // zoom in slower a few times
            var intick = 0, intickmax = 12;
            var intimer = setInterval(function() {
                if (intick === intickmax) {
                    clearInterval(intimer);
                    zoomOutLoop();
                    return;
                }
                zoomXAxis("in", 125);
                intick++;
            }, 250);
        }

    });


/** Control Input : Resolution */
var input_datumresolution = {
    el: controls.append("div").attr("class", "control datumresolution")
};

input_datumresolution.label = input_datumresolution.el
                                .append("label")
                                    .attr("for", "control-datumresolution")
                                    .text("Resolution:");

input_datumresolution.field = input_datumresolution.el
                                .append("input")
                                    .attr("id", "control-datumresolution")
                                    .attr("name", "control-datumresolution");

input_datumresolution.units = input_datumresolution.el
                                .append("span")
                                    .text("%");

input_datumresolution.field
    .attr("type", "number")
    .property("min", 0)
    .property("max", 100)
    .property("value", function() {
        if (!config.datumresolution) {
            config.datumresolution = 100;
        }
        return config.datumresolution;
    });

input_datumresolution.field
    .on("change", function() {
        // apply data filters
        filterData();
        // update graph datumresolution
        updateGraph();
    });



/**
 * function for zooming the x axis in or out
 * @param  {string} zoomdir in or out
 */
function zoomXAxis(zoomdir, duration) {

    // default duration
    if (!duration) {
        duration = 500;
    }

    // list of measure times for getting date with datum index as reference
    var measureTime = app.currentData.data.measureTime;

    var curr_x_domain = xScale.domain();
    var curr_x_domain_min = curr_x_domain[0];
    var curr_x_domain_max = curr_x_domain[1];

    // 6 hours in milliseconds
    var x_zoom_stepsize = 24 * 60 * 60 * 1000;

    var new_x_domain_min, new_x_domain_max;

    if (zoomdir) {
        if (zoomdir === "in") {
            new_x_domain_min = +curr_x_domain[0] + x_zoom_stepsize;
            new_x_domain_max = +curr_x_domain[1] - x_zoom_stepsize;
        }
        if (zoomdir === "out") {
            new_x_domain_min = +curr_x_domain[0] - x_zoom_stepsize;
            new_x_domain_max = +curr_x_domain[1] + x_zoom_stepsize;
        }
    }

    // update domain
    xScale.domain([new_x_domain_min, new_x_domain_max]);

    // update xaxis
    svg.select('.x.axis')
            .transition()
            .duration(duration)
            .ease('quad-in-out')
            .call(this.xAxis);

    // elements
    var datagroups = csgroup.selectAll("g.stick");
    datagroups.each(function(d, i) {

        var self = d3.select(this);

        var dtime = measureTime[d];
        var dtobj = new Date(dtime);

        // el attribute functions
        var get_x = function() {
            return xScale(dtobj);
        }

        // y1 to y2 line
        var el_csbar = self.select(".stem")
                            .transition()
                            .duration(duration)
                            .ease('quad-in-out')
                            .attr("x1", get_x)
                            .attr("x2", get_x);

        var el_circles = self.selectAll("circle");
        el_circles.each(function() {
            var circle = d3.select(this);
            circle
                .transition()
                .duration(duration)
                .ease('quad-in-out')
                .attr("cx", get_x);
        });
    });

    // update graph datumresolution
    updateGraph();

}

function getBoundedResolutionValue(resvalue) {
    // if the datumresolution value is less than 0 assume its a bad value
    // and set to 0 (%)
    if (resvalue <= 0) {
        resvalue = 0;
    }
    // cap datumresolution at 100 (%)
    if (resvalue >= 100) {
        resvalue = 100;
    }
    // return boundaried value
    return resvalue;
}

function filterData() {
    
    // new resolution value (% zoom)
    var resvalue = getBoundedResolutionValue(this.value);

    // update the datumresolution input with the corrected datumresolution value
    input_datumresolution.field.property("value", resvalue);

    // update datumresolution config setting
    // config.datumresolution = resvalue;
    // var xres_extents = [0, parseInt(svg.attr("width"))];

    // new filtered data
    // display at random tick interval
    // var displayitem = randInt(1,7), displaytick = 0;
    // var data = stream1.index.filter(function(d, i) {
    //     if (displaytick === displayitem) {
    //         // console.log("displaying item: ", i);
    //         displaytick = 0;
    //         return true;
    //     }
    //     displaytick++;
    //     return false;
    // });
    // display % of datum items according to resolution setting
    // example: 10 items at 90% resolution = display 9 items
    // datum is the new data after filtering is applied
    // var displayitem = randInt(3,7), displaytick = 0;
    // var datum = stream1.index.filter(function(d, i) {
    //     if (displaytick === displayitem) {
    //         displaytick = 0;
    //         return true;
    //     }
    //     displaytick++;
    //     return false;
    // });
    
    curr_datum = stream1.index.filter(function(d, i) {
        return true;
    });

}

function updateGraph() {

    var datum = curr_datum;

    console.log("curr_datum: ", curr_datum);

    // candlesticks for each stream1 and stream2 paired data
    // candlestick item is a svg group element
    
    // element attributes
    var stroke_color = "rgba(0,0,0,.5)",
        stroke_color_over = "rgba(0,0,255,1)";
    var el_radius = 6;
    var el_strokewidth = 1.5;
    var el_strokewidth_over = 3;
    var el_width = (el_radius * 2) + (el_strokewidth * 2);

    // datum length
    var datumlen = datum.length;

    // list of measure times for getting date with datum index as reference
    var measureTime = app.currentData.data.measureTime;

    // grouped indexes
    var indexes_hasgrouped = [];
    var indexes_isgrouped = [];

    // using current scale functions check if next item will overlap and add
    // to group indexes when necessary
    for (var i = 0; i < datumlen; i++) {

        // console.log("i", i);
        // last grouped item index
        var last_hasgrouped_index = indexes_hasgrouped[indexes_hasgrouped.length - 1];

        // current item date and index
        var curr_dtime, curr_dtobj, curr_itemi;
        curr_itemi = i;
        curr_dtime = measureTime[datum[curr_itemi]];
        curr_dtobj = new Date(curr_dtime);

        // current element x
        var curr_el_x = xScale(curr_dtobj);

        // every element except the first one can look backward
        if (i >= 0) {

            // previous date and index
            var prev_dtime, prev_dtobj, prev_itemi = i - 1;
            prev_dtime = measureTime[datum[prev_itemi]];
            prev_dtobj = new Date(prev_dtime);
            // console.log("prev_itemi: ", prev_itemi);

            // last hasgrouped item date
            var last_hasgrouped_dtime, last_hasgrouped_dtobj;
            last_hasgrouped_dtime = measureTime[datum[last_hasgrouped_index]];
            last_hasgrouped_dtobj = new Date(last_hasgrouped_dtime);
            // console.log("last_hasgrouped_index: ", last_hasgrouped_index);
            
            // if the previous item is an isgrouped item 

            // if the previous item is an isgrouped then look at the previous
            // hasgrouped index to see if this group should also be grouped
            // with the previous hasgrouped index
            var last_grouped_el_gap, prev_el_gap;
            if (indexes_isgrouped.indexOf(prev_itemi) > -1) {

                // console.log("last_hasgrouped_index: ", last_hasgrouped_index);

                // last grouped item x
                var last_grouped_el_x = xScale(last_hasgrouped_dtobj);

                // last grouped element gap
                var last_grouped_el_gap = curr_el_x - last_grouped_el_x;

                // if the gap between the previous hasgroup element is less
                // than element width then the items would overlap
                if (last_grouped_el_gap < el_width) {

                    // console.log("index " + curr_itemi + " isgrouped");
                    indexes_isgrouped.push(curr_itemi);

                }

            }
            // previous item index was not an isgrouped index
            else {

                // prev element x
                var prev_el_x = xScale(prev_dtobj);

                // element x is at the center of the group
                // if the scaled distance from the center of the current group
                // is less than the element width then the two elements overlap
                // flag the current element as a grouped element
                var prev_el_gap = curr_el_x - prev_el_x;

                // if the gap between the previous item element is less
                // than element width then the items would overlap
                if (prev_el_gap < el_width) {

                    indexes_isgrouped.push(curr_itemi);
                    indexes_hasgrouped.push(prev_itemi);

                }

            }

        }

    }

    console.log("indexes_hasgrouped: ", indexes_hasgrouped);
    console.log("indexes_isgrouped: ", indexes_isgrouped);

    // data as datum data join with filter for grouping behavior
    var csitem = csgroup.selectAll("g.stick")
                        .data(datum, function(d) { return d; });

    // update
    // update old elements as needed
    csitem
        .classed("update", true);

    // enter
    // create new candlestick groups as needed
    // append additional elements through d, i to avoid element duplication
    csitem.enter()
        .append("svg:g")
            .classed("enter", function(d, i) {

                // group item is self
                var self = d3.select(this);

                // d is datum index
                var datumi = d;

                // i is item index
                var itemi = i;

                // stream datum values
                var stream1_value = stream1.values[d];
                var stream2_value = stream2.values[d];
                var stream1_dtime = measureTime[d];
                var stream1_dtobj = new Date(stream1_dtime);

                // el attribute functions
                var get_x = function() {
                    return xScale(stream1_dtobj);
                }

                // grouping
                // first item is never a grouped item
                self.isGrouped = false;

                // by default there are no other items grouped with this one
                self.hasGrouped = false;

                // presence of index in isgrouped indexes
                if (indexes_isgrouped.indexOf(i) > -1) {
                    // index is grouped
                    self.isGrouped = true;
                }
                // presence of index in isgrouped indexes
                if (indexes_hasgrouped.indexOf(i) > -1) {
                    // index is grouped
                    self.hasGrouped = true;
                }

                // if this is not a grouped item
                // render data item group elements
                //if (!self.isGrouped) {

                    // y1 to y2 line
                    el_csbar = self.append("svg:line").attr("class", "stem")
                                        .attr("stroke-width", el_strokewidth)
                                        .attr("x1", get_x)
                                        .attr("y1", getY1Coord)
                                        .attr("x2", get_x)
                                        .attr("y2", getY2Coord);

                    // y1 dot
                    self.append("svg:circle")
                            .attr("class", "dot ydot1")
                            .attr("cx", get_x)
                            .attr("cy", getY1Coord)
                            .attr("r", el_radius)
                            .attr("stroke-width", el_strokewidth);

                    // y2 dot 
                    self.append("svg:circle")
                            .attr("class", "dot ydot2")
                            .attr("cx", get_x)
                            .attr("cy", getY2Coord)
                            .attr("r", el_radius)
                            .attr("stroke-width", el_strokewidth);

                    // mouseover event
                    self.on("mouseover", function(d) {

                            console.log("self.isGrouped: ", self.isGrouped);
                            console.log("self.hasGrouped: ", self.hasGrouped);
                            console.log("d, i: ", d, i);

                            d3.select(this)
                                .selectAll("circle")
                                    .attr("stroke-width", el_strokewidth_over)
                                    .attr("stroke", stroke_color_over);
                            d3.select(this)
                                .selectAll("line")
                                    .attr("stroke-width", el_strokewidth_over)
                                    .attr("stroke", stroke_color_over);
                            d3.select(this)
                                .append("svg:title")
                                .text(function(d) {
                                    var min = d3.round(stream1.min),
                                        max = d3.round(stream1.max),
                                        stotal = stream1.total,
                                        slength = stream1.index.length,
                                        average = stotal / slength,
                                        average = d3.round(average);
                                    // y1 value
                                    var y1val = "y1: " + d3.round(stream1_value) + " ";
                                    // y2 value
                                    var y2val = " y2: " + d3.round(stream2_value);
                                    var label = y1val + "/" + y2val;
                                    label += " ( min: " + min;
                                    label += " | max: " + max;
                                    label += " | average: " + average + " )";
                                    return label;
                                });
                            })
                        .on("mouseout", function(d, i) {
                            d3.select(this)
                                .selectAll("circle")
                                    .attr("stroke-width", el_strokewidth)
                                    .attr("stroke", stroke_color);
                            d3.select(this)
                                .selectAll("line")
                                    .attr("stroke-width", el_strokewidth)
                                    .attr("stroke", stroke_color);
                    });

                // } 

                return true;
            });

    // enter + update
    // append things to enter selection expands the update selection
    // to include entering elements; so operations on the update selection
    // after appending to the enter selection will apply to both entering
    // and updating nodes
    csitem.classed("stick", function(d, i) {

        // console.log("d,i: ", d,i);

        // self reference for inline d3 functions
        var self = d3.select(this);

        // grouping
        // first item is never a grouped item
        self.isGrouped = false;

        // by default there are no other items grouped with this one
        self.hasGrouped = false;

        // presence of index in isgrouped indexes
        if (indexes_isgrouped.indexOf(i) > -1) {
            // index is grouped
            self.isGrouped = true;
        }
        // presence of index in isgrouped indexes
        if (indexes_hasgrouped.indexOf(i) > -1) {
            // index is grouped
            self.hasGrouped = true;
        }

        self.attr("opacity", 1);

        // y1 to y2 line
        var el_csbar = self.select(".stem");
        el_csbar
            .attr("stroke", stroke_color);

        // bardot or candlestick end point circles
        var el_circles = self.selectAll("circle");
        el_circles.each(function(d, i) {
            d3.select(this)
                .attr("fill", "white")
                .attr("stroke", stroke_color);
        });

        // this datapoint is determined to be grouped with
        // the previous element
        if (self.isGrouped) {
            // self.attr("opacity", 0.05);
            el_csbar
                .attr("stroke", "red");
            el_circles.each(function(d, i) {
                d3.select(this).attr("stroke", "red");
            });
        }

        // this datapoint is determined to have other data points
        // grouped with it
        if (self.hasGrouped) {
            el_csbar
                .attr("stroke", "blue");
            el_circles.each(function(d, i) {
                d3.select(this).attr("stroke", "blue");
            });
        }

        return true;
    });

    // exit
    // remove old elements as needed
    csitem.exit().remove();

}

/**
 * Useful Functions
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fixDate(date) {
    return new Date(date);
}

/**
 * For d3
 */
function dDate(d) {
    return d.date;
}
function dVal(d) {
    return d.value;
}
function fixDate(date) {
    return new Date(date);
}
function getDotRadius(d) {
    return 6;
}
function getY1Coord(d) {
    var y1Coord = yScales[0](stream1.values[d]);
    return y1Coord;
}
function getY2Coord(d) {
    var y2Coord = yScales[0](stream2.values[d]);
    return y2Coord;
}
function getXCoord(d) {
    var measureTime = data.measureTime[d];
    return xScale(fixDate(measureTime));
}

/**
 * Data
 */
function getOData() {

    var oData = {"jsonrpc": "2.0", "id": "d6cc12b6-e455-42ea-aba0-0af1396610b7", "result": {"visualizations": [{"sharedYAxis": null, "showStats": true, "complianceWorkflow": "satsWorkflow", "height": 520, "chartTitle": "Flow Rate (l/s)", "imageHTML": "<center></center><h3>Runtime: 0.002s (2ms)</h3><a href=\"/temp/6404bd7a-5c84-4d91-8aa0-8a16959ad935.RData\">R session data</a>", "yAxes": [{"dataPoint": "bpmon_pulseRate", "attrs": "path.style(\"stroke\", \"grey\");\ncircle.style(\"fill\",\"red\");\n\n", "label": "BP Monitor Pulse Rate (bpm)"}], "visualizationType": "jChartD3", "complianceData": {"endTime": "2014-02-18T17:18:38Z", "lineData": [{"endTime": "2014-01-21T04:24:32Z", "curState": null, "startTime": "2014-01-19T17:18:38Z"}, {"endTime": "2014-01-22T15:09:57Z", "curState": null, "startTime": "2014-01-21T04:24:32Z"}, {"endTime": "2014-01-24T09:22:14Z", "curState": null, "startTime": "2014-01-22T15:09:57Z"}, {"endTime": "2014-01-26T00:46:51Z", "curState": null, "startTime": "2014-01-24T09:22:14Z"}, {"endTime": "2014-01-28T06:36:05Z", "curState": null, "startTime": "2014-01-26T00:46:51Z"}, {"endTime": "2014-01-30T20:04:45Z", "curState": null, "startTime": "2014-01-28T06:36:05Z"}, {"endTime": "2014-01-31T22:02:26Z", "curState": null, "startTime": "2014-01-30T20:04:45Z"}, {"endTime": "2014-02-02T19:13:14Z", "curState": null, "startTime": "2014-01-31T22:02:26Z"}, {"endTime": "2014-02-04T22:37:44Z", "curState": null, "startTime": "2014-02-02T19:13:14Z"}, {"endTime": "2014-02-06T16:17:13Z", "curState": null, "startTime": "2014-02-04T22:37:44Z"}, {"endTime": "2014-02-07T11:21:44Z", "curState": null, "startTime": "2014-02-06T16:17:13Z"}, {"endTime": "2014-02-08T17:29:02Z", "curState": null, "startTime": "2014-02-07T11:21:44Z"}, {"endTime": "2014-02-10T23:00:46Z", "curState": null, "startTime": "2014-02-08T17:29:02Z"}, {"endTime": "2014-02-12T04:33:37Z", "curState": null, "startTime": "2014-02-10T23:00:46Z"}, {"endTime": "2014-02-14T09:00:36Z", "curState": null, "startTime": "2014-02-12T04:33:37Z"}, {"endTime": "2014-02-16T11:06:12Z", "curState": null, "startTime": "2014-02-14T09:00:36Z"}, {"endTime": "2014-02-18T17:18:38Z", "curState": null, "startTime": "2014-02-16T11:06:12Z"}], "startTime": "2014-01-19T17:18:38Z"}, "chartType": "d3Chart"}, {"sharedYAxis": true, "showStats": true, "complianceWorkflow": null, "height": 200, "chartTitle": "Pressure (Bottom and Tubing)", "imageHTML": "", "yAxes": [{"dataPoint": "bpSystolic", "attrs": "", "label": "Blood Pressure (Systolic) (mmHg)"}, {"dataPoint": "bpDiastolic", "attrs": "", "label": "Blood Pressure (Diastolic) (mmHg)"}], "visualizationType": "jChartD3", "complianceData": null, "chartType": "d3Chart"}, {"rPlotHeight": 400, "height": 400, "chartTitle": "Test Chart", "imageHTML": "<center><img src=\"/temp/b8cbfaa9-3452-450f-9e0d-e170112d12700001.svg\" width=\"400\" height=\"420\"></img></center><h3>Runtime: 1.254s (1254ms)</h3><a href=\"/temp/57dff0be-0eca-44d7-8824-be366c52532e.RData\">R session data</a>", "svgScaleFactor": 75, "visualizationType": "jChartR", "rPlotWidth": 400, "complianceData": null, "chartType": "rChart", "yAxes": []}], "endTime": "2014-02-18T17:18:38Z", "data": {"measureTime": ["2014-01-19T17:25:04Z", "2014-01-19T19:03:17Z", "2014-01-19T19:12:16Z", "2014-01-19T19:46:45Z", "2014-01-19T21:19:32Z", "2014-01-19T23:03:08Z", "2014-01-20T00:16:54Z", "2014-01-20T01:16:38Z", "2014-01-20T02:55:10Z", "2014-01-20T06:29:33Z", "2014-01-20T08:59:23Z", "2014-01-20T11:34:23Z", "2014-01-20T12:44:41Z", "2014-01-20T13:29:03Z", "2014-01-20T15:57:07Z", "2014-01-20T16:09:13Z", "2014-01-20T16:20:31Z", "2014-01-20T17:42:14Z", "2014-01-20T19:57:16Z", "2014-01-20T20:26:59Z", "2014-01-21T01:34:12Z", "2014-01-21T02:15:56Z", "2014-01-21T02:23:41Z", "2014-01-21T04:37:22Z", "2014-01-21T05:08:07Z", "2014-01-21T05:49:30Z", "2014-01-21T06:19:48Z", "2014-01-21T09:22:55Z", "2014-01-21T10:30:36Z", "2014-01-21T12:50:32Z", "2014-01-21T13:01:02Z", "2014-01-21T15:33:08Z", "2014-01-21T16:54:21Z", "2014-01-21T19:00:39Z", "2014-01-21T19:01:13Z", "2014-01-21T21:37:21Z", "2014-01-21T23:57:10Z", "2014-01-22T00:19:36Z", "2014-01-22T02:30:59Z", "2014-01-22T03:12:27Z", "2014-01-22T05:01:39Z", "2014-01-22T07:37:34Z", "2014-01-22T07:57:11Z", "2014-01-22T08:21:15Z", "2014-01-22T09:16:45Z", "2014-01-22T12:00:28Z", "2014-01-22T12:55:25Z", "2014-01-22T16:35:38Z", "2014-01-22T16:56:53Z", "2014-01-22T18:53:47Z", "2014-01-22T19:52:15Z", "2014-01-22T21:55:11Z", "2014-01-22T23:30:21Z", "2014-01-23T00:25:11Z", "2014-01-23T02:44:36Z", "2014-01-23T03:34:39Z", "2014-01-23T03:50:53Z", "2014-01-23T05:51:06Z", "2014-01-23T09:51:18Z", "2014-01-23T10:40:47Z", "2014-01-23T11:08:22Z", "2014-01-23T12:00:35Z", "2014-01-23T14:38:19Z", "2014-01-23T15:12:03Z", "2014-01-23T18:58:37Z", "2014-01-23T20:46:54Z", "2014-01-23T21:54:21Z", "2014-01-23T22:01:46Z", "2014-01-23T22:06:55Z", "2014-01-23T23:26:09Z", "2014-01-24T00:08:42Z", "2014-01-24T04:07:30Z", "2014-01-24T04:35:36Z", "2014-01-24T06:00:10Z", "2014-01-24T08:49:01Z", "2014-01-24T09:17:37Z", "2014-01-24T10:50:27Z", "2014-01-24T12:24:02Z", "2014-01-24T16:38:20Z", "2014-01-24T16:40:05Z", "2014-01-24T18:47:24Z", "2014-01-24T21:18:02Z", "2014-01-24T21:39:11Z", "2014-01-24T23:09:50Z", "2014-01-24T23:35:47Z", "2014-01-25T00:46:18Z", "2014-01-25T02:30:25Z", "2014-01-25T06:13:52Z", "2014-01-25T06:26:24Z", "2014-01-25T07:07:33Z", "2014-01-25T09:10:45Z", "2014-01-25T10:18:26Z", "2014-01-25T10:41:41Z", "2014-01-25T13:59:00Z", "2014-01-25T14:25:54Z", "2014-01-25T18:34:13Z", "2014-01-25T20:05:20Z", "2014-01-25T20:06:39Z", "2014-01-25T21:06:56Z", "2014-01-25T23:47:28Z", "2014-01-26T01:04:10Z", "2014-01-26T02:12:44Z", "2014-01-26T04:34:42Z", "2014-01-26T05:16:49Z", "2014-01-26T06:16:50Z", "2014-01-26T07:37:35Z", "2014-01-26T07:57:17Z", "2014-01-26T09:07:43Z", "2014-01-26T10:46:33Z", "2014-01-26T13:20:18Z", "2014-01-26T14:02:04Z", "2014-01-26T17:25:06Z", "2014-01-26T17:26:14Z", "2014-01-26T17:29:59Z", "2014-01-26T19:32:45Z", "2014-01-26T21:30:55Z", "2014-01-26T23:03:15Z", "2014-01-26T23:41:32Z", "2014-01-27T00:19:16Z", "2014-01-27T02:06:06Z", "2014-01-27T02:30:09Z", "2014-01-27T05:03:29Z", "2014-01-27T06:26:13Z", "2014-01-27T07:57:06Z", "2014-01-27T08:05:59Z", "2014-01-27T11:23:19Z", "2014-01-27T12:29:27Z", "2014-01-27T12:45:29Z", "2014-01-27T13:11:08Z", "2014-01-27T13:27:52Z", "2014-01-27T17:41:19Z", "2014-01-27T18:00:41Z", "2014-01-27T18:46:05Z", "2014-01-27T21:05:24Z", "2014-01-28T00:03:38Z", "2014-01-28T00:50:36Z", "2014-01-28T01:22:24Z", "2014-01-28T03:12:46Z", "2014-01-28T07:23:02Z", "2014-01-28T08:20:47Z", "2014-01-28T09:50:46Z", "2014-01-28T10:11:02Z", "2014-01-28T12:44:08Z", "2014-01-28T15:04:32Z", "2014-01-28T16:15:35Z", "2014-01-28T17:52:35Z", "2014-01-28T19:55:31Z", "2014-01-28T20:39:12Z", "2014-01-28T21:23:34Z", "2014-01-28T22:33:27Z", "2014-01-29T00:41:07Z", "2014-01-29T01:17:26Z", "2014-01-29T02:39:52Z", "2014-01-29T04:52:27Z", "2014-01-29T06:49:38Z", "2014-01-29T06:51:50Z", "2014-01-29T13:51:49Z", "2014-01-29T14:38:18Z", "2014-01-29T15:00:01Z", "2014-01-29T15:07:01Z", "2014-01-29T17:47:25Z", "2014-01-29T18:49:03Z", "2014-01-29T19:24:46Z", "2014-01-29T20:48:53Z", "2014-01-29T21:47:27Z", "2014-01-30T00:12:06Z", "2014-01-30T02:06:32Z", "2014-01-30T03:09:31Z", "2014-01-30T03:23:19Z", "2014-01-30T04:22:46Z", "2014-01-30T05:30:07Z", "2014-01-30T06:46:47Z", "2014-01-30T09:26:09Z", "2014-01-30T13:21:52Z", "2014-01-30T14:10:52Z", "2014-01-30T14:42:02Z", "2014-01-30T15:24:32Z", "2014-01-30T17:43:51Z", "2014-01-30T18:20:18Z", "2014-01-30T21:22:41Z", "2014-01-30T21:51:57Z", "2014-01-30T23:15:01Z", "2014-01-31T02:17:16Z", "2014-01-31T03:09:33Z", "2014-01-31T07:30:59Z", "2014-01-31T07:33:38Z", "2014-01-31T09:57:16Z", "2014-01-31T10:23:26Z", "2014-01-31T11:51:50Z", "2014-01-31T12:39:34Z", "2014-01-31T13:39:05Z", "2014-01-31T15:44:54Z", "2014-01-31T15:51:47Z", "2014-01-31T19:35:35Z", "2014-01-31T21:32:14Z", "2014-01-31T23:01:36Z", "2014-01-31T23:08:59Z", "2014-01-31T23:22:48Z", "2014-01-31T23:58:55Z", "2014-02-01T03:31:26Z", "2014-02-01T06:28:22Z", "2014-02-01T07:04:00Z", "2014-02-01T07:16:14Z", "2014-02-01T07:39:27Z", "2014-02-01T09:31:50Z", "2014-02-01T12:36:32Z", "2014-02-01T12:50:51Z", "2014-02-01T13:33:37Z", "2014-02-01T16:06:55Z", "2014-02-01T20:04:35Z", "2014-02-01T20:05:12Z", "2014-02-01T20:41:18Z", "2014-02-01T22:01:08Z", "2014-02-01T22:10:54Z", "2014-02-01T23:39:32Z", "2014-02-02T00:13:03Z", "2014-02-02T03:06:23Z", "2014-02-02T03:40:56Z", "2014-02-02T05:44:42Z", "2014-02-02T06:26:01Z", "2014-02-02T07:11:46Z", "2014-02-02T08:25:05Z", "2014-02-02T09:55:22Z", "2014-02-02T12:32:01Z", "2014-02-02T13:05:27Z", "2014-02-02T13:27:01Z", "2014-02-02T14:56:11Z", "2014-02-02T17:14:41Z", "2014-02-02T18:35:26Z", "2014-02-02T19:33:11Z", "2014-02-02T19:41:17Z", "2014-02-02T23:04:07Z", "2014-02-02T23:35:13Z", "2014-02-02T23:48:48Z", "2014-02-03T04:49:17Z", "2014-02-03T05:20:38Z", "2014-02-03T06:54:16Z", "2014-02-03T08:17:14Z", "2014-02-03T08:54:44Z", "2014-02-03T11:19:41Z", "2014-02-03T12:08:45Z", "2014-02-03T17:24:02Z", "2014-02-03T17:35:03Z", "2014-02-03T17:58:47Z", "2014-02-03T18:11:08Z", "2014-02-03T20:28:10Z", "2014-02-03T21:43:53Z", "2014-02-03T23:43:20Z", "2014-02-04T03:07:56Z", "2014-02-04T03:17:48Z", "2014-02-04T03:36:06Z", "2014-02-04T07:09:04Z", "2014-02-04T07:28:27Z", "2014-02-04T07:31:56Z", "2014-02-04T08:59:45Z", "2014-02-04T12:42:17Z", "2014-02-04T13:54:48Z", "2014-02-04T14:56:03Z", "2014-02-04T15:22:04Z", "2014-02-04T15:56:30Z", "2014-02-04T18:52:41Z", "2014-02-04T20:58:14Z", "2014-02-04T22:05:15Z", "2014-02-04T22:39:42Z", "2014-02-05T00:23:17Z", "2014-02-05T00:54:59Z", "2014-02-05T03:58:07Z", "2014-02-05T07:00:17Z", "2014-02-05T08:15:11Z", "2014-02-05T10:24:49Z", "2014-02-05T10:44:16Z", "2014-02-05T10:54:43Z", "2014-02-05T12:19:38Z", "2014-02-05T14:25:53Z", "2014-02-05T15:40:56Z", "2014-02-05T16:19:19Z", "2014-02-05T17:01:23Z", "2014-02-05T17:59:59Z", "2014-02-05T19:09:46Z", "2014-02-05T20:10:01Z", "2014-02-05T20:20:21Z", "2014-02-05T22:13:02Z", "2014-02-05T23:43:09Z", "2014-02-06T05:21:49Z", "2014-02-06T06:37:52Z", "2014-02-06T08:17:07Z", "2014-02-06T10:00:14Z", "2014-02-06T10:18:04Z", "2014-02-06T10:21:19Z", "2014-02-06T12:32:59Z", "2014-02-06T12:38:42Z", "2014-02-06T13:36:30Z", "2014-02-06T16:39:01Z", "2014-02-06T18:13:32Z", "2014-02-06T18:43:47Z", "2014-02-06T18:50:53Z", "2014-02-06T22:50:07Z", "2014-02-07T00:50:47Z", "2014-02-07T02:44:03Z", "2014-02-07T05:53:01Z", "2014-02-07T05:56:26Z", "2014-02-07T06:05:39Z", "2014-02-07T06:53:56Z", "2014-02-07T10:06:30Z", "2014-02-07T11:43:09Z", "2014-02-07T11:52:39Z", "2014-02-07T12:26:29Z", "2014-02-07T13:11:41Z", "2014-02-07T15:26:07Z", "2014-02-07T15:58:02Z", "2014-02-07T16:48:00Z", "2014-02-07T23:15:59Z", "2014-02-08T00:22:53Z", "2014-02-08T00:37:37Z", "2014-02-08T01:57:00Z", "2014-02-08T02:09:52Z", "2014-02-08T03:04:27Z", "2014-02-08T06:40:45Z", "2014-02-08T07:20:24Z", "2014-02-08T07:25:27Z", "2014-02-08T10:00:05Z", "2014-02-08T11:15:19Z", "2014-02-08T13:28:54Z", "2014-02-08T13:41:24Z", "2014-02-08T14:41:55Z", "2014-02-08T15:25:45Z", "2014-02-08T15:40:05Z", "2014-02-08T18:22:00Z", "2014-02-08T18:53:44Z", "2014-02-08T19:27:19Z", "2014-02-08T21:43:26Z", "2014-02-08T23:35:07Z", "2014-02-09T00:42:33Z", "2014-02-09T02:06:55Z", "2014-02-09T02:30:33Z", "2014-02-09T02:40:30Z", "2014-02-09T05:09:24Z", "2014-02-09T06:40:12Z", "2014-02-09T08:22:42Z", "2014-02-09T08:40:07Z", "2014-02-09T09:01:18Z", "2014-02-09T11:38:56Z", "2014-02-09T12:35:41Z", "2014-02-09T17:38:01Z", "2014-02-09T17:42:45Z", "2014-02-09T17:52:29Z", "2014-02-09T19:29:47Z", "2014-02-09T19:48:49Z", "2014-02-09T20:06:25Z", "2014-02-09T22:26:45Z", "2014-02-10T01:54:21Z", "2014-02-10T05:16:56Z", "2014-02-10T07:13:04Z", "2014-02-10T08:33:53Z", "2014-02-10T08:44:40Z", "2014-02-10T09:33:43Z", "2014-02-10T10:49:28Z", "2014-02-10T10:55:59Z", "2014-02-10T13:14:52Z", "2014-02-10T15:03:21Z", "2014-02-10T17:30:18Z", "2014-02-10T18:31:45Z", "2014-02-10T20:29:34Z", "2014-02-10T21:28:23Z", "2014-02-10T21:42:13Z", "2014-02-10T21:54:53Z", "2014-02-10T23:12:54Z", "2014-02-10T23:21:00Z", "2014-02-10T23:32:36Z", "2014-02-11T04:22:47Z", "2014-02-11T08:03:14Z", "2014-02-11T08:06:45Z", "2014-02-11T08:45:32Z", "2014-02-11T08:56:33Z", "2014-02-11T09:14:19Z", "2014-02-11T09:14:29Z", "2014-02-11T12:18:26Z", "2014-02-11T16:22:40Z", "2014-02-11T16:29:59Z", "2014-02-11T17:41:19Z", "2014-02-11T19:58:55Z", "2014-02-11T21:48:53Z", "2014-02-11T22:48:37Z", "2014-02-12T01:12:46Z", "2014-02-12T02:02:21Z", "2014-02-12T02:10:35Z", "2014-02-12T03:47:50Z", "2014-02-12T04:27:57Z", "2014-02-12T04:58:41Z", "2014-02-12T06:55:15Z", "2014-02-12T10:17:38Z", "2014-02-12T11:39:30Z", "2014-02-12T15:28:39Z", "2014-02-12T15:44:09Z", "2014-02-12T16:13:10Z", "2014-02-12T16:43:38Z", "2014-02-12T18:31:23Z", "2014-02-12T21:31:03Z", "2014-02-12T21:41:20Z", "2014-02-12T21:42:23Z", "2014-02-13T00:41:46Z", "2014-02-13T02:14:30Z", "2014-02-13T03:06:31Z", "2014-02-13T06:03:20Z", "2014-02-13T06:33:03Z", "2014-02-13T09:17:23Z", "2014-02-13T10:16:36Z", "2014-02-13T10:51:52Z", "2014-02-13T11:01:38Z", "2014-02-13T11:29:31Z", "2014-02-13T13:17:02Z", "2014-02-13T15:53:33Z", "2014-02-13T17:26:11Z", "2014-02-13T19:13:27Z", "2014-02-13T19:36:58Z", "2014-02-13T20:15:25Z", "2014-02-13T20:40:17Z", "2014-02-13T23:00:35Z", "2014-02-14T00:25:07Z", "2014-02-14T00:56:45Z", "2014-02-14T01:51:42Z", "2014-02-14T05:05:34Z", "2014-02-14T06:36:31Z", "2014-02-14T06:54:42Z", "2014-02-14T09:13:09Z", "2014-02-14T09:54:03Z", "2014-02-14T09:57:39Z", "2014-02-14T10:06:00Z", "2014-02-14T10:55:31Z", "2014-02-14T11:10:52Z", "2014-02-14T12:02:17Z", "2014-02-14T14:10:27Z", "2014-02-14T18:15:56Z", "2014-02-14T18:20:03Z", "2014-02-14T18:27:22Z", "2014-02-14T18:45:37Z", "2014-02-14T18:59:51Z", "2014-02-14T19:28:25Z", "2014-02-14T23:49:37Z", "2014-02-15T00:45:24Z", "2014-02-15T01:11:49Z", "2014-02-15T05:36:51Z", "2014-02-15T07:37:39Z", "2014-02-15T07:56:35Z", "2014-02-15T08:18:14Z", "2014-02-15T08:56:16Z", "2014-02-15T11:05:49Z", "2014-02-15T12:01:58Z", "2014-02-15T12:32:33Z", "2014-02-15T13:22:11Z", "2014-02-15T17:15:59Z", "2014-02-15T18:05:46Z", "2014-02-15T18:26:42Z", "2014-02-15T21:09:03Z", "2014-02-15T21:50:20Z", "2014-02-15T21:53:18Z", "2014-02-16T01:50:18Z", "2014-02-16T04:53:39Z", "2014-02-16T05:52:52Z", "2014-02-16T06:27:39Z", "2014-02-16T08:42:12Z", "2014-02-16T10:55:29Z", "2014-02-16T11:48:13Z", "2014-02-16T12:21:29Z", "2014-02-16T15:19:55Z", "2014-02-16T15:38:55Z", "2014-02-16T15:51:47Z", "2014-02-16T17:49:43Z", "2014-02-16T18:53:24Z", "2014-02-16T21:43:53Z", "2014-02-17T01:22:40Z", "2014-02-17T01:49:32Z", "2014-02-17T03:36:50Z", "2014-02-17T03:56:36Z", "2014-02-17T05:16:21Z", "2014-02-17T06:34:30Z", "2014-02-17T11:29:24Z", "2014-02-17T12:28:12Z", "2014-02-17T12:44:58Z", "2014-02-17T14:33:25Z"], "cols": {"obs_breathing": {"index": [2, 6, 13, 18, 26, 31, 36, 40, 46, 54, 63, 66, 72, 79, 88, 94, 98, 104, 110, 111, 115, 119, 123, 129, 136, 139, 144, 151, 159, 166, 171, 174, 178, 185, 190, 198, 201, 211, 217, 225, 230, 231, 241, 247, 249, 254, 259, 264, 267, 272, 275, 283, 288, 294, 301, 306, 313, 321, 327, 333, 342, 344, 349, 351, 356, 368, 374, 377, 383, 388, 392, 402, 405, 414, 423, 427, 431, 434, 440, 448, 455, 459, 465, 476], "min": 1.0, "max": 10.0, "values": [null, null, 7.0, null, null, null, 7.0, null, null, null, null, null, null, 1.0, null, null, null, null, 5.0, null, null, null, null, null, null, null, 10.0, null, null, null, null, 6.0, null, null, null, null, 10.0, null, null, null, 4.0, null, null, null, null, null, 2.0, null, null, null, null, null, null, null, 8.0, null, null, null, null, null, null, null, null, 3.0, null, null, 4.0, null, null, null, null, null, 4.0, null, null, null, null, null, null, 9.0, null, null, null, null, null, null, null, null, 4.0, null, null, null, null, null, 2.0, null, null, null, 9.0, null, null, null, null, null, 8.0, null, null, null, null, null, 1.0, 6.0, null, null, null, 10.0, null, null, null, 7.0, null, null, null, 10.0, null, null, null, null, null, 6.0, null, null, null, null, null, null, 6.0, null, null, 5.0, null, null, null, null, 6.0, null, null, null, null, null, null, 9.0, null, null, null, null, null, null, null, 4.0, null, null, null, null, null, null, 6.0, null, null, null, null, 9.0, null, null, 4.0, null, null, null, 2.0, null, null, null, null, null, null, 8.0, null, null, null, null, 9.0, null, null, null, null, null, null, null, 9.0, null, null, 8.0, null, null, null, null, null, null, null, null, null, 1.0, null, null, null, null, null, 10.0, null, null, null, null, null, null, null, 2.0, null, null, null, null, 8.0, 9.0, null, null, null, null, null, null, null, null, null, 8.0, null, null, null, null, null, 9.0, null, 1.0, null, null, null, null, 7.0, null, null, null, null, 10.0, null, null, null, null, 9.0, null, null, 7.0, null, null, null, null, 3.0, null, null, 2.0, null, null, null, null, null, null, null, 9.0, null, null, null, null, 3.0, null, null, null, null, null, 2.0, null, null, null, null, null, null, 4.0, null, null, null, null, 7.0, null, null, null, null, null, null, 9.0, null, null, null, null, null, null, null, 2.0, null, null, null, null, null, 10.0, null, null, null, null, null, 2.0, null, null, null, null, null, null, null, null, 2.0, null, 9.0, null, null, null, null, 4.0, null, 10.0, null, null, null, null, 4.0, null, null, null, null, null, null, null, null, null, null, null, 3.0, null, null, null, null, null, 2.0, null, null, 9.0, null, null, null, null, null, 8.0, null, null, null, null, 1.0, null, null, null, 3.0, null, null, null, null, null, null, null, null, null, 7.0, null, null, 7.0, null, null, null, null, null, null, null, null, 4.0, null, null, null, null, null, null, null, null, 9.0, null, null, null, 9.0, null, null, null, 6.0, null, null, 8.0, null, null, null, null, null, 4.0, null, null, null, null, null, null, null, 2.0, null, null, null, null, null, null, 6.0, null, null, null, 7.0, null, null, null, null, null, 4.0, null, null, null, null, null, null, null, null, null, null, 6.0, null, null, null], "dataTypeId": "obs_breathing", "total": 496.0}, "bpSystolic": {"index": [5, 12, 19, 24, 33, 43, 51, 56, 60, 68, 76, 80, 82, 87, 95, 102, 109, 112, 121, 126, 135, 141, 147, 150, 153, 158, 163, 172, 175, 183, 192, 196, 202, 209, 215, 218, 224, 227, 233, 238, 245, 248, 253, 261, 268, 273, 280, 284, 290, 296, 302, 303, 307, 311, 317, 325, 329, 340, 348, 352, 360, 366, 373, 385, 390, 396, 399, 411, 421, 428, 435, 442, 446, 450, 458, 468, 472, 475], "min": 115.082856788, "max": 126.660263341, "values": [null, null, null, null, null, 116.235824162, null, null, null, null, null, null, 118.341552844, null, null, null, null, null, null, 119.228947804, null, null, null, null, 121.858214182, null, null, null, null, null, null, null, null, 121.764258189, null, null, null, null, null, null, null, null, null, 120.820033748, null, null, null, null, null, null, null, 121.639113279, null, null, null, null, 122.518419342, null, null, null, 124.045921829, null, null, null, null, null, null, null, 121.155184334, null, null, null, null, null, null, null, 119.86723779, null, null, null, 119.815136555, null, 122.853882431, null, null, null, null, 122.050112766, null, null, null, null, null, null, null, 123.656775995, null, null, null, null, null, null, 122.266630843, null, null, null, null, null, null, 120.189772644, null, null, 120.283133284, null, null, null, null, null, null, null, null, 119.976478029, null, null, null, null, 122.505201925, null, null, null, null, null, null, null, null, 120.910423691, null, null, null, null, null, 118.465962273, null, null, null, null, null, 120.345859328, null, null, 122.177380282, null, null, 121.178816254, null, null, null, null, 123.720854658, null, null, null, null, 120.730793751, null, null, null, null, null, null, null, null, 121.807809136, null, null, 121.204191339, null, null, null, null, null, null, null, 120.164769424, null, null, null, null, null, null, null, null, 117.475627762, null, null, null, 119.323284634, null, null, null, null, null, 121.115211631, null, null, null, null, null, null, 119.393648597, null, null, null, null, null, 122.113298837, null, null, 120.20505671, null, null, null, null, null, 119.365190597, null, null, 116.445355924, null, null, null, null, null, 115.082856788, null, null, null, null, 120.250319956, null, null, null, null, null, null, 121.093466149, null, null, 120.301422213, null, null, null, null, 120.244913103, null, null, null, null, null, null, null, 120.005944138, null, null, null, null, null, null, 120.360332845, null, null, null, null, 121.615267501, null, null, null, null, null, null, 122.048982842, null, null, null, 119.045569205, null, null, null, null, null, 117.720089729, null, null, null, null, null, 117.539353039, null, null, null, null, null, 118.95792665, 121.223068964, null, null, null, 118.843291469, null, null, null, 118.554604049, null, null, null, null, null, 120.480949785, null, null, null, null, null, null, null, 118.561684963, null, null, null, 120.383110121, null, null, null, null, null, null, null, null, null, null, 119.898777027, null, null, null, null, null, null, null, 120.272932747, null, null, null, 122.84673411, null, null, null, null, null, null, null, 123.753098023, null, null, null, null, null, 123.439314126, null, null, null, null, null, null, 123.139346181, null, null, null, null, null, null, null, null, null, null, null, 121.204362053, null, null, null, null, 120.477382042, null, null, null, null, null, 119.818346318, null, null, 118.674308621, null, null, null, null, null, null, null, null, null, null, null, 124.590361478, null, null, null, null, null, null, null, null, null, 123.792079696, null, null, null, null, null, null, 122.908372236, null, null, null, null, null, null, 124.517600846, null, null, null, null, null, null, 122.445534275, null, null, null, 120.858160715, null, null, null, 123.380416307, null, null, null, null, null, null, null, 124.84035125, null, null, null, null, null, null, null, null, null, 124.088675468, null, null, null, 126.660263341, null, null, 125.960517693, null, null, null, null], "dataTypeId": "bpSystolic", "total": 9437.09545487}, "sats": {"index": [1, 9, 17, 20, 28, 37, 44, 47, 55, 62, 64, 69, 73, 75, 83, 90, 93, 100, 106, 113, 116, 122, 131, 137, 143, 149, 155, 156, 160, 168, 173, 181, 186, 191, 193, 199, 203, 205, 212, 216, 221, 229, 235, 244, 252, 258, 260, 269, 277, 282, 289, 297, 305, 312, 320, 324, 328, 336, 345, 357, 364, 372, 379, 389, 395, 400, 404, 409, 417, 426, 436, 438, 444, 453, 460, 462, 467, 473, 478], "min": 88.0, "max": 100.0, "values": [null, 99.0, null, null, null, null, null, null, null, 95.0, null, null, null, null, null, null, null, 95.0, null, null, 95.0, null, null, null, null, null, null, null, 95.0, null, null, null, null, null, null, null, null, 95.0, null, null, null, null, null, null, 96.0, null, null, 97.0, null, null, null, null, null, null, null, 98.0, null, null, null, null, null, null, 97.0, null, 99.0, null, null, null, null, 100.0, null, null, null, 100.0, null, 100.0, null, null, null, null, null, null, null, 100.0, null, null, null, null, null, null, 100.0, null, null, 100.0, null, null, null, null, null, null, 100.0, null, null, null, null, null, 99.0, null, null, null, null, null, null, 99.0, null, null, 99.0, null, null, null, null, null, 98.0, null, null, null, null, null, null, null, null, 100.0, null, null, null, null, null, 100.0, null, null, null, null, null, 100.0, null, null, null, null, null, 100.0, null, null, null, null, null, 100.0, 100.0, null, null, null, 100.0, null, null, null, null, null, null, null, 100.0, null, null, null, null, 100.0, null, null, null, null, null, null, null, 99.0, null, null, null, null, 98.0, null, null, null, null, 98.0, null, 97.0, null, null, null, null, null, 96.0, null, null, null, 95.0, null, 94.0, null, null, null, null, null, null, 94.0, null, null, null, 94.0, null, null, null, null, 93.0, null, null, null, null, null, null, null, 92.0, null, null, null, null, null, 92.0, null, null, null, null, null, null, null, null, 91.0, null, null, null, null, null, null, null, 91.0, null, null, null, null, null, 91.0, null, 91.0, null, null, null, null, null, null, null, null, 91.0, null, null, null, null, null, null, null, 91.0, null, null, null, null, 91.0, null, null, null, null, null, null, 91.0, null, null, null, null, null, null, null, 90.0, null, null, null, null, null, null, null, 88.0, null, null, null, null, null, null, 88.0, null, null, null, null, null, null, null, 88.0, null, null, null, 88.0, null, null, null, 88.0, null, null, null, null, null, null, null, 90.0, null, null, null, null, null, null, null, null, 90.0, null, null, null, null, null, null, null, null, null, null, null, 91.0, null, null, null, null, null, null, 91.0, null, null, null, null, null, null, null, 92.0, null, null, null, null, null, null, 91.0, null, null, null, null, null, null, null, null, null, 91.0, null, null, null, null, null, 91.0, null, null, null, null, 90.0, null, null, null, 90.0, null, null, null, null, 89.0, null, null, null, null, null, null, null, 89.0, null, null, null, null, null, null, null, null, 91.0, null, null, null, null, null, null, null, null, null, 92.0, null, 94.0, null, null, null, null, null, 94.0, null, null, null, null, null, null, null, null, 94.0, null, null, null, null, null, null, 93.0, null, 93.0, null, null, null, null, 93.0, null, null, null, null, null, 93.0, null, null, null, null, 93.0, null], "dataTypeId": "sats", "total": 7471.0}, "weight": {"index": [3, 7, 11, 14, 23, 29, 35, 42, 50, 57, 59, 67, 78, 85, 92, 97, 107, 118, 127, 130, 138, 145, 154, 162, 169, 176, 182, 189, 195, 200, 210, 219, 226, 234, 240, 246, 256, 262, 270, 276, 281, 287, 292, 300, 304, 310, 314, 318, 326, 330, 332, 339, 341, 347, 353, 358, 365, 371, 380, 387, 394, 398, 403, 406, 412, 415, 419, 429, 437, 445, 451, 457, 466, 474], "min": 96.751130079, "max": 103.094000534, "values": [null, null, null, 100.700488036, null, null, null, 101.525881218, null, null, null, 100.547452272, null, null, 99.6289182229, null, null, null, null, null, null, null, null, 98.6392834222, null, null, null, null, null, 99.898766399, null, null, null, null, null, 101.238429521, null, null, null, null, null, null, 100.75735729, null, null, null, null, null, null, null, 99.2033191612, null, null, null, null, null, null, 98.9415962535, null, 100.422178338, null, null, null, null, null, null, null, 101.977563526, null, null, null, null, null, null, null, null, null, null, 99.7165872735, null, null, null, null, null, null, 101.056943998, null, null, null, null, null, null, 101.807551784, null, null, null, null, 101.638994875, null, null, null, null, null, null, null, null, null, 99.090749485, null, null, null, null, null, null, null, null, null, null, 99.3329003223, null, null, null, null, null, null, null, null, 101.406801847, null, null, 100.02169017, null, null, null, null, null, null, null, 99.9041349284, null, null, null, null, null, null, 98.1645918227, null, null, null, null, null, null, null, null, 99.0940049177, null, null, null, null, null, null, null, 99.4858458024, null, null, null, null, null, null, 100.163424699, null, null, null, null, null, null, 98.5248950208, null, null, null, null, null, 99.5045271062, null, null, null, null, null, null, 99.9460985203, null, null, null, null, null, 101.018561829, null, null, null, null, 100.581742772, null, null, null, null, null, null, null, null, null, 98.8943783194, null, null, null, null, null, null, null, null, 98.5583318041, null, null, null, null, null, null, 97.5900575265, null, null, null, null, null, null, null, 99.9203242981, null, null, null, null, null, 100.978173774, null, null, null, null, null, 99.9018430657, null, null, null, null, null, null, null, null, null, 100.135818935, null, null, null, null, null, 100.444961296, null, null, null, null, null, null, null, 99.4454506834, null, null, null, null, null, 100.52534903, null, null, null, null, 101.987967564, null, null, null, null, null, 99.765915602, null, null, null, null, 100.134165764, null, null, null, null, null, null, null, 103.094000534, null, null, null, 102.680225339, null, null, null, null, null, 101.279140404, null, null, null, 100.519317286, null, null, null, 99.7755616731, null, null, null, null, null, null, null, 101.612757365, null, null, null, 100.262817499, null, 99.1807554111, null, null, null, null, null, null, 99.6635027671, null, 98.9336459298, null, null, null, null, null, 96.751130079, null, null, null, null, null, 97.8293292463, null, null, null, null, 97.7886868359, null, null, null, null, null, null, 97.8857874287, null, null, null, null, null, 97.090001566, null, null, null, null, null, null, null, null, 98.2083704471, null, null, null, null, null, null, 98.3834738686, null, null, null, null, null, null, 99.1658581504, null, null, null, 101.204232069, null, null, null, null, 100.52661071, null, null, 101.998614833, null, null, null, null, null, 101.069456853, null, null, 100.900732126, null, null, null, 102.276706035, null, null, null, null, null, null, null, null, null, 101.024262008, null, null, null, null, null, null, null, 99.6433131889, null, null, null, null, null, null, null, 99.5650304137, null, null, null, null, null, 99.6834505684, null, null, null, null, null, 99.6370656992, null, null, null, null, null, null, null, null, 100.729131999, null, null, null, null, null, null, null, 100.563560335, null, null, null, null, null], "dataTypeId": "weight", "total": 7401.15054716}, "bpDiastolic": {"index": [5, 12, 19, 24, 33, 45, 51, 56, 60, 68, 76, 80, 82, 87, 95, 102, 109, 112, 121, 126, 141, 147, 150, 153, 158, 163, 172, 175, 183, 192, 196, 202, 209, 215, 218, 224, 227, 233, 238, 245, 248, 253, 261, 268, 273, 280, 284, 290, 296, 302, 303, 307, 311, 317, 325, 329, 340, 348, 352, 360, 366, 373, 378, 385, 390, 396, 399, 408, 411, 421, 428, 435, 446, 450, 458, 468, 472, 475], "min": 77.841021839, "max": 94.1916764724, "values": [null, null, null, null, null, 82.8415134759, null, null, null, null, null, null, 77.841021839, null, null, null, null, null, null, 78.3879405778, null, null, null, null, 78.9039122473, null, null, null, null, null, null, null, null, 79.7551693526, null, null, null, null, null, null, null, null, null, null, null, 77.9504942637, null, null, null, null, null, 78.7028530234, null, null, null, null, 83.1080589517, null, null, null, 81.617092294, null, null, null, null, null, null, null, 85.2753175612, null, null, null, null, null, null, null, 85.4178110874, null, null, null, 82.7288002196, null, 80.7898734874, null, null, null, null, 78.4496372862, null, null, null, null, null, null, null, 80.8064907272, null, null, null, null, null, null, 79.530311622, null, null, null, null, null, null, 79.79585268, null, null, 81.50382352, null, null, null, null, null, null, null, null, 81.4009275755, null, null, null, null, 83.2241559032, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 84.1966638597, null, null, null, null, null, 79.948951604, null, null, 82.7211903737, null, null, 84.0364902889, null, null, null, null, 84.4891329498, null, null, null, null, 82.5351250174, null, null, null, null, null, null, null, null, 80.6104821554, null, null, 81.7481750472, null, null, null, null, null, null, null, 82.7665698269, null, null, null, null, null, null, null, null, 82.616955374, null, null, null, 80.3487054316, null, null, null, null, null, 80.7267595062, null, null, null, null, null, null, 78.8382189033, null, null, null, null, null, 78.738089318, null, null, 82.2099434227, null, null, null, null, null, 83.4340913355, null, null, 84.9447797515, null, null, null, null, null, 86.337974205, null, null, null, null, 81.4334777165, null, null, null, null, null, null, 80.6797932585, null, null, 80.3439508581, null, null, null, null, 81.5759500138, null, null, null, null, null, null, null, 80.9715023437, null, null, null, null, null, null, 80.8899204455, null, null, null, null, 82.5876024186, null, null, null, null, null, null, 85.3037565589, null, null, null, 86.0032033194, null, null, null, null, null, 86.4137044761, null, null, null, null, null, 87.5484303933, null, null, null, null, null, 86.2558123935, 84.2075203773, null, null, null, 85.6480781435, null, null, null, 85.965246346, null, null, null, null, null, 84.9223187506, null, null, null, null, null, null, null, 85.408835094, null, null, null, 87.0389456736, null, null, null, null, null, null, null, null, null, null, 88.9427564643, null, null, null, null, null, null, null, 88.7409139742, null, null, null, 89.5118594135, null, null, null, null, null, null, null, 88.7782855529, null, null, null, null, null, 89.7407633489, null, null, null, null, null, null, 89.2780909561, null, null, null, null, 91.3708524449, null, null, null, null, null, null, 88.2914605479, null, null, null, null, 88.761371232, null, null, null, null, null, 90.4570177407, null, null, 92.6954337141, null, null, null, null, null, null, null, null, 90.2627557276, null, null, 91.1033306182, null, null, null, null, null, null, null, null, null, 94.1916764724, null, null, null, null, null, null, 93.3211290831, null, null, null, null, null, null, 90.6907839961, null, null, null, null, null, null, null, null, null, null, 87.0963053459, null, null, null, 85.7533118443, null, null, null, null, null, null, null, 84.5431348431, null, null, null, null, null, null, null, null, null, 84.3283878412, null, null, null, 85.2884682867, null, null, 82.4253579131, null, null, null, null], "dataTypeId": "bpDiastolic", "total": 6568.05085201}, "bpmon_pulseRate": {"index": [8, 15, 22, 27, 32, 38, 41, 49, 52, 61, 70, 71, 77, 84, 86, 89, 96, 101, 105, 114, 120, 124, 125, 132, 134, 142, 148, 161, 164, 170, 177, 179, 187, 194, 204, 207, 213, 222, 228, 237, 242, 251, 255, 263, 271, 278, 285, 295, 298, 308, 315, 322, 331, 334, 338, 346, 354, 359, 361, 363, 369, 375, 381, 384, 393, 401, 410, 416, 420, 422, 425, 433, 439, 443, 447, 452, 456, 463, 469, 470, 479], "min": 97.1626069572, "max": 104.231361232, "values": [null, null, null, null, null, null, null, null, 100.855185426, null, null, null, null, null, null, 100.108227232, null, null, null, null, null, null, 100.73941708, null, null, null, null, 99.2170347902, null, null, null, null, 98.8706253922, null, null, null, null, null, 98.9103637872, null, null, 98.5007031959, null, null, null, null, null, null, null, 98.74068902, null, null, 98.5599022858, null, null, null, null, null, null, null, null, 99.0759182742, null, null, null, null, null, null, null, null, 100.393422059, 99.3232533472, null, null, null, null, null, 98.6311724014, null, null, null, null, null, null, 98.8991424374, null, 98.5223864243, null, null, 100.574182632, null, null, null, null, null, null, 101.803747098, null, null, null, null, 104.231361232, null, null, null, 103.617319343, null, null, null, null, null, null, null, null, 102.995382276, null, null, null, null, null, 102.835830172, null, null, null, 102.316440056, 102.575057382, null, null, null, null, null, null, 101.13048216, null, 100.6663068, null, null, null, null, null, null, null, 99.3092231216, null, null, null, null, null, 98.6577763605, null, null, null, null, null, null, null, null, null, null, null, null, 100.605488932, null, null, 100.569125466, null, null, null, null, null, 98.218569591, null, null, null, null, null, null, 99.7795318254, null, 99.16127971, null, null, null, null, null, null, null, 99.9752882868, null, null, null, null, null, null, 101.77879047, null, null, null, null, null, null, null, null, null, 100.979965741, null, null, 99.4927486114, null, null, null, null, null, 99.8030865789, null, null, null, null, null, null, null, null, 98.3559318918, null, null, null, null, null, 98.127164978, null, null, null, null, null, null, null, null, 100.511874878, null, null, null, null, 99.3740429376, null, null, null, null, null, null, null, null, 99.9625720119, null, null, null, 100.034373725, null, null, null, null, null, null, null, 99.8691881747, null, null, null, null, null, null, null, 97.1626069572, null, null, null, null, null, null, 98.5424447364, null, null, null, null, null, null, 98.9032450541, null, null, null, null, null, null, null, null, null, 98.9737360975, null, null, 98.53379332, null, null, null, null, null, null, null, null, null, 98.8454920311, null, null, null, null, null, null, 99.1342425826, null, null, null, null, null, null, 99.7419340606, null, null, null, null, null, null, null, null, 101.553239871, null, null, 102.223323543, null, null, null, 102.596527781, null, null, null, null, null, null, null, 100.57723505, null, null, null, null, null, null, null, 100.222410764, null, null, null, null, 98.8557047217, null, 99.5013912865, null, 99.0430341183, null, null, null, null, null, 98.7108989745, null, null, null, null, null, 100.034997029, null, null, null, null, null, 98.8990193976, null, null, 99.3221856272, null, null, null, null, null, null, null, null, 100.500657629, null, null, null, null, null, null, null, 100.053948495, null, null, null, null, null, null, null, null, 99.70142461, null, null, null, null, null, 100.320421744, null, null, null, 100.526260896, null, 99.8904124399, null, null, 100.268526261, null, null, null, null, null, null, null, 99.9365448723, null, null, null, null, null, 102.214222781, null, null, null, 101.259867812, null, null, null, 100.040675261, null, null, null, null, 99.4430128834, null, null, null, 99.0697120712, null, null, null, null, null, null, 98.6452724621, null, null, null, null, null, 100.413210559, 99.8511825874, null, null, null, null, null, null, null, null, 101.89518266], "dataTypeId": "bpmon_pulseRate", "total": 8102.06757462}, "oximeter_pulseRate": {"index": [0, 4, 10, 16, 21, 25, 30, 34, 39, 48, 53, 58, 65, 74, 81, 91, 99, 103, 108, 117, 128, 133, 140, 146, 152, 157, 165, 167, 180, 184, 188, 197, 206, 208, 214, 220, 223, 232, 236, 239, 243, 250, 257, 265, 266, 274, 279, 286, 291, 293, 299, 309, 316, 319, 323, 335, 337, 343, 350, 355, 362, 367, 370, 376, 382, 386, 391, 397, 407, 413, 418, 424, 430, 432, 441, 449, 454, 461, 464, 471, 477], "min": 97.2377791211, "max": 103.307473394, "values": [100.284515992, null, null, null, 98.3682836285, null, null, null, null, null, 99.7018450433, null, null, null, null, null, 99.3285689184, null, null, null, null, 97.4758958083, null, null, null, 99.997952327, null, null, null, null, 100.437192015, null, null, null, 99.6663004156, null, null, null, null, 99.9088699128, null, null, null, null, null, null, null, null, 102.013935761, null, null, null, null, 102.47266379, null, null, null, null, 102.335719148, null, null, null, null, null, null, 101.769982887, null, null, null, null, null, null, null, null, 101.624169241, null, null, null, null, null, null, 103.051622157, null, null, null, null, null, null, null, null, null, 99.7520524086, null, null, null, null, null, null, null, 99.9850666102, null, null, null, 101.863589087, null, null, null, null, 102.507706019, null, null, null, null, null, null, null, null, 101.873539704, null, null, null, null, null, null, null, null, null, null, 100.727478998, null, null, null, null, 100.04159173, null, null, null, null, null, null, 100.631865764, null, null, null, null, null, 102.11493292, null, null, null, null, null, 102.884758349, null, null, null, null, 101.364942775, null, null, null, null, null, null, null, 100.648767316, null, 101.403497352, null, null, null, null, null, null, null, null, null, null, null, null, 101.913232184, null, null, null, 101.921193477, null, null, null, 101.401078421, null, null, null, null, null, null, null, null, 100.881176709, null, null, null, null, null, null, null, null, 101.402516507, null, 100.78081501, null, null, null, null, null, 101.743553246, null, null, null, null, null, 101.642616238, null, null, 100.654771225, null, null, null, null, null, null, null, null, 98.1214766803, null, null, null, 97.2377791211, null, null, 98.3625693656, null, null, null, 99.5297841302, null, null, null, null, null, null, 100.652358681, null, null, null, null, null, null, 99.9725390673, null, null, null, null, null, null, null, 100.396935817, 99.2261730387, null, null, null, null, null, null, null, 99.9234281568, null, null, null, null, 100.920218504, null, null, null, null, null, null, 101.233849421, null, null, null, null, 99.4492606611, null, 100.398696443, null, null, null, null, null, 101.14361494, null, null, null, null, null, null, null, null, null, 99.3779596417, null, null, null, null, null, null, 101.182529565, null, null, 101.012403872, null, null, null, 100.20728689, null, null, null, null, null, null, null, null, null, null, null, 99.742721415, null, 100.924474841, null, null, null, null, null, 100.429663743, null, null, null, null, null, null, 100.729254207, null, null, null, null, 100.753332266, null, null, null, null, null, null, 101.624846417, null, null, null, null, 99.6960963473, null, null, 100.457490868, null, null, null, null, null, 99.8906854398, null, null, null, null, null, 101.290367317, null, null, null, 101.270917723, null, null, null, null, 99.432852515, null, null, null, null, null, 99.2922095847, null, null, null, null, null, null, null, null, null, 99.6271912221, null, null, null, null, null, 100.665624153, null, null, null, null, 99.813814734, null, null, null, null, null, 101.756276573, null, null, null, null, null, 101.23374027, null, 100.03865282, null, null, null, null, null, null, null, null, 99.1729830164, null, null, null, null, null, null, null, 100.655564888, null, null, null, null, 101.381497742, null, null, null, null, null, null, 101.375903117, null, null, 102.30574736, null, null, null, null, null, null, 103.307473394, null, null, null, null, null, 101.376543277, null, null], "dataTypeId": "oximeter_pulseRate", "total": 8153.17304834}}}, "startTime": "2014-01-19T17:18:38Z"}};

    return oData.result;

};

/**
 * loggy
 */
console.log(app.currentData);
