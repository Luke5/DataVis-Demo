/**
 * Created by marc on 21.06.2017.
 */

"use strict";

const AXIS_OVERLAY = "axisOverlay";

const AXIS_OVERLAY_INITIAL_TIMEOUT = 3000;
const AXIS_OVERLAY_MOUSE_LEAVE_TIMEOUT = 500;

/**
 * Draws the default axis overlay.
 */
function drawAxisOverlay() {
    axisOverlay = d3.select(".container").append("div")
        .attr('pointer-events', 'none')
        .attr("class", AXIS_OVERLAY + " blue-grey lighten-1")
        .property("key", null)
        .property("timeOutCall", null)
        .classed("hide", true)
        .on("mouseenter", onAxisOverlayMouseEnter)
        .on("mouseleave", onAxisOverlayMouseLeave);

    let boxplotDiv = axisOverlay.append("div");
    boxplotDiv.append("input")
        .attr("type", "checkbox")
        .attr("id", "boxplot_checkbox")
        .property("checked", false)
        .on("click", onBoxPlotCheckboxClicked);
    boxplotDiv.append("label")
        .text("Boxplot")
        .attr("for", "boxplot_checkbox");

    let tickInversionDiv = axisOverlay.append("div");
    tickInversionDiv.append("input")
        .attr("type", "checkbox")
        .attr("id", "inversion_checkbox")
        .property("checked", false)
        .on("click", onInversionCheckboxClicked);
    tickInversionDiv.append("label")
        .text("Invert")
        .attr("for", "inversion_checkbox");

    let deactivationDiv = axisOverlay.append("div");
    deactivationDiv.append("a")
        .attr("class", "waves-effect waves-light blue-grey darken-3 btn btn-small")
        .attr("id", "deactivation_button")
        .text("Hide")
        .on("click", onDeactivationButtonClicked);
}

/**
 * Called when a label of an axis was clicked.
 */
function onAxisLabelClicked() {
    let axisKey = d3.select(this).property("key");
    // Only draw the overlay for one axis once.
    if (axisOverlay.property("key") === axisKey && !axisOverlay.classed("hide")) {
        return
    }
    // Reset the time out method.
    clearTimeout(axisOverlay.property("timeOutCall"));

    let offset = [8, 8];
    let pos = d3.mouse(document.body);
    let chartRect = chart.node().getBoundingClientRect();
    // Set a new offset if the hover object would be outside of the chart svg. Its necessary to use the margin.
    if (pos[0] + offset[0] + +axisOverlay.attr("width") > chartRect.width + chartRect.left) {
        offset = [-offset[0] - (+axisOverlay.attr("width")), offset[1]];
    }
    if (pos[1] + offset[1] + +axisOverlay.attr("height") > chartRect.height + chartRect.top) {
        offset = [offset[0], -offset[1] - (+axisOverlay.attr("height"))];
    }
    let newPos = [pos[0] + offset[0], pos[1] + offset[1]];

    let attribute = attributes.find((a) => {return a.key === axisKey;});
    // Set the axis overlay attributes.
    axisOverlay
        .property("key", axisKey)
        .classed("hide", false)
        .style("left", newPos[0] + "px")
        .style("top", newPos[1] + "px");
    // Set the boxplot checkbox.
    let boxplot = d3.select("#id_" + axisKey + " ." + BOXPLOT);
    let boxplotCheckboxValue = !(boxplot.empty() || boxplot.classed("hide"));
    let boxplotActivation = attribute.type === types.String || attribute.key === "date";
    axisOverlay.select("#boxplot_checkbox")
        .property("checked", boxplotCheckboxValue)
        .property("disabled", boxplotActivation);
    // Set the inversion checkbox.
    axisOverlay.select("#inversion_checkbox")
        .property("checked", attribute.inverted);
    // Set the deactivation button.
    axisOverlay.select("#deactivation_button").classed("disabled", numberOfActiveAttributes <= MIN_AXIS_COUNT);

    // Set a time out to check if the axis overlay is used.
    let timeOutCall = setTimeout(checkAxisOverlayActivity, AXIS_OVERLAY_INITIAL_TIMEOUT, axisKey);
    axisOverlay.property("timeOutCall", timeOutCall)
}

/**
 * Checks if the axis overlay is currently used. If not hide it again.
 */
function checkAxisOverlayActivity(axisKey) {
    if (axisOverlay.classed("hide")) {
        return;
    }
    if (axisOverlay.property("key") !== axisKey) {
        return;
    }

    axisOverlay.classed("hide", true);
}

/**
 * Called if the mouse entered the axis overlay.
 */
function onAxisOverlayMouseEnter() {
    if (axisOverlay.classed("hide")) {
        return;
    }

    // Delete the last time out call.
    clearTimeout(axisOverlay.property("timeOutCall"));
}

/**
 * Called if the mouse leaved the axis overlay.
 */
function onAxisOverlayMouseLeave() {
    if (axisOverlay.classed("hide")) {
        return;
    }

    // Set a time out to check if the axis overlay is used.
    let timeOutCall = setTimeout(checkAxisOverlayActivity, AXIS_OVERLAY_MOUSE_LEAVE_TIMEOUT, axisOverlay.property("key"));
    axisOverlay.property("timeOutCall", timeOutCall);
}

/**
 * Called when the checkbox for the box plot was clicked.
 */
function onBoxPlotCheckboxClicked() {
    let axisKey = axisOverlay.property("key");
    let attribute = attributes.find((a) => {return a.key === axisKey;});

    toggleBoxplot(attribute);
}

/**
 * Called when the checkbox for the axis tick inversion was clicked.
 */
function onInversionCheckboxClicked() {
    let axisKey = axisOverlay.property("key");
    let attribute = attributes.find((a) => {return a.key === axisKey;});

    toggleInversion(attribute);
}

/**
 * Called when the deactivation button was clicked.
 */
function onDeactivationButtonClicked() {
    let axisKey = axisOverlay.property("key");
    let axisCheckbox = d3.select("#" + axisKey + "_checkbox");

    axisOverlay.classed("hide", true);
    // Set the checkbox and start the method to deactivate an axis.
    axisCheckbox.property("checked", !axisCheckbox.property("checked"));
    axisCheckbox.on("click").apply(axisCheckbox.node());
}