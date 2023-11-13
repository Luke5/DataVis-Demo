/**
 * Created by marc on 21.06.2017.
 */

"use strict";

const BOXPLOT = "boxplot";

const BOXPLOT_WHISKER_RANGE = 0.8;
const BOXPLOT_WIDTH = 10;
const BOXPLOT_LINE_WIDTH = 3;
const BOXPLOT_MIN_DATA_COUNT = 5;

/** *
 * Draws a new boxplot on the given attribute axis. If a boxplot for this axis was already drawn, delete it.
 *
 * @param attribute {object} The attribute the box plot should be created from.
 * @returns {selection} The newly created boxplot. If the creation wasn't allowed: empty selection.
 */
function drawBoxplot(attribute) {
    // Only allow active attributes and those with no string type to be drawn.
    if (!attribute.active || attribute.type.key === "String") {
        return d3.select();
    }

    //let axis = findAxisWithID(attribute.key);
    let axis = d3.select("#id_" + attribute.key);
    if (axis.empty()) {
        return d3.select();
    }

    // If a boxplot for this axis was already drawn, delete it.
    axis.select("." + BOXPLOT).remove();
    let boxplot = axis.append("g")
        .attr("class", BOXPLOT)
        .attr("attributeKey", attribute.key);


    // Get all data from the data lines and sort it.
    let dataValues = [];
    chart.selectAll("." + DATA_LINE)
        .each(function (d) {
            if (d3.select(this).classed("colored")) {
                let data = d[attribute.key];
                if (attribute.type === types.Time) {
                    data = getTransformedDate(d, attribute);
                }
                dataValues.push(data);
            }
        });
    // Only draw a boxplot if enough elements are there.
    if (dataValues.length < BOXPLOT_MIN_DATA_COUNT) {
        return boxplot;
    }
    if (!attribute.inverted) {
        dataValues.sort(function (a, b) {
            return a - b;
        });
    }
    else {
        dataValues.sort(function (a, b) {
            return b - a;
        });
    }

    let boxplotValues = calculateBoxplotValues(dataValues, attribute);
    // Check if a boxplot can be drawn.
    for (let value in boxplotValues) {
        if (isNaN(boxplotValues[value])) {
            return boxplot;
        }
    }

    // Draw the boxplot.
    boxplot
        .attr("height", boxplotValues.lowerWhiskerPos - boxplotValues.upperWhiskerPos + BOXPLOT_LINE_WIDTH)
        .property("upperWhiskerValue", boxplotValues.upperWhiskerValue)
        .property("lowerWhiskerValue", boxplotValues.lowerWhiskerValue);
    boxplot.append("rect")
        .attr("class", "whiskerLine")
        .attr("transform", "translate(" + (-BOXPLOT_LINE_WIDTH / 2) + "," + boxplotValues.upperWhiskerPos + ")")
        .attr("width", BOXPLOT_LINE_WIDTH)
        .attr("height", (boxplotValues.lowerWhiskerPos - boxplotValues.upperWhiskerPos));
    boxplot.append("rect")
        .attr("class", "whisker")
        .attr("transform", "translate(" + (-BOXPLOT_WIDTH / 2) + "," + (boxplotValues.upperWhiskerPos - BOXPLOT_LINE_WIDTH / 2) + ")")
        .attr("width", BOXPLOT_WIDTH)
        .attr("height", BOXPLOT_LINE_WIDTH);
    boxplot.append("rect")
        .attr("class", "whisker")
        .attr("transform", "translate(" + (-BOXPLOT_WIDTH / 2) + "," + (boxplotValues.lowerWhiskerPos - BOXPLOT_LINE_WIDTH / 2) + ")")
        .attr("width", BOXPLOT_WIDTH)
        .attr("height", BOXPLOT_LINE_WIDTH);
    boxplot.append("rect")
        .attr("class", "boxBackground")
        .attr("transform", "translate(" + (-BOXPLOT_WIDTH / 2) + "," + boxplotValues.upperBoxPos + ")")
        .attr("width", BOXPLOT_WIDTH)
        .attr("height", (boxplotValues.lowerBoxPos - boxplotValues.upperBoxPos));
    boxplot.append("rect")
        .attr("class", "box")
        .attr("transform", "translate(" + (-BOXPLOT_WIDTH / 2) + "," + boxplotValues.upperBoxPos + ")")
        .style("stroke-width", BOXPLOT_LINE_WIDTH)
        .attr("width", BOXPLOT_WIDTH)
        .attr("height", (boxplotValues.lowerBoxPos - boxplotValues.upperBoxPos));
    boxplot.append("rect")
        .attr("class", "median")
        .attr("transform", "translate(" + (1 - BOXPLOT_WIDTH / 2) + "," + (boxplotValues.medianPos - BOXPLOT_LINE_WIDTH / 2) + ")")
        .attr("width", BOXPLOT_WIDTH - 2)
        .attr("height", BOXPLOT_LINE_WIDTH);

    // Get values from the normal ticks.
    let tickFontSize = parseInt(d3.select(".tick text").attr("font-size"));
    if (isNaN(tickFontSize)) {
        tickFontSize = parseInt(d3.select(".tick text").style("font-size"));
    }
    tickFontSize = !isNaN(tickFontSize) ? tickFontSize : 0;
    let tickDy = d3.select(".tick text").attr("dy");

    for (let key in boxplotValues) {
        // Only run every second loop.
        if (key.indexOf("Value") !== -1) {
            key = key.slice(0, -5);
        } else {
            continue;
        }

        let value = boxplotValues[key + "Value"];
        if (attribute.type === types.Time || attribute.type === types.Duration) {
            let date = new Date(value);
            if (attribute.type === types.Time) {
                value = formatAMPM(date).toUpperCase()
            }
            else {
                value = (date.getHours() >= 10 ? date.getHours() : "0" + date.getHours()) + ":" +
                    (date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes());
            }
        }
        if ("unit" in attribute) {
            value += " " + attribute["unit"];
        }
        // Add a new "tick" for the boxplot key values.
        let tick = boxplot.append("g")
            .attr("class", "tick");
        let label = tick.append("text")
            .text(value)
            .attr("x", -9)
            .attr("y", boxplotValues[key + "Pos"])
            .attr("dy", tickDy)
            .style("text-anchor", "end");
        // Only set a font size if one was found.
        if (tickFontSize !== 0) {
            label.style("font-size", tickFontSize + "px");
        }
    }

    // The brush should be always on the top.
    axis.select(".brush").raise();

    return boxplot;
}


