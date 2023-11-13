"use strict";

const DATA_LINE = "dataLine";
const MIN_AXIS_COUNT = 2;
const MAX_AXIS_COUNT = 7;

let margin = { top: 50, right: 40, bottom: 30, left: 50 };
let chartOuterWidth = d3.select("#ChartContainer").style("width").replace("px", "");
let chartOuterHeight = 500;
let chartInnerWidth = chartOuterWidth - margin.right - margin.left;
let chartInnerHeight = chartOuterHeight - margin.top - margin.bottom;
let selectedObjects = 0;
let selection = [];
let history = [];
let brushMode = "and";
let currentlyBrushed = 0;

let colors = {
    "Marc": "indigo",
    "Tobias": "cyan",
    "Antonio": "green",
    "Hanna": "pink",
    "Lukas": "deeporange",
    "meat": "red",
    "fish": "blue",
    "vegetarian": "amber",
    "vegan": "green",
    "none": "indigo",
    "Mon.": "red",
    "Tue.": "purple",
    "Wed.": "indigo",
    "Thu.": "lightblue",
    "Fri.": "teal",
    "Sat.": "lightgreen",
    "Sun.": "yellow"
};
//latest attribute checked for colorization
let lastCheckedAttribute = "none";
let yAxis = d3.axisLeft();

let numberOfActiveAttributes = 0;
let data;
let dragging = [];
let lineGenerator = d3.line();

//Types for axes/attributes
let types = {
    Number: {
        key: "Number",
        extent: d3.extent,
        defaultScale: d3.scaleLinear().range([chartInnerHeight, 0]),
    },
    Float: {
        key: "Float",

        extent: d3.extent,
        defaultScale: d3.scaleLinear().range([chartInnerHeight, 0]),
    },
    String: {
        key: "String",
        extent: function(data) {
            return data.sort();
        },
        defaultScale: d3.scalePoint().range([0, chartInnerHeight]),
    },
    Time: {
        key: "Time",
        extent: d3.extent,
        defaultScale: d3.scaleTime().range([chartInnerHeight, 0]),
    },
    Duration: {
        key: "Duration",
        extent: d3.extent,
        defaultScale: d3.scaleTime().range([chartInnerHeight, 0])
    }
};

// All axes with their type and name
let attributes = [{
    key: "date",
    description: "date",
    type: types.Time,
    active: false,
    axis: d3.axisLeft().ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%e %b")),
    inverted: false
}, {
    key: "person",
    description: "person",
    type: types.String,
    active: true,
    inverted: false
}, {
    key: "day",
    description: "weekday",
    type: types.String,
    defaultDomain: ["Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat.", "Sun."],
    domain: ["Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat.", "Sun."],
    active: true,
    inverted: false
}, {
    key: "wokeUp",
    description: "wake-up time",
    type: types.Time,
    active: true,
    axis: d3.axisLeft().ticks(d3.timeMinute.every(30)).tickFormat(d3.timeFormat("%I:%M %p")),
    inverted: false
}, {
    key: "wentToSleep",
    description: "bedtime",
    type: types.Time,
    active: false,
    axis: d3.axisLeft().ticks(d3.timeMinute.every(30)).tickFormat(d3.timeFormat("%I:%M %p")),
    inverted: false
}, {
    key: "stairs",
    description: "stair",
    type: types.Number,
    active: true,
    inverted: false
}, {
    key: "doors",
    description: "doors",
    type: types.Number,
    active: true,
    inverted: false
}, {
    key: "streets",
    description: "streets",
    type: types.Number,
    active: false,
    inverted: false
}, {
    key: "moneySpent",
    description: "money spent",
    type: types.Float,
    unit: "€",
    active: false,
    axis: d3.axisLeft()
        .tickFormat(function(d, i) {
            return d + " €";
        }),
    inverted: false
}, {
    key: "lunchWhat",
    description: "lunch - what",
    type: types.String,
    active: true,
    inverted: false
}, {
    key: "lunchWhere",
    description: "lunch - location",
    type: types.String,
    active: false,
    inverted: false
}, {
    key: "lunchWhen",
    description: "lunch - time",
    type: types.Time,
    active: false,
    axis: d3.axisLeft().ticks(d3.timeMinute.every(30)).tickFormat(d3.timeFormat("%I:%M %p")),
    inverted: false
}, {
    key: "timeInUniversity",
    description: "time at university",
    type: types.Duration,
    unit: "h",
    active: false,
    axis: d3.axisLeft().ticks(d3.timeMinute.every(30)).tickFormat(d3.timeFormat("%H:%M h")),
    inverted: false
}, {
    key: "timePc",
    description: "time with computer",
    type: types.Duration,
    unit: "h",
    active: false,
    axis: d3.axisLeft().ticks(d3.timeMinute.every(30)).tickFormat(d3.timeFormat("%H:%M h")),
    inverted: false
}, {
    key: "timePhone",
    description: "time with phone",
    type: types.Duration,
    unit: "h",
    active: false,
    axis: d3.axisLeft().ticks(d3.timeMinute.every(30)).tickFormat(d3.timeFormat("%H:%M h")),
    inverted: false
}, {
    key: "timeWorked",
    description: "hours worked",
    type: types.Duration,
    unit: "h",
    active: false,
    axis: d3.axisLeft().ticks(d3.timeMinute.every(30)).tickFormat(d3.timeFormat("%H:%M h")),
    inverted: false
}, {
    key: "timeSport",
    description: "time doing sports",
    type: types.Duration,
    unit: "h",
    active: false,
    axis: d3.axisLeft().ticks(d3.timeMinute.every(30)).tickFormat(d3.timeFormat("%H:%M h")),
    inverted: false
}, {
    key: "kilometer",
    description: "distance",
    type: types.Float,
    unit: "km",
    active: false,
    axis: d3.axisLeft()
        .tickFormat(function(d, i) {
            return d.toFixed(1) + " km";
        }),
    inverted: false
}, {
    key: "happiness",
    description: "happiness",
    type: types.Float,
    active: false,
    inverted: false
}, {
    key: "contactPeople",
    description: "people met",
    type: types.Number,
    active: false,
    inverted: false
}, {
    key: "colorTop",
    description: "color of top",
    type: types.String,
    active: false,
    inverted: false
}, {
    key: "alcohol",
    description: "alcohol",
    type: types.Float,
    unit: "units",
    active: false,
    axis: d3.axisLeft()
        .tickFormat(function(d, i) {
            return d + " units";
        }),
    inverted: false
}];

