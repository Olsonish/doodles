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
 * Fix the dates for y1 and y2
 */
for (var i = 0, len = rData.data.y1.data.length; i < len; i++) {

    rData.data.y1.data[i].date = fixDate(rData.data.y1.data[i].date);

}

for (var i = 0, len = rData.data.y2.data.length; i < len; i++) {

    rData.data.y2.data[i].date = fixDate(rData.data.y2.data[i].date);

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

    // y1 and y2 data
    y1data = rData.data.y1.data,
    y2data = rData.data.y2.data,

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




    // get min/max dates from each yaxis data
    var y1MinDate = d3.min(y1data, function(d) { return d.date; }),
        y1MaxDate = d3.max(y1data, function(d) { return d.date; });


    var xScale = d3.time.scale()
                    .domain([y1MinDate, y1MaxDate])
                    .range([0, this.svgWidth]);

    console.log(y1data[0].date)

    console.log(xScale(y1data[1].date));



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


    // some generated data
    var gData = [
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

    // a key for the test data
    var gDataKey = ["date","y1","y2"];

    // sort by date
    gData.sort(function(a,b) {

        // for readability
        var date = gDataKey.indexOf("date");

        // fix the dates so this works
        var dateA = new Date(a[date]);
        var dateB = new Date(b[date]);

        // return dateB - dateA; // latest to earliest
        return dateA - dateB; // earliest to latest

    });

    // formatting this data another way
    var oData = {};

    // use gDataKey to make oData keys as objects
    for (var oKey = 0, kLen = gDataKey.length; oKey < kLen; oKey++) {

        // first item is date so skip that one
        if (oKey != 0) {

            // new dataset object with key 'data' as array
            var dataset = oData[gDataKey[oKey]] = {
                data: []
            };

            // add data to this set
            var nData = {};
            for (var item = 0, dLen = gData.length; item < dLen; item++) {

                // insurance
                nData = null, nData = {};

                // each key item as ndata item key and each
                for (var ki = 0, kl = gDataKey.length; ki < kl; ki++) {

                    // date first
                    if (ki == 0) {

                        nData[gDataKey[ki]] = gData[item][ki];

                    }

                    // value
                    if (gDataKey[ki] == gDataKey[oKey]) {

                        nData["value"] = gData[item][ki];

                    }

                }

                dataset.data.push(nData);

            }

        }

    }

    return oData;

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