/**
 * Caluclates all necessary values for a box plot.
 *
 * @param dataValues {Array.<Number>} The sorted array of all values for this box plot.
 * @param attribute {object} The attribute the box plot should be created from. *
 * @returns {object} The values for the box plot.
 */
function calculateBoxplotValues(dataValues, attribute) {
    let medianValue;
    let medianPos;
    let upperBoxValue;
    let upperBoxPos;
    let lowerBoxValue;
    let lowerBoxPos;
    let upperWhiskerValue;
    let lowerWhiskerValue = null;

    // Calculate the box and the median for the box plot.
    if (dataValues.length % 2 === 1) {
        medianPos = parseInt(dataValues.length / 2);
        upperBoxPos = Math.round(medianPos + dataValues.length / 4);
        lowerBoxPos = Math.round(medianPos - dataValues.length / 4);
        medianValue = dataValues[medianPos];
    } else {
        medianPos = dataValues.length / 2 - 0.5;
        upperBoxPos = Math.floor(medianPos + dataValues.length / 4);
        lowerBoxPos = Math.ceil(medianPos - dataValues.length / 4);
        medianValue = (dataValues[medianPos - 0.5] + dataValues[medianPos + 0.5]) / 2;
    }
    upperBoxValue = dataValues[upperBoxPos];
    lowerBoxValue = dataValues[lowerBoxPos];

    let offset = !attribute.inverted ? 1 : -1;
    let upperWhiskerSearchValue = Math.ceil(upperBoxValue + offset * (Math.abs(upperBoxValue - lowerBoxValue)) * BOXPLOT_WHISKER_RANGE);
    let lowerWhiskerSearchValue = Math.floor(lowerBoxValue - offset * (Math.abs(upperBoxValue - lowerBoxValue)) * BOXPLOT_WHISKER_RANGE);

    // Calculate the whiskers for the box plot.
    for (let i in dataValues) {
        if ((!attribute.inverted && lowerWhiskerValue === null && dataValues[i] >= lowerWhiskerSearchValue) ||
            (attribute.inverted && lowerWhiskerValue === null && dataValues[i] <= lowerWhiskerSearchValue)) {
            lowerWhiskerValue = dataValues[i];
        }
        if ((!attribute.inverted && dataValues[i] > upperWhiskerSearchValue) ||
            (attribute.inverted && dataValues[i] < upperWhiskerSearchValue)) {
            break;
        }
        upperWhiskerValue = dataValues[i];
    }

    // Return the y-values for the boxplot.
    return {
        upperWhiskerValue: upperWhiskerValue,
        upperWhiskerPos: attribute.scale(upperWhiskerValue),
        upperBoxValue: upperBoxValue,
        upperBoxPos: attribute.scale(upperBoxValue),
        medianValue: medianValue,
        medianPos: attribute.scale(medianValue),
        lowerBoxValue: lowerBoxValue,
        lowerBoxPos: attribute.scale(lowerBoxValue),
        lowerWhiskerValue: lowerWhiskerValue,
        lowerWhiskerPos: attribute.scale(lowerWhiskerValue)
    };
}