const coerce = (d) => {
    d.stairs = +d.stairs;
    d.date = +d.date * 1000;
    d.day = d.day;
    d.doors = +d.doors;
    d.streets = +d.streets;
    d.happiness = +d.happiness;
    d.contactPeople = +d.contactPeople;
    d.alcohol = +d.alcohol;
    d.moneySpent = +d.moneySpent;
    d.kilometer = +d.kilometer;
    d.wokeUp = +d.wokeUp * 1000;
    d.colorTop = (() => {
        const colorTranslation = { "dark blue": "blue", "grey": "gray", "navy": "blue", "wine red": "red", "light orange": "orange" };
        return colorTranslation[d.colorTop] || d.colorTop;
    })();
    d.wentToSleep = +d.wentToSleep * 1000;
    d.lunchWhen = (d.lunchWhen === "none") ? "none" : +d.lunchWhen * 1000;
    d.timeInUniversity = +d.timeInUniversity * 1000;
    d.timePc = +d.timePc * 1000;
    d.timePhone = +d.timePhone * 1000;
    d.timeWorked = +d.timeWorked * 1000;
    d.timeSport = +d.timeSport * 1000;
    d.person = d.person;
    d.lunchWhere = d.lunchWhere;
    d.lunchWhat = d.lunchWhat;
    return d;
};

let xscale = d3.scalePoint()
    .domain(d3.range(attributes.length))
    .range([0, chartInnerWidth]);
let xScale = d3.scalePoint()
    .domain(getActiveAttributes().map(function(d) {
        return d.key;
    }))
    .range([0, chartInnerWidth]);

let chart = d3.select(".chart")
    .attr("width", chartOuterWidth)
    .attr("height", chartOuterHeight)
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let axes = chart.selectAll(".axis")
    .data(attributes)
    .enter().append("g")
    .attr("class", "axis")
    .attr("id", (d) => {
        return "id_" + d.key;
    })
    .attr("transform", function(d, i) {
        return "translate(" + xscale(i) + "0)";
    });

let brush = d3.brushY()
    .extent([
        [-9, 0],
        [10, chartInnerHeight]
    ])
    .on("start", onBrushStart)
    .on("brush", onBrush)
    .on("end", onBrushEnd);

//append checkbox-switches for all data attributes to the menu
let attributesAlphabetically = attributes.slice().sort(function(a, b) {
    return a.description > b.description
});
attributesAlphabetically.forEach(function(attribute) {
    let cb_div = d3.select("#menu-checkboxes")
        .append("li")
        .attr("class", "bold itemSpecial")
        .append("div")
        .attr("class", "switch")
        .append("label").html(attribute.description)
        .append("div")
        .attr("class", "pull-right");
    cb_div.append("input")
        .attr("type", "checkbox")
        .attr("name", "axis_checkbox")
        .attr("value", attribute.key)
        .attr("id", attribute.key + "_checkbox")
        .on("click", onAxesCheckboxClicked);
    cb_div.append("span")
        .attr("class", "lever");
});

let axisOverlay;
drawAxisOverlay();


