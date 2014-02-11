/**
 * Create some data
 */
var rData = {


    // function(count, days)
    data: generateTestData(30,7)
    // data: generateTestData(30,180)
    // data: generateTestData(30,180)


};

/**
 * Fix the dates
 */
for (var i = 0, len = rData.data.length; i < len; i++) {

    rData.data[i][0] = fixDate(rData.data[i][0]);

}

/**
 * Setup margins then create the SVG
 */
var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    },

    // svg base size
    svgWidth = 960,
    svgHeight = 500,

    // visualization width will be svg width minus margins
    visWidth = svgWidth - margin.left - margin.right,

    // visualization height will be svg height minus margins
    visHeight = svgHeight - margin.top - margin.bottom,

    // create the svg
    svg = d3.select("#content")
            .append("svg:svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

    console.log(rData.data);



var xScale = d3.time.scale()
                    .domain([rData.data[0][0], rData.data[rData.data.length - 1][0]])
                    .range([0, this.svgWidth]);


var min = d3.min(rData.data, function(d) {
    return d[0];
});

var max = d3.max(rData.data, function(d) {
    return d[0];
});

console.log(min, max);

// use x scale to calculate svg x coord
console.log(xScale(rData.data[0][0]));






/**
 * Data Creation Functions
 */
function generateTestData(count,days) {

/*
    if (!count) {
        count = 25;
    }

    if (!days) {
        days = 30;
    }

    // drawing two scatterplots so we need two sets of ranges
    var ranges = {
            y1: {
                lower: ["50","89"],
                normal: ["90","140"],
                upper: ["141","240"]
            },
            y2: {
                lower: ["35","59"],
                normal: ["60","90"],
                upper: ["91","140"]
            }
        };

    // we'll need to set a date range for the x axis
    var now = new Date(),
        then = new Date(now); // we'll set this in a moment


    console.log(now);


    // set then to however many days ago
    then.setDate(then.getDate() - days);

    // set our dateranges
    var dateRange = [then,now];

    // a key for our sets
    var key = ["time","y1","y2"],

        // data array for populating
        data = [],

        // scale factor
        scale = days / count;


    console.log(scale);




    // datapoints to be generated = count
    for (var i = 0, tick = 0, len = count; i < len; i++) {
              
        console.log((i * scale));

        var set = [],
            time = new Date(dateRange[0]);

        time.setDate(time.getDate() - i);

        set.push(time);

        data.push(set);
        
    
    }
    
    console.log(dateRange);
    console.log(data[0],data[count - 1]);
*/

    

    data = [
        ["2004-02-14 16:25:06",119,61],
        ["1992-01-17 00:53:15",94,61],
        ["1989-01-07 16:55:57",109,68],
        ["2003-01-15 07:02:08",112,89],
        ["2008-06-07 22:36:22",137,65],
        ["1991-09-25 21:07:43",93,75],
        ["2014-01-29 14:09:15",96,90],
        ["2008-12-12 11:07:36",100,74],
        ["2005-05-22 19:45:53",103,85],
        ["1994-04-01 00:20:10",104,83],
        ["2010-09-08 15:36:30",115,73],
        ["2009-12-30 08:35:52",137,67],
        ["2005-08-22 05:26:36",116,60],
        ["2007-10-18 20:28:24",100,77],
        ["2008-06-04 17:48:57",103,68],
        ["2005-09-05 06:41:00",130,73],
        ["2004-01-26 14:07:20",131,89],
        ["2010-11-01 10:48:32",90,69],
        ["1993-09-25 19:24:15",140,78],
        ["2007-06-17 10:02:15",103,87],
        ["2011-01-12 06:32:45",123,64],
        ["2000-01-03 14:51:36",127,83],
        ["2001-01-25 16:03:55",137,89],
        ["2002-06-06 05:08:43",92,74],
        ["2007-12-07 23:21:29",138,65],
        ["2008-04-25 08:53:03",137,84],
        ["2012-02-19 09:56:50",91,78],
        ["1988-05-07 07:33:28",94,87],
        ["2003-08-22 19:11:00",101,73],
        ["2007-01-24 04:16:36",109,73]
    ];

    // console.log(new Date(data[4][0]));

    // console.log(data[0] + "  " + data[data.length - 1]);

    data.sort(function(a,b) {

        var dateA = new Date(a[0]);
        var dateB = new Date(b[0]);

        // return dateB - dateA;
        return dateA - dateB;

    });

    // console.log(data[0] + "  " + data[data.length - 1]);

    // console.log("  ");

    return data;

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