/**
 * It change the visibility of ticks of an axis, if a boxplot is on the axis.
 * This method should only be called if the "hide" class of the boxplot was already set to its new value.
 *
 * @param attribute {object} The attribute the ticks, axis and boxplot ar coupled with.
 */
function changeTicksThroughBoxplot(attribute) {
    //let axis = findAxisWithID(attribute.key);
    let axis = d3.select("#id_" + attribute.key);
    if (axis.empty()) {
        return;
    }

    let boxplot = axis.select("." + BOXPLOT);
    if (!boxplot.empty() && !boxplot.classed("hide")) {
        // Hide the ticks, that are inside the boxplot.
        axis.select("g").selectAll(".tick")
            .each(function (d) {
                let tick = d3.select(this);
                let hide;
                if (!attribute.inverted) {
                    hide = boxplot.property("lowerWhiskerValue") <= d && d <= boxplot.property("upperWhiskerValue");
                }
                else {
                    hide = boxplot.property("upperWhiskerValue") <= d && d <= boxplot.property("lowerWhiskerValue");
                }
                tick.classed("hide", hide);
            });
    }
    else {
        // Reset all ticks, so that they are visible.
        axis.select("g").selectAll(".tick").classed("hide", false);
    }
}

/**
 * Toggles the boxplot on an axis given through the attribute.
 *
 * @param attribute {object} The attribute on that the boxplot is toggled.
 */
function toggleBoxplot(attribute) {
    let boxplot = d3.select("#id_" + attribute.key + " ." + BOXPLOT);

    if (boxplot.empty() || boxplot.classed("hide")) {
        drawBoxplot(attribute);
    }
    else {
        boxplot.classed("hide", true);
    }
    changeTicksThroughBoxplot(attribute);
}

/**
 * Redraws the boxplot from the given attribute.
 *
 * @param attribute {object} The attribute on that the boxplot is toggled.
 */
function redrawBoxPlot(attribute) {
    let boxplot = d3.select("#id_" + attribute.key + " ." + BOXPLOT);
    if (!boxplot.empty() && !boxplot.classed("hide")) {
        drawBoxplot(attribute);
        changeTicksThroughBoxplot(attribute);
    }
}