d3.csv("data/data.csv", coerce, function(error, dataset) {
    data = dataset;

    let id = 0;
    data.forEach(function(d) {
        d.id = id++;
    });

    //prepare the scales for the different data attributes
    attributes.forEach(function(attribute) {
        // detect domain using dimension type's extent function
        if (!("domain" in attribute)) {
            if (attribute.type.key === "Time" && !(attribute.key === "date")) {
                attribute.domain = attribute.type.extent(data.map(function(d) {
                    return getTransformedDate(d, attribute);
                }));

            } else {
                attribute.domain = attribute.type.extent(data.map(function(d) {
                    return d[attribute.key];
                }));
            }
        }
        // If no scale is in the attribute we add one.
        if (!("scale" in attribute)) {
            attribute.scale = attribute.type.defaultScale.copy();
        }

        attribute.scale.domain(attribute.domain);

        // If this attribute is active count it and activate its checkbox.
        if (attribute.active) {
            numberOfActiveAttributes++;
            //don't forget to update the horizontal scale, whenever active attributes have changed!!!
            xScale.domain(getActiveAttributes().map(function(d) {
                return d.key;
            }));
            d3.select("#" + attribute.key + "_checkbox").property("checked", true);
        }
    });

    axes.append("g")
        .each(function(d) {
            d3.select(this).call(("axis" in d) ? d.axis.scale(d.scale) : yAxis.scale(d.scale));
        })
        .append("text")
        .attr("class", "label")
        .style("cursor", "ew-resize")
        .attr("transform", "translate(0, -30) rotate(-10)")
        .style("text-anchor", "end")
        .text((d) => {
            return d.description;
        })
        .property("key", (d) => {
            return d.key;
        })
        .on("click", onAxisLabelClicked);

    //register callback functions for drag behaviour
    axes.call(d3.drag()
        .on("start", onDragStarted)
        .on("drag", onDragged)
        .on("end", onDragEnded));

    axes.each((d, i, nodes) => {
        let brush = createNewBrush(d.key);
        d3.select(nodes[i])
            //.attr("data-brushCount", 1)
            .insert("g")
            .attr("class", "brush activeBrushing " + d.key)
            .call(brush);
    });

    //initializeAxes();
    updateAxesVisibilityAndPosition();
    drawDataObjects(data);
});

/*STARPLOT BEGIN*/
let chart2OuterWidth = (d3.select("#starPlot").style("width").replace("px", "")) - 30;

// Config for the Radar chart
let config = {
    w: chart2OuterWidth,
    h: chart2OuterWidth,
    maxValue: 4,
    levels: 5,
    ExtraWidthX: 100
};

let chart2 = d3.select("#starPlot")
    .append("div")
    .attr("id", "chart2")
    .append("svg")
    .attr("width", chart2OuterWidth - 100)
    .attr("height", chart2OuterWidth - 100);

let dataPlot = [
    [
        { "attribute": "Uni", "value": 0 },
        { "attribute": "Work", "value": 0 },
        { "attribute": "Phone", "value": 0 },
        { "attribute": "PC", "value": 0 },
        { "attribute": "Sleep", "value": 0 },
        { "attribute": "Sport", "value": 0 }
    ],
    [
        { "attribute": "Uni", "value": 0 },
        { "attribute": "Work", "value": 0 },
        { "attribute": "Phone", "value": 0 },
        { "attribute": "PC", "value": 0 },
        { "attribute": "Sleep", "value": 0 },
        { "attribute": "Sport", "value": 0 }
    ]
];

RadarChart.draw("#chart2", dataPlot, config);
/*STARPLOT END*/

/**
 * Called when help button ist clicked
 */
let helpCounter;
let helpTimer;

function helpMe2() {
    helpCounter = 0;
    switchHelpers();
    helpTimer = setInterval(() => {
        switchHelpers();
    }, 6000);
}

function switchNow() {
    clearInterval(helpTimer);
    switchHelpers();
    if (helpCounter < 7)
        helpTimer = setInterval(() => {
            switchHelpers();
        }, 6000);
}

function switchHelpers() {
    switch (helpCounter) {
        case 0:
            $('#opac-overlay').show();
            $('#opac-overlay').fadeTo("slow", 0.33);
            $('.menuHelp').tapTarget('open');

            break;
        case 1:
            $('.menuHelp').tapTarget('close');
            $('.hoverHelp').tapTarget('open');
            break;
        case 2:
            $('.hoverHelp').tapTarget('close');
            $('.clickHelp').tapTarget('open');
            break;
        case 3:
            $('.clickHelp').tapTarget('close');
            $('.tableHelp').tapTarget('open');
            break;
        case 4:
            $('.tableHelp').tapTarget('close');
            $('#invert').show();
            $('.invertHelp').tapTarget('open');
            break;
        case 5:
            $('.invertHelp').tapTarget('close');
            $('#invert').hide();
            $('#swap').show();
            $('.swapHelp').tapTarget('open');
            break;
        case 6:
            $('.swapHelp').tapTarget('close');
            $('#swap').hide();
            $('#brush').show();
            $('.brushHelp').tapTarget('open');
            break;
        case 7:
            $('.brushHelp').tapTarget('close');
            $('#brush').hide();
            $('#opac-overlay').fadeTo("slow", 0);
            $('#opac-overlay').hide();
            clearInterval(helpTimer);
            break;
    }
    helpCounter++;
}

