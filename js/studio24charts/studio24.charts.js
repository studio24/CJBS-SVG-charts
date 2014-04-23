var Studio24 = Studio24 || {};

/**
 * Studio 24 Charting Library
 *
 * @author George Mickleburgh <george.mickleburgh@studio24.net>
 */
Studio24.Charts = function()
{
    /**
     * Store the object parsed from the JSON given in the config file
     *
     * @var Object
     */
    var colours;

    /**
     * An array of methods which need to be called once everything is initialised
     *
     * @var Object
     */
    var invokeQueue = [];

    /**
     * Initialise all of the configuration options
     *
     * @param config
     */
    var init = function(config)
    {
        // Colour Scheme
        if (config.colourScheme != null) {
            // Load the colour scheme json from the file
            d3.json(config.colourScheme, function(error, json) {
                if (error) return console.warn(error);
                else {
                    // Set the colours to the returned object
                    colours = json;

                    // Now we can process the function queue
                    invokeFunctions();
                }
            });
        }
    }

    /**
     * Process the function queue once callbacks have been made and
     * everything is initialised
     */
    var invokeFunctions = function()
    {
        // Loop through function list
        for (var i = 0; i < invokeQueue.length; i++) {
            // Treat each item in the list as a function and call it directly
            (invokeQueue[i])();
        }

        // Null the invoke queue
        invokeQueue = [];
    }

    /**
     * Add a function to the queue, with parameters
     *
     * @param fn The function to add
     * @param params An array of arguments
     */
    var prepareForQueue = function(fn, params)
    {
        return function() {
            fn.apply(this, params);
        };
    }

    /**
     * Set the default values of an array if certain keys are
     * currently undefined. Will work on up to 2 levels of arrays
     *
     * @param arr
     * @param defaults
     */
    var setDefaults = function(arr, defaults)
    {
        arr = arr || {};

        // Loop through the properties in the defaults
        for (var property in defaults) {
            // Check if the the property is undefined
            if (arr && (typeof arr[property] == 'undefined' || defaults[property] instanceof Array)) {
                // Check if the property is an array
                if (defaults[property] instanceof Array) {
                    // Loop through each array element
                    for (var p in defaults[property]) {
                        if (arr[property] && typeof arr[property][p] == "undefined") {
                            // Fill in the default value if it was undefined
                            arr[property][p] = defaults[property][p];
                        }
                    }
                } else {
                    // Fill in the default value if it was undefined
                    arr[property] = defaults[property];
                }
            }
        }

        return arr;
    }

    /**
     * Horizontal Bar Chart
     *
     * @param container
     * @param jsonUrl
     * @param options
     */
    var createHorizontalBarChart = function(container, jsonUrl, options)
    {
        // Check for requirements and add to the queue if it is not yet ready
        if (typeof(colours) == "undefined") {
            invokeQueue.push(prepareForQueue(createHorizontalBarChart, [container, jsonUrl, options]));
            return;
        }

        // Set default values
        options = setDefaults(options, {
            width : 700,
            height: 400
        });

        // Prepare the config for being passed to the anonymous function
        var config = {
            container : container,
            options : options
        };

        // Get the JSON dataset
        d3.json(jsonUrl, function(error, dataset) {
            if (error) return console.warn(error);
            else {
                var width = options.width;
                var height = options.height;
                var barWidth = width - 200;

                // Get the SVG object
                var svg = d3.select(config.container)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);

                // Get the max data values
                var maxValue = 0;
                for (var x = 0; x < dataset.length; x++) {
                    // If the new value is higher than the old one, it is now the maxValue
                    if (dataset[x]['value'] > maxValue) {
                        maxValue = dataset[x]['value'];
                    }
                }

                // Append the title
                svg.append('text')
                    .attr('x', 0)
                    .attr('y', 30)
                    .attr('font-size', '32px')
                    .text('Sectors');

                // Loop through the data
                for (var i = 0; i < dataset.length; i++) {
                    // Draw container
                    var container = svg.append('g')
                        .attr('transform', 'translate(' + 0 + ', ' + (i * 40 + 70) + ')');

                    // Bar label
                    container.append('text')
                        .attr('font-style', 'italic')
                        .text(dataset[i]['key']);

                    // Bar
                    container.append('rect')
                        .attr('width', 0)
                        .attr('height', 30)
                        .attr('x', 100)
                        .attr('y', -20)
                        .attr('fill', colours.primary.colour)
                        .transition()
                        .duration(1000)
                        .attr('width', (barWidth / maxValue) * dataset[i]['value']);

                    // Bar value text
                    container.append('text')
                        .attr('font-style', 'italic')
                        .attr('fill', colours.primary.font)
                        .attr('y', 0)
                        .attr('x', 100)
                        .transition()
                        .duration(1000)
                        .attr('x', ((barWidth / maxValue) * dataset[i]['value']) + 70)
                        .text(dataset[i]['value']);
                }
            }
        });
    }

    /**
     * Column based horizontal bar chart
     *
     * @param container
     * @param jsonUrl
     * @param options
     */
    var createHorizontalColumnsBarChart = function(container, jsonUrl, options)
    {

    }

    /**
     * Create a Pie Chart
     *
     * @param container
     * @param jsonUrl
     * @param options
     */
    var createPieChart = function(container, jsonUrl, options)
    {
        // Check for requirements and add to the queue if it is not yet ready
        if (typeof(colours) == "undefined") {
            // Add this method to the queue with its parameters applied
            invokeQueue.push(prepareForQueue(createPieChart, [container, jsonUrl, options]));
            return;
        }
    }

    /**
     * Create a pie chart with a layer for each element of data
     *
     * @param container
     * @param jsonUrl
     * @param options
     */
    var createLayeredPieChart = function(container, jsonUrl, options)
    {
        // Check for requirements and add to the queue if it is not yet ready
        if (typeof(colours) == "undefined") {
            // Add this method to the queue with its parameters applied
            invokeQueue.push(prepareForQueue(createLayeredPieChart, [container, jsonUrl, options]));
            return;
        }

        // Set default values
        options = setDefaults(options, {
            width : 750,
            height: 500,
            title: "",
            showInactive: true
        });

        // Get the data colour scheme
        var colourScheme = colours[options.colours];

        // Prepare the config for being passed to the anonymous function
        var config = {
            container : container,
            options : options
        };

        // Get the JSON dataset
        d3.json(jsonUrl, function(error, dataset) {
            if (error) return console.warn(error);
            else {
                var width = options.width;
                var height = options.height;
                var barRadius = (height/5) / dataset.length;

                // Keep tau (T) for working out angles (2pi)
                var T = 2 * Math.PI;

                // Get the SVG object
                var svg = d3.select(config.container)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);

                // Create a container for the main pie chart
                var container = svg.append("g")
                    .attr("transform", "translate(" + (height / 2) + "," + height / 2 + ")");

                // Create a container for the legend
                var legendContainer = svg.append("g")
                    .attr("transform", "translate(" + (width - 230) + "," + 50 + ")");

                // Add the text to the middle, and call the wrap function
                container.append('text')
                    .attr('font-style', 'italic')
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '30px')
                    .attr('fill', '#414141')
                    .attr('y', 0)
                    .attr('dy', 0)
                    .text(options.title)
                    .call(wrap, 200);

                var maxValue = getTotalValue(dataset);
                var currentColor = 1;
                for (var i = 0; i < dataset.length; i++) {
                    var value = dataset[i]['value'];

                    // Initiate the arc for drawing the bars
                    var arc = d3.svg.arc()
                        .innerRadius(height / 2 - barRadius - (i*barRadius))
                        .outerRadius(height / 2 - (i*barRadius))
                        .startAngle(0);

                    if (options.showInactive) {
                        // Greyed pie bar
                        container.append("path")
                            .datum({endAngle: T})
                            .style("fill", colourScheme[currentColor].inactive)
                            .attr("d", arc);
                    }

                    // Colour pie bar
                    container.append("path")
                        .datum({endAngle: 0})
                        .style("fill", colourScheme[currentColor].colour)
                        .attr("d", arc)
                        .transition()
                        .duration(1000)
                        .call(arcTween, (T / maxValue) * value, arc);

                    // Legend circles
                    legendContainer.append("circle")
                        .attr('r', 10)
                        .attr('cx', 0)
                        .attr('cy', i * 40)
                        .attr('fill', colourScheme[currentColor].colour);

                    // Legend text
                    legendContainer.append("text")
                        .attr('font-style', 'italic')
                        .attr('font-size', '18px')
                        .attr('fill', '#414141')
                        .attr('x', 25)
                        .attr('y', 6 + i * 40)
                        .text(dataset[i]["key"]);

                    // Increment the colour and check if we have any more colours
                    currentColor++;
                    if (typeof colourScheme[currentColor] == "undefined") currentColor = 1;
                }
            }
        });
    }

    /**
     * Get the max value for an object in the format:
     *
     * [
     *     { key : "x", value : "10" },
     *     { key : "y", value:  "12"}
     * ]
     *
     * @param object
     * @returns number
     */
    var getMaxValue = function(object)
    {
        var maxValue = 0;
        // Loop through the object and check each value to see if it
        // is higher than the last one
        for (var x = 0; x < object.length; x++) {
            console.log(object[x]['value'], maxValue);
            // If the new value is higher than the old one, it is now the maxValue
            if (parseInt(object[x]['value']) > maxValue) {
                maxValue = object[x]['value'];
            }
        }

        return maxValue;
    }

    /**
     * Get the total value for an object in the format:
     *
     * [
     *     { key : "x", value : "10" },
     *     { key : "y", value:  "12"}
     * ]
     *
     * @param object
     * @returns number
     */
    var getTotalValue = function(object)
    {
        var totalValue = 0;
        // Loop through all values and add them together
        for (var i = 0; i < object.length; i++) {
            totalValue += parseInt(object[i]['value']);
        }

        return totalValue;
    }

    /**
     * Arc tween function from d3 docs. I have modified it
     * to pass the arc object in from where it is called
     * http://bl.ocks.org/mbostock/5100636
     *
     * @param transition
     * @param newAngle
     * @param arc
     */
    var arcTween = function(transition, newAngle, arc) {
        transition.attrTween("d", function(d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);

            return function(t) {
                d.endAngle = interpolate(t);
                return arc(d);
            };
        });
    }

    /**
     * Wrap text elements onto multiple lines based on the width
     * passed to the function.
     *
     * @param text
     * @param width
     */
    var wrap = function(text, width) {
        text.each(function() {
            // Prepare lots of variables to replace the text with multiple
            // lines in the correct positions
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y") || 0,
                dy = parseFloat(text.attr("dy")) || 0,
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            // Loop through all words and check whether they need to be pushed
            // to the next line
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                // Check if the width is higher than the allowed width
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }



    /**
     * Set the location of the colour scheme to another file and populate
     * the colour scheme object with its contents
     *
     * @param jsonUrl
     */
    var setColourScheme = function(jsonUrl)
    {
        // Load the colour scheme json from the file
        d3.json(jsonUrl, function(error, json) {
            if (error) return console.warn(error);
            else {
                // Set the colours to the returned object
                colours = json;
            }
        });
    }

    /**
     * An object containing all publicly accessible variables and functions.
     * They are accessed externally from the key in the object. Example:
     *
     * init: someInitFunction
     *
     * would be called with Studio24.Charts.init()
     *
     * @var
     */
    var public = {
        init: init,
        createHorizontalBarChart: createHorizontalBarChart,
        createHorizontalColumnsBarChart: createHorizontalColumnsBarChart,
        createPieChart: createPieChart,
        createLayeredPieChart: createLayeredPieChart,
        setColourScheme: setColourScheme
    }

    return public;
}();