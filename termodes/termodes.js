// console.log(builder);

var view = d3.select('#wrap').append("div").attr("id", "view");


var cgs = [
    {
        dId: "controlGroup01",
        type: "static"
    },
    {
        dId: "controlGroup02",
        type: "param"
    },
    {
        dId: "controlGroup03",
        type: "static"
    },
    {
        dId: "controlGroup04",
        type: "param"
    }
];

for (var cgi = 0, cglen = cgs.length; cgi < cglen; cgi++) {

    view.append("a")
        .attr("id", cgs[cgi].dId)
        .classed("static", function() {

            var isStatic = cgs[cgi].type === "static";

            return isStatic;

        });

}






var svgcmp = function(view) {

    var self = this;

    var init = function() {

        console.log(self);

    };

    this.init = init;
    this.div = view.append("div").attr("class", "svgcmp");
    this.svg = this.div.append("svg");

    return this;

};


// termnodes
var termnodes = new svgcmp(view);
termnodes.init = function() {

    var tree = function(parent, prev, key, value) {

        if (key !== void 0) {
            this.key = key;
        }

        if (value !== void 0) {
            this.value = value;
        }

        if (prev) {
            prev.next = this;
        }

        else if (parent) {
            parent.child = this;
        }

    };

    tree.prototype.put = function(name, value) {
        var i = 0, self = this, len = name.length, prev, parent;
        down: while (self.child) {
            parent = self;
            self = self.child;
            // if first child didn't match, get next sibling
            while (self.key != name[i]) {
                if (!self.next) {
                    prev = self;
                    self = parent;
                    break down;
                }
                self = self.next;
            }
            // key already exists, update the value
            if (++i > len) {
                self.value = value;
                return;
            }
        }
        // found any existing parts of the key, add the rest
        self = new this.constructor(self, prev, name[i]);
        while (++i <= len)
            self = new this.constructor(self, null, name[i]);
        self.name = name;
        self.value = value;
    };

    tree.prototype.get = function(name) {
        var i = 0, self = this.child, len = name.length;
        while (self) {
            if (self.key == name[i]) {
                if (i == len)
                    return self.value;
                self = self.child;
                ++i;
            } else {
                self = self.next;
            }
        }
    };

    // update svg display of something
    tree.prototype.update = function() {

        console.log(nodes);
        console.log(svg);

        svg.selectAll("rect")
            .data(nodes)
            .enter()
            .append("rect")
            .text(function(d, i) {

                console.log(d);

                return i;

            });


    };

    var svg = this.svg;
        svg.attr('height', 40);

    var nodes = new tree();
    this.nodes = nodes;

};
termnodes.init();





// other stuff
var visuals = new svgcmp(view);
visuals.svg.attr('height', 240);