function createNewBrush(attributeKey) {
    let brush = d3.brushY()
        .extent([
            [-9, 0],
            [10, chartInnerHeight]
        ])
        .on("start", onBrushStart)
        .on("brush", onBrush)
        .on("end", onBrushEnd);

    return brush;
}

/**
 * Called when a brush on an axis occurred for the first time.
 */
function onBrushStart() {
    d3.event.sourceEvent.stopPropagation();
}


/**
 * Called when an brush on an axis has occurred after it has started.
 * It will change the way data lines are shown.
 */
function onBrush() {
    //if (selectedObjects !== 0) return;
    let actives = [];
    let activeDims = [];
    let wasChanged = false;
    chart.selectAll(".axis .brush")
        .filter(function(d) {
            return d3.brushSelection(this);
        })
        .each(function(d) {
            actives.push({
                dimension: d,
                extent: d3.brushSelection(this)
            });
            activeDims.push({
                dimension: d
            });
        });

    currentlyBrushed = 0;

    chart.selectAll("." + DATA_LINE)
        .each(function(d) {
            if (isDataLineWithinBrushSelections(d)) {

                if (!wasChanged && !d3.select(this).classed("colored")) wasChanged = true;
                d3.select(this).classed("colored", true).raise();
                currentlyBrushed++;
                d3.select("#nrBrushedLines").html("" + currentlyBrushed);
            } else {
                if (!wasChanged && d3.select(this).classed("colored")) wasChanged = true;
                d3.select(this).classed("colored", false);
            }
        });

    // Redraw all boxplots.
    if (wasChanged) {
        for (let attribute of attributes) {
            redrawBoxPlot(attribute);
        }
    }

}

/**
 * Called when a brush on an axis has ended.
 */
function onBrushEnd() {
    onBrush();
    let axis = d3.select(this.parentNode);

    let brushSelection = (d3.brushSelection(d3.select("#id_" + axis.datum().key + " g.brush.activeBrushing").node()));

    //check if the latest brush already has a selected area. If so, we need to add a potential new brush on top of it
    if (brushSelection && brushSelection[0] !== brushSelection[1]) {
        //add a potential new brush to the axis and count it

        axis.select("g.brush.activeBrushing").classed("activeBrushing", false);
        axis.insert("g", ".brush")
            .attr("class", function(d) {
                return "brush activeBrushing " + d.key;
            })


        .call(createNewBrush(axis.datum().key));

        //Disable pointer-events of all brush overlays except for the first one to enable interaction with the brush

        d3.selectAll("#id_" + axis.datum().key + " .brush:not(.activeBrushing) > .overlay").style("pointer-events", "none");
        //remove the brushes when the user clicks on the overlay
        d3.select("#id_" + axis.datum().key + " .brush.activeBrushing > .overlay")
            .on("click", function() {
                d3.selectAll("#id_" + axis.datum().key + " .brush").each((d, i, nodes) => {
                    let thisBrush = d3.select(nodes[i]);
                    if (thisBrush.classed("activeBrushing")) {
                        thisBrush.call(brush.move, null);
                    } else {
                        thisBrush.call(brush.move, null).remove();
                    }
                });
            });
    }
}

/**
 * Updates the visibility and the position for the axis. It will also do the same for the boxplots.
 */
function updateAxesVisibilityAndPosition() {
    console.log("Updating Axes visibility and position");
    let gapBetweenAxes = chartInnerWidth / (numberOfActiveAttributes - 1);
    let offset = 0;
    attributes.forEach(function(attribute) {
        let axis = d3.select("#id_" + attribute.key);

        if (attribute.active) {
            axis
                .attr("transform", "translate(" + xScale(attribute.key) + ", 0)")
                .classed("hide", false);

            offset += 1;
        } else {
            axis.classed("hide", true);
        }
    });
}

/**
 * It will create the data line group and its data line.
 *
 * @param data {object} The data that will used to create the new data line.
 */
function drawDataObjects(data) {
    console.log("Redrawing Data Objects");
    //add the lines representing the data objects
    chart.selectAll("." + DATA_LINE).remove();
    let gapBetweenAxes = chartInnerWidth / (numberOfActiveAttributes - 1);
    // Generate a parent group for the data lines and there detail through hover.
    let pathID = 0;
    chart.insert("g", ":first-child")
        .selectAll("." + DATA_LINE)
        .data(data)
        .enter().append("path")
        .attr("class", (d) => {
            return DATA_LINE + " colored c_" + ((lastCheckedAttribute !== "none") ? colors[d[lastCheckedAttribute]] : "base");
        })
        //.attr("data-pID", () => {
        //    return pathID++;
        //})
        .attr("d", (d) => {
            return getPathData(d);
        })
        // Add a method for the movement of the hover detail object.
        .on("mouseenter", onDataLineMouseEnter)
        .on("click", onDataLineClicked);

}

