/**
 * globals
 */
var mouse_coords = [0, 0], mouse_x = 0, mouse_y = 0;
var shape_names = [
    "shapeone",
    "shapetwo"
];

/**
 * settings
 */
var config = {
    width: 960,
    height: 640,
    transition_duration: 250,
    loop_duration: 1000
};

/**
 * svg
 */
var ____svg = d3.select("#content")
                .append("svg");
____svg
    .attr("width", config.width)
    .attr("height", config.height);

/**
 * general update loop
 */
var last_mouse_coords = mouse_coords;
var ____svg_update_loop = setInterval(function() {

    // terminate update loop on condition
    // if (condition) {
    //     clearInterval(____svg_update_loop);
    //     return;
    // }
    
    if (last_mouse_coords === mouse_coords) {
        update_all_lines();
    }

    else {
        update_all_lines(mouse_coords);
    }

    // update last coords
    last_mouse_coords = mouse_coords;

}, config.loop_duration);

/**
 * mouse actions
 */
____svg.on('mousemove', function() {
    
    mouse_coords = d3.mouse(this);
    mouse_x = mouse_coords[0];
    mouse_y = mouse_coords[1];

    update_all_lines(mouse_coords);
});

____svg.on('click', function() {
    console.log("click");
});


// general update function for all lines
function update_all_lines(coords) {
    for (var sni = 0, snlen = shape_names.length; sni < snlen; sni++) {
        update_line(shape_names[sni], coords);
    }
}

// line update function
function update_line(shape, coords) {

    // selection css class by shape name
    var shape_class = ".logoshape";
    if (shape) {
        // in the presence of a shape name append selection class
        shape_class += "." + shape;
    }

    // line group
    var line_group = ____svg.selectAll(shape_class);

    // if the line group is empty create one
    if (line_group.empty()) {
        // line group selection was empty so append line group
        line_group = ____svg.append("svg:g")
                            .attr("class", "logoshape " + shape);
    }

    // line path(s)
    var line_path = line_group.select("path." + shape + "-main");
    var line_path_sub_a = line_group.select("path." + shape + "-sub_a");
    var line_path_sub_b = line_group.select("path." + shape + "-sub_b");

    // if the line path is empty create one
    if (line_path.empty()) {
        // line path selection was empty so append line path
        line_path = line_group.append("svg:path")
                                .attr("class", shape + "-main");
        line_path_sub_a = line_group.append("svg:path")
                                .attr("class", shape + "-sub_a");
        line_path_sub_b = line_group.append("svg:path")
                                .attr("class", shape + "-sub_b");
    }

    // general update pattern is
    // perform DATUM filter/updates & joins
    // UPDATE           - updates to existing elements as needed
    // ENTER            - enter new elements as needed
    // ENTER + UPDATE   - updates to existing and new elements
    // EXIT             - remove elements for datum no longer present

    // perform DATUM filter/updates & joins
    var line_data = get_linedata(shape, coords);
    // var line_data_sub_a = get_warpeddata(line_data, "a");
    // var line_data_sub_a = get_warpeddata(line_data, "b");

    // UPDATE
    
    
    // ENTER
    
    
    // ENTER + UPDATE
    
    // line function
    var line_fn = d3.svg.line();
    line_fn
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        // .interpolate("cardinal-closed")
        .interpolate("basis-closed")
        // .interpolate("linear")
        ;

    
    // line path
    line_path
        .transition()
        .duration(config.transition_duration * 2)
        .ease('linear')
        .attr("d", line_fn(line_data));

    // EXIT
    

};

// function to generate line data like:
// [
//     { "x": 30, "y": 50},
//     { "x": 120, "y": 20},
//     { "x": 90, "y": 80},
//     { "x": 60, "y": 100},
//     { "x": 30, "y": 100}
// ]
function get_linedata(shape, coords) {

    // initial line data
    var line_data = [];

    // initial line segments
    var line_segments = [];

    // shape one line segments
    if (shape === "shapeone") {
        line_segments = [
                            [30, 60],
                            [120, 30],
                            [90, 90],
                            [60, 120],
                            [30, 90]
                        ];
    }
    
    // shape two line segments
    if (shape === "shapetwo") {
        line_segments = [
                            [60, 30],
                            [30, 120],
                            [90, 90],
                            [120, 60],
                            [90, 30]
                        ];
    }

    // shape two line segments
    if (shape === "shapethree") {
        line_segments = [
                            [60, 30],
                            [30, 120],
                            [90, 90],
                            [120, 60],
                            [90, 30]
                        ];
    }

    // zoom line segments
    var zoom_scale = 2.5;
    for (var si = 0, slen = line_segments.length; si < slen; si++) {
        line_segments[si] = zoom_segment(line_segments[si], zoom_scale);
    }

    // if coords is present inject one
    if (coords) {
        if (shape === "shapeone") {
            line_segments[2] = coords;
        }
        if (shape === "shapetwo") {
            line_segments[2] = coords;
        }
    }

    // use segment list to push line data segment object literals
    for (var si = 0, slen = line_segments.length; si < slen; si++) {
        line_data.push({
            "x": line_segments[si][0],
            "y": line_segments[si][1]
        });
    }

    // return list of line data object literals
    return line_data;

    // function to zoom segments
    // segment is a list of xy coords like: [0, 0]
    function zoom_segment(segment, zoom_scale) {
        return [(segment[0] * zoom_scale), (segment[1] * zoom_scale)];
    }

};
