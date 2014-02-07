/**
 * Create some data
 */
var rData = {

    data: generateTestData(30,90)

};



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
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);


    console.log(rData.data);




/**
 * Data Creation Functions
 */
function generateTestData(count,days) {

    var rand;

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


    // how many datapoints generated is count
    for (var i = 0, len = count; i < len; i++) {
        
        var set = [],
            time = new Date(dateRange[0]);


        time.setDate(time.getDate() - i);


        set.push(time);

        data.push(set);

    }

    

    console.log(data[0],data[count - 1]);






    return data;

}







/**
 * Useful Functions
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}