/**
 * Called when a checkbox in the side nav for the axis were checked/unchecked.
 * It will change the displayed axis in the chart.
 */
function onAxesCheckboxClicked() {
    // Check if enough or to much axes would be displayed
    let attributeName = d3.select(this).attr("value");
    let nowChecked = d3.select(this).property("checked");

    let attr = attributes.find((a) => a.key === attributeName);
    let attrIdx = attributes.findIndex((a) => a.key === attributeName);
    if (attr) {
        attr.active = nowChecked;
        numberOfActiveAttributes += nowChecked ? 1 : (-1);
        //move the checked attribute to the end of the array
        if (nowChecked) {
            attributes.splice(attrIdx, 1);
            attributes.splice(attributes.length, 0, attr);
        }

        xScale.domain(getActiveAttributes().map(function(d) {
            return d.key;
        }));
        d3.selectAll("#id_" + attributeName + " .brush").call(brush.move, null);

        if (numberOfActiveAttributes === MAX_AXIS_COUNT)
            d3.selectAll("#menu-checkboxes input:not(:checked)").property("disabled", true);
        if (numberOfActiveAttributes === MIN_AXIS_COUNT)
            d3.selectAll("#menu-checkboxes input:checked").property("disabled", true);
        if (numberOfActiveAttributes === MAX_AXIS_COUNT - 1 && !nowChecked)
            d3.selectAll("#menu-checkboxes input:not(:checked)").property("disabled", false);
        if (numberOfActiveAttributes === MIN_AXIS_COUNT + 1 && nowChecked)
            d3.selectAll("#menu-checkboxes input:checked").property("disabled", false);

        updateAxesVisibilityAndPosition();
        updateDataObjects(data)
    }
}

/**
 * Called when a data line is hovered over.
 * It will create, if necessary, the data hover object and will set its position every time.
 */
function onDataLineMouseEnter() {
    let datum = d3.select(this).datum();
    fillDoD(datum, 1);
}

/**
 * Called when a data line in the chart was clicked.
 * It will set the selection attribute.
 */
function onDataLineClicked() {
    // highlight/degrade clicked polyline and set data-selected
    let item = d3.select(this);
    let datum = item.datum();
    fillDoD(datum, 0);

    console.log("Added Line " + datum.id + " to Comparison");
    if (item.attr("data-selected") === "true") {
        item.attr("data-selected", "false");
        item.lower();
        selectedObjects--;
    } else {
        item.attr("data-selected", "true").classed("colored", true);
        item.raise();
        selectedObjects++;
    }

    item.classed("selected", !item.classed("selected"));

    if (selectedObjects === 0) onBrush();
}

/**
 * Called when an axis is picked up by the user and dragging starts.
 *
 * @param i {object} The attribute of the axis.
 */
function clearComparison(i) {
    // Delete all selected data lines in the pcp.
    d3.selectAll(".selected")
        .dispatch("click");

    // Delete the details on demand.
    for (let attribute of attributes) {
        document.getElementById(attribute.key + i).innerHTML = "";
    }
    // Delete StarPlots
    deleteStarplot(i);
    d3.selectAll(".radar-chart-serie" + i).remove();

    console.log("Cleared Second Comparison-Item");
}

function deleteStarplot(i) {
    dataPlot[i][0].value = 0;
    dataPlot[i][1].value = 0;
    dataPlot[i][2].value = 0;
    dataPlot[i][3].value = 0;
    dataPlot[i][4].value = 0;
    dataPlot[i][5].value = 0;
    RadarChart.draw("#chart2", dataPlot, config);

}

/**
 * Called when an axis is picked up by the user and dragging starts.
 *
 * @param d {object} The attribute of the axis.
 */
function onDragStarted(d) {
    console.log("Dragging of axis " + d.key + " started.");
}

/**
 * Calculates the path data string ("d" attribute) for drawing the data object as an svg path element.
 *
 * @param d a single data object to be represented by a data line in the chart
 * @returns an svg path data string (e. g. "M0,280 L110.775,0 L221.55,198 L332.3255,344.3 ... ") that can be set as
 * the "d" attribute of an svg path
 */
function getPathData(d) {
    //sorting the array of attributes before drawing is important for some reason!
    let activeAttributes = getActiveAttributes().sort(function(a, b) {
        return getAxisPositionOnDrag(a) - getAxisPositionOnDrag(b);
    });

    return lineGenerator(activeAttributes.map(function(attribute) {
        return [getAxisPositionOnDrag(attribute), attribute.scale((attribute.type.key === "Time" && !(attribute.key === "date")) ? getTransformedDate(d, attribute) : d[attribute.key])];
    }));
}

