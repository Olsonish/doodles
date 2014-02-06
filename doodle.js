console.log(window);


var svg = d3.select("#content").append("svg");


var margin = {
		top: 20,
		right: 20,
		bottom: 30,
		left: 40
	},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


svg.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)