/**
 * Called during drag of an axis, each time the axis is moved by the user. This function constantly reorders the array
 * containing the attributes and updates the position of all axes (except for the dragging one) based on this new order
 * and the horizontal xScale. If sticky dragging is enabled, data lines will stick to the moved axis during drag (might
 * cause some lagging).
 *
 * @param d {object} The attribute of the axis.
 */
function onDragged(d) {
    dragging[d.key] = Math.min(chartInnerWidth + 20, Math.max(-20, d3.event.x));
    let stickyDragging = d3.select("#sticky_dragging_checkbox").property("checked");
    if (stickyDragging) {
        d3.selectAll(".dataLine").attr("d", function(d2) {
            return getPathData(d2);
        });
    }
    attributes = attributes.sort(function(a, b) {
        return getAxisPositionOnDrag(a) - getAxisPositionOnDrag(b);
    });
    let act = getActiveAttributes().sort(function(a, b) {
        return getAxisPositionOnDrag(a) - getAxisPositionOnDrag(b);
    });
    xScale.domain(act.map(function(d) {
        return d.key;
    }));
    d3.selectAll(".axis")
        .attr("transform", function(d) {
            return "translate(" + getAxisPositionOnDrag(d) + ",0)";
        });
    d3.event.sourceEvent.stopPropagation();
}

/**
 * Called after a dragging axis is dropped. Moves the axis that has been dragged to its new correct position and
 * updates the data objects considering the new axes order.
 *
 * @param d {object} The attribute of the axis.
 */
function onDragEnded(d) {
    dragging = [];
    d3.select(this).transition().attr("transform", "translate(" + xScale(d.key) + ")");
    //all axes have been successfully rearranged, so it's time to redraw the data lines
    updateDataObjects(data);
}

/**
 * Helper function that returns the position of the attr-axis based on the horizontal xScale. If the axis for the
 * attribute in question is currently being dragged, the 'real' current position of the dragging axis is returned.
 *
 * @param attr {object} The attribute of the axis for which to get the x position
 * @returns {float} The position of the axis.
 */
function getAxisPositionOnDrag(attr) {
    let position = dragging[attr.key];
    return position !== undefined ? position : xScale(attr.key);
}

/**
 * Updates the points of the data lines instead of redrawing them completely. This function uses d3's smooth
 * transition()-effect and is used for adjusting the data lines after axes rearrangement etc.
 *
 * @param data
 */
function updateDataObjects(data) {
    let gapBetweenAxes = chartInnerWidth / (numberOfActiveAttributes - 1);
    d3.selectAll(".dataLine")
        .transition()
        .attr("d", function(d) {
            return getPathData(d)
        });
}

/**
 * Returns all attributes that are active.
 *
 * @return {Array} All attributes that are active.
 */
function getActiveAttributes() {
    return attributes.filter((a) => {
        return a.active;
    })
}

/**
 * Changes the color of all data lines according to the attribute and the chosen color scheme.
 *
 * @param attribute {object}
 */
function changeColorization(attribute) {
    if (attribute === lastCheckedAttribute) return;
    d3.selectAll("." + DATA_LINE).each((d, i, nodes) => {
        let node = d3.select(nodes[i]);

        node.classed("c_" + ((lastCheckedAttribute !== "none") ? colors[d[lastCheckedAttribute]] : "base"), false)

        node.classed("c_" + ((attribute !== "none") ? colors[d[attribute]] : "base"), true)
    });
    lastCheckedAttribute = attribute;
}

/**
 * Switches the ticks dircetion (domain) on the given axis through an attribute.
 *
 * @param attribute {object} The axis the ticks should be switched.
 */
function toggleInversion(attribute) {
    attribute.inverted = !attribute.inverted;
    // Change the direction of the domain.
    attribute.domain = attribute.domain.reverse();
    attribute.scale.domain(attribute.domain);

    redrawAxis(attribute);
    updateDataObjects(data);
    redrawBoxPlot(attribute);
}

/**
 * Redraws the axis with the given attribute
 * @param attribute {object} The attribute of the axis.
 */
function redrawAxis(attribute) {
    let axis = d3.select("#id_" + attribute.key);
    let text = axis.select("g").select(".label").remove();
    axis.select("g").remove();
    axis.insert("g", "g")
        .call(("axis" in attribute) ? attribute.axis.scale(attribute.scale) : yAxis.scale(attribute.scale))
        .append(function() {
            return text.node();
        });
    // TODO: What should happen with a brush if the axis is reverted.
    d3.select("#id_" + attribute.key + " .brush").call(brush.move, null);
}

Date.prototype.clone = function() {
    return new Date(this.getTime());
};

/**
 * Helper function to recalculate the chart size when necessary.
 */
function calculateChartWidthHeight() {
    chartOuterWidth = d3.select("#ChartContainer").style("width").replace("px", "");
    chartInnerWidth = chartOuterWidth - margin.right - margin.left;
    chartInnerHeight = chartOuterHeight - margin.top - margin.bottom;

    d3.select(".chart").attr("width", chartOuterWidth)
        .attr("height", chartOuterHeight);

    xScale.range([0, chartInnerWidth]);
}

function within(d, extent, dim) {
    return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1];
}

function getDimensionsWithActiveBrushes() {
    let dimensionsWithActiveBrushes = [];

    chart.selectAll(".axis:not(.hide)")
        .each(function(d) {
            let activeBrushes = [];
            d3.select(this).selectAll(".brush")
                .each(function(b) {
                    let brushSelection = d3.brushSelection(d3.select(this).node());
                    if (brushSelection !== null) activeBrushes.push(brushSelection);
                });
            if (activeBrushes.length > 0) {
                dimensionsWithActiveBrushes.push({ dimension: d, brushes: activeBrushes });
            }
        });

    return dimensionsWithActiveBrushes;
}

/**
 * This function checks whether a given dataLine is currently brushed because it crosses a brush selection rectangle on
 * every axis that has a currently active brush.
 * @param dataLine - the dataLine in question
 * @returns {boolean} - true if the dataLine is within brush selections, false otherwise
 */
function isDataLineWithinBrushSelections(dataLine) {
    let dimensionsWithActiveBrushes = getDimensionsWithActiveBrushes();

    chart.selectAll(".axis:not(.hide)")
        .each(function(d) {
            let activeBrushes = [];
            d3.select(this).selectAll(".brush")
                .each(function(b) {
                    let brushSelection = d3.brushSelection(d3.select(this).node());
                    if (brushSelection !== null) activeBrushes.push(brushSelection);
                });
            if (activeBrushes.length > 0) {
                dimensionsWithActiveBrushes.push({ dimension: d, brushes: activeBrushes });
            }
        });

    let isLineWithinBrush = !(brushMode === "or" || brushMode === "nor");
    dimensionsWithActiveBrushes.forEach(function(dimWithActiveBrushes) {
        let withInForCurrentDim = false;
        dimWithActiveBrushes.brushes.forEach(function(active) {
            let withInForCurrentSelection = within((dimWithActiveBrushes.dimension.type.key === "Time" &&
                    !(dimWithActiveBrushes.dimension.key === "date")) ?
                getTransformedDate(dataLine, dimWithActiveBrushes.dimension) :
                dataLine[dimWithActiveBrushes.dimension.key], active, dimWithActiveBrushes.dimension);
            withInForCurrentDim = withInForCurrentDim || withInForCurrentSelection;
        });
        if (brushMode === "or" || brushMode === "nor") {
            isLineWithinBrush = isLineWithinBrush || withInForCurrentDim;
        } else {
            isLineWithinBrush = isLineWithinBrush && withInForCurrentDim;
        }

    });
    return (brushMode === "nand" || brushMode === "nor") ? !isLineWithinBrush : isLineWithinBrush;
}

function dataKeepExtract(keep) {
    currentlyBrushed = 0;
    if (selectedObjects !== 0) return;
    let newSelection = ((selection.length === 0) ? data : selection).filter(function(d) {
        return isDataLineWithinBrushSelections(d) === keep;
    });

    if (newSelection.length === 0 || newSelection.length === data.length) return;

    //Big ass function - calculates the difference between selection/data and newSelection
    updateHistory((keep) ? "keep" : "extract", ((selection.length === 0) ? data : selection).filter((d) => {
        return !newSelection.some((n) => {
            return n.id === d.id;
        });
    }));

    //adjust the scales of the axis to the new dataset
    updateScaleDomains(newSelection);
    drawDataObjects(selection = newSelection);

    d3.selectAll(".axis:not(.hide) .brush").each((d, i, nodes) => {
        let thisBrush = d3.select(nodes[i]);
        if (thisBrush.classed("activeBrushing")) {
            thisBrush.call(brush.move, null);
        } else {
            thisBrush.call(brush.move, null).remove();
        }
    });

    return newSelection;
}

function updateScaleDomains(dataset) {
    attributes.forEach(function(attribute) {
        if (attribute.type === types.Time && !(attribute.key === "date")) {
            attribute.domain = attribute.type.extent(dataset.map(function(d) {
                return getTransformedDate(d, attribute);
            }));
        } else {
            attribute.domain = attribute.type.extent(dataset.map(function(d) {
                return d[attribute.key];
            }));
            if(attribute.key === "day") {
                let newDomain = attribute.domain;
                // Get the correct start value for the calculation.
                attribute.domain = attribute.defaultDomain.slice(0);
                if (attribute.inverted) {
                    attribute.domain.reverse();
                }
                for (let d of attribute.defaultDomain) {
                    // Remove the data value if its not in the data line set.
                    if (!newDomain.includes(d)) {
                        attribute.domain.splice(attribute.domain.indexOf(d), 1);
                    }
                }
            }
        }

        if (attribute.inverted) {
            attribute.domain = attribute.domain.reverse();
        }
        if (!("scale" in attribute)) {
            attribute.scale = attribute.type.defaultScale.copy();
        }
        attribute.scale.domain(attribute.domain);
        redrawAxis(attribute);
        redrawBoxPlot(attribute);
    });
}

function updateHistory(type, data) {
    history.push({
        type: type,
        data: data //data.map((d) => {return d.id;})
    });
}

function historyGoBack() {
    currentlyBrushed = 0;
    if (history.length === 0) return false;
    let step = history.pop();
    if (step.type === "keep" || step.type === "extract") {
        selection = selection.concat(step.data);
        updateScaleDomains(selection);
        drawDataObjects(selection);
    }
    return true;
}

function fillDoD(datum, s) {
    // This will remove previous tooltip functionality
    $('.tooltipped').tooltip('remove');
    $('div.toolTip').remove();

    ["person", "day", "date", "wokeUp", "wentToSleep", "lunchWhen", "lunchWhat", "lunchWhere", "alcohol", "doors", "stairs", "streets", "kilometer", "moneySpent", "contactPeople", "happiness", "colorTop"].forEach((a) => {
        let content;
        if (a === "date") {
            let date = new Date(datum[a]);
            content = ordinal_suffix_of(date.getDate()) + " " + monthNames[date.getMonth()];
        } else if (a === "wokeUp" || a === "wentToSleep" || a === "lunchWhen") {
            content = (datum[a] === "none") ? "none" : formatAMPM(new Date(datum[a]));
        } else if (a === "happiness") {
            let sentiment;
            if (datum[a] < 2.5) sentiment = "sentiment_very_dissatisfied";
            else if (datum[a] >= 2.5 && datum[a] < 5) sentiment = "sentiment_dissatisfied";
            else if (datum[a] === 5) sentiment = "sentiment_neutral";
            else if (datum[a] > 5 && datum[a] <= 7.5) sentiment = "sentiment_satisfied";
            else if (datum[a] > 7.5) sentiment = "sentiment_very_satisfied";
            content = `<i class="material-icons tooltipped" data-delay="30" data-tooltip="${datum[a]}">${sentiment}</i>`;
        }

        document.getElementById(a + s).innerHTML = content || datum[a];
    });

    $(document).ready(function() {
        $('.tooltipped').tooltip({ delay: 50 });
    });

    dataPlot[s][0].value = new Date(datum.timeInUniversity).getHours() * 60 + new Date(datum.timeInUniversity).getMinutes();
    dataPlot[s][1].value = new Date(datum.timeWorked).getHours() * 60 + new Date(datum.timeWorked).getMinutes();
    dataPlot[s][2].value = new Date(datum.timePhone).getHours() * 60 + new Date(datum.timePhone).getMinutes();
    dataPlot[s][3].value = new Date(datum.timePc).getHours() * 60 + new Date(datum.timePc).getMinutes();
    dataPlot[s][4].value = (datum.wokeUp - ((data[datum.id - 1]) ? data[datum.id - 1].wentToSleep : new Date(datum.wokeUp).setHours(0, 0))) / 60000;
    dataPlot[s][5].value = new Date(datum.timeSport).getHours() * 60 + new Date(datum.timeSport).getMinutes();
    RadarChart.draw("#chart2", dataPlot, config);
}

d3.select("#btn_historyback").on("click", (e) => {
    if (historyGoBack()) {
        Materialize.toast('Undone', 3000, 'rounded');
    }
});

d3.select("#btn_keep").on("click", (e) => {
    if (dataKeepExtract(true)) {
        Materialize.toast(currentlyBrushed + ' lines kept', 3000, 'rounded');
    }
});

d3.select("#btn_extract").on("click", (e) => {
    if (dataKeepExtract(false)) {
        Materialize.toast(currentlyBrushed + ' lines extracted', 3000, 'rounded');
    }
});

d3.select("#btn_resetview").on("click", (e) => {
    d3.selectAll(".axis:not(.hide) .brush").each((d, i, nodes) => {
        let thisBrush = d3.select(nodes[i]);
        if (thisBrush.classed("activeBrushing")) {
            thisBrush.call(brush.move, null);
        } else {
            thisBrush.call(brush.move, null).remove();
        }
    });

    if (selection.length === 0 || selection.length === data.length) return;
    selection = [];
    drawDataObjects(data);
    history = [];


});

d3.select("#opac-overlay").on("click", function(e) {
    clearInterval(helpTimer);
    helpCounter++;
    switchHelpers();
    helpTimer = setInterval(() => {
        switchHelpers();
        helpCounter++;
    }, 5000);

});

d3.select("#test").on("click", function(e) {
    d3.selectAll("#id_wentToSleep .brush").call(brush.move, null);
});

function getTransformedDate(d, a) {
    let date = new Date(d[(a.key)]);
    return ((date.getDate() === new Date(d.date).getDate()) ? date.setDate(1) : date.setDate(2));
}

function ordinal_suffix_of(i) {
    let j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}

let monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}
