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
     * Create a standard vertical bar chart
     *
     * @param container
     * @param jsonUrl
     * @param options
     */
    var createBarChart = function(container, jsonUrl, options)
    {
        // Check for requirements and add to the queue if it is not yet ready
        if (typeof(colours) == "undefined") {
            invokeQueue.push(prepareForQueue(createBarChart, [container, jsonUrl, options]));
            return;
        }

        // Set default values
        options = setDefaults(options, {
            width : 700,
            height: 400,
            title: '',
            description: ''
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

                var svg = d3.select(config.container)
                    .append('svg')
                    .attr('width', width + 50)
                    .attr('height', height + 250);

                // Accessible tags
                svg.append('title').text(options.title);
                svg.append('description').text(options.description);

                var key = function (d) {
                    return d.key;
                }

                var xScale = d3.scale.ordinal()
                    .domain(d3.range(dataset.length))
                    .rangeRoundBands([0, width], 0.05);

                var yScale = d3.scale.linear()
                    .domain([0, d3.max(dataset, function(d) {
                        return d.value;
                    })])
                    .range([height, 0]);

                var xAxisScale = d3.scale.ordinal()
                    .domain(dataset.map(function(d) {
                        return d.key;
                    }))
                    .rangeRoundBands([0, width], 0.05);

                var xAxis = d3.svg.axis()
                    .scale(xAxisScale)
                    .orient('bottom');

                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left')
                    .ticks(10);

                var rectGroup = svg.append('g')
                    .attr('transform', 'translate(' + 25 + ', ' + 25 + ')')
                    .attr('class', 'rect-group');

                var rects = svg.select('.rect-group')
                    .selectAll('rect')
                    .data(dataset, key)
                    .enter()
                    .append('rect')
                    .attr('class', 'bar');

                rects.attr('y', function (d) {
                        return height;
                    })
                    .attr('x', function (d,i) {
                        return xScale(i);
                    })
                    .attr('fill', '#E9008C')
                    .attr('width', xScale.rangeBand())
                    .attr('height', 0)
                    .on('mouseover', function (d) {
                        var bar = d3.select((this));
                        var x = parseInt(bar.attr('x'));
                        var y = parseInt(bar.attr('y'));
                        var width = bar.attr('width');
                        var height = bar.attr('height');

                        svg.select('.rect-group')
                            .append('text')
                            .attr('x', x + (width / 2))
                            .attr('y', y + 30)
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "14px")
                            .attr("fill", "white")
                            .style('text-anchor', 'middle')
                            .transition()
                            .duration(500)
                            .attr('class', 'hover-label')
                            .text(d.value);
                    })
                    .on('mouseout', function() {
                        d3.selectAll('.hover-label').remove();
                        d3.select((this)).transition().duration(500).style('fill', '#E9008C');
                    })
                    .transition()
                    .duration(1000)
                    .attr('y', function (d) {
                        return yScale(d.value);
                    })
                    .attr('height', function (d) {
                        return height - yScale(d.value);
                    });

                svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(' + 25 + ', ' + (height + 25 + 5) + ')')
                    .call(xAxis)
                    .selectAll('text')
                    .attr('font-size', '13px')
                    .style('text-anchor', 'end')
                    .attr('dx', '-.8em')
                    .attr('dy', '.15em')
                    .attr('transform', 'rotate(-65)');

                var gy = svg.append('g')
                    .attr('class', 'y axis')
                    .attr('transform', 'translate(' + 25 + ', ' + 25 + ')')
                    .call(yAxis);

                gy.selectAll("g").filter(function(d) { return d; })
                    .classed("minor", true);
            }
        });
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
            height: 300,
            legendWidth: 100,
            title: '',
            description: ''
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
                var legendWidth = options.legendWidth;
                var barWidth = width - legendWidth - 50;

                // Get the SVG object
                var svg = d3.select(config.container)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);

                // Accessible tags
                svg.append('title').text(options.title);
                svg.append('description').text(options.description);

                // Get the max data values
                var maxValue = getMaxValue(dataset);

                // Loop through the data
                for (var i = 0; i < dataset.length; i++) {
                    // Draw container
                    var container = svg.append('g')
                        .attr('transform', 'translate(' + 0 + ', ' + (i * 35 + 30) + ')');

                    // Bar label
                    container.append('text')
                        .attr('font-style', 'italic')
                        .text(dataset[i]['key']);

                    // Bar
                    container.append('rect')
                        .attr('width', 0)
                        .attr('height', 30)
                        .attr('x', legendWidth)
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
                        .attr('x', legendWidth)
                        .transition()
                        .duration(1000)
                        .attr('x', ((barWidth / maxValue) * dataset[i]['value']) + legendWidth - 30)
                        .text(dataset[i]['value']);
                }
            }
        });
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

        // Set the default options
        options = setDefaults(options, {
            width : 750,
            height: 500,
            legendWidth: 150,
            title: '',
            description: ''
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
                var legendWidth = options.legendWidth;
                var barRadius = 32;
                var chartDiameter = 320;

                // Keep tau (T) for working out angles (2pi)
                var T = 2 * Math.PI;

                dataset.sort(function(a, b) {
                    return parseInt(a.value,10) < parseInt(b.value,10);
                });

                // Get the SVG object
                var svg = d3.select(config.container)
                    .append('svg')
                    .attr('width', width + legendWidth)
                    .attr('height', height);

                // Accessible tags
                svg.append('title').text(options.title);
                svg.append('description').text(options.description);

                // Create a container for the main pie chart
                var container = svg.append("g")
                    .attr("transform", "translate(" + (height / 2) + "," + height / 2 + ")");

                // Create a container for the legend
                var legendContainer = svg.append("g")
                    .attr("transform", "translate(" + (width) + "," + (height - 10) + ")");

                // Add the text to the middle, and call the wrap function
                container.append('text')
                    .attr('font-style', 'italic')
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '19px')
                    .attr('fill', '#414141')
                    .attr('class', 'center-text')
                    .attr('y', -10)
                    .text(options.title)
                    .call(wrap, height / 3);

                var currentAngle = 0;
                var maxValue = getTotalValue(dataset);
                var currentColor = 1;
                for (var i = 0; i < dataset.length; i++) {
                    var value = dataset[i]['value'];

                    // Initiate the arc for drawing the bars
                    var arc = d3.svg.arc()
                        .innerRadius(chartDiameter / 2 - (2.3 * barRadius))
                        .outerRadius(chartDiameter / 2 - barRadius)
                        .startAngle(currentAngle)
                        .endAngle(currentAngle);

                    // Colour pie bar
                    container.append("path")
                        .datum({currentAngle: currentAngle, endAngle: currentAngle + (T / maxValue) * value, barRadius: barRadius})
                        .style("fill", colourScheme[currentColor].colour)
                        .attr("d", arc)
                        .attr('s_startAngle', currentAngle)
                        .attr('s_endAngle', currentAngle + (T / maxValue) * value)
                        .attr('height', height)
                        .attr('id', 'bar-'  + i)
                        .attr('value', value)
                        .on('mouseover', function() {
                            var $this = d3.select(this);
                            var startAngle = parseFloat($this.attr('s_startAngle'));
                            var endAngle = parseFloat($this.attr('s_endAngle'));
                            var id = $this.attr('id').split('-')[1];
                            var currentValue = $this.attr('value');

                            legendContainer.selectAll('g')
                                .transition()
                                .duration(0)
                                .style('opacity', '0.2');
                            legendContainer.select('#legend-' + id)
                                .transition()
                                .duration(500)
                                .style('opacity', '1');

                            d3.select(this).transition()
                                .duration(500)
                                .ease("elastic")
                                .attrTween("d", function(d) {
                                    var i = d3.interpolate(chartDiameter / 2 - barRadius, chartDiameter / 2 - barRadius + 15);
                                    var newArc = d3.svg.arc()
                                        .innerRadius(chartDiameter / 2 - (2.3 * barRadius))
                                        .outerRadius(i)
                                        .startAngle(startAngle)
                                        .endAngle(endAngle);

                                    return newArc;
                                });

                            container.select('.center-text')
                                .transition()
                                .duration(0)
                                .style('opacity', '0');

                            // Append data text to the center
                            container.append('text')
                                .attr('font-style', 'italic')
                                .attr('text-anchor', 'middle')
                                .attr('font-size', '40px')
                                .attr('y', 10)
                                .attr('fill', '#414141')
                                .attr('class', 'data-text')
                                .style('opacity', '1')
                                .text(currentValue);
                        })
                        .on('mouseout', function() {
                            var $this = d3.select(this);
                            var startAngle = $this.attr('s_startAngle');
                            var endAngle = $this.attr('s_endAngle');

                            container.select('.data-text')
                                .remove();
                            container.select('.center-text')
                                .transition()
                                .delay(0)
                                .duration(500)
                                .style('opacity', '1');

                            legendContainer.selectAll('g')
                                .transition()
                                .duration(500)
                                .style('opacity', '1');

                            var newArc = d3.svg.arc()
                                .innerRadius(chartDiameter / 2 - (2.3 * barRadius))
                                .outerRadius(chartDiameter / 2 - barRadius)
                                .startAngle(parseFloat(startAngle))
                                .endAngle(parseFloat(endAngle));

                            d3.select(this)
                                .transition()
                                .duration(100)
                                .attr('d', newArc);
                        })
                        .transition()
                        .delay(500 + i * 300)
                        .duration(300)
                        .ease('linear')
                        .attrTween('d', function(d) {
                            var currentAngle = d.currentAngle;
                            var endAngle = d.endAngle;
                            var barRadius = d.barRadius;
                            var i = d3.interpolate(currentAngle, endAngle);

                            var newArc = d3.svg.arc()
                                .innerRadius(chartDiameter / 2 - (2.3 * barRadius))
                                .outerRadius(chartDiameter / 2 - barRadius)
                                .startAngle(currentAngle)
                                .endAngle(i);

                            return newArc;
                        });

                    // Legend group
                    var legendItem = legendContainer.append('g')
                        .attr('id', 'legend-'  + i)
                        .attr('transform', 'translate(0, '+(-40 - (i * 30))+')')
                        .on('mouseover', function() {
                            var $this = d3.select(this);
                            var id = $this.attr('id').split('-')[1];
                            var bar = container.select('#bar-' + id);
                            var startAngle = parseFloat(bar.attr('s_startAngle'));
                            var endAngle = parseFloat(bar.attr('s_endAngle'));
                            var currentValue = bar.attr('value');

                            legendContainer.selectAll('g')
                                .transition()
                                .duration(0)
                                .style('opacity', '0.2');
                            $this.transition()
                                .duration(100)
                                .style('opacity', '1');

                            bar.transition()
                                .duration(500)
                                .ease("elastic")
                                .attrTween("d", function(d) {
                                    var i = d3.interpolate(chartDiameter / 2 - barRadius, chartDiameter / 2 - barRadius + 15);
                                    var newArc = d3.svg.arc()
                                        .innerRadius(chartDiameter / 2 - (2.3 * barRadius))
                                        .outerRadius(i)
                                        .startAngle(startAngle)
                                        .endAngle(endAngle);

                                    return newArc;
                                });

                            container.select('.center-text')
                                .transition()
                                .duration(0)
                                .style('opacity', '0');

                            // Append data text to the center
                            container.append('text')
                                .attr('font-style', 'italic')
                                .attr('text-anchor', 'middle')
                                .attr('font-size', '40px')
                                .attr('y', 10)
                                .attr('fill', '#414141')
                                .attr('class', 'data-text')
                                .style('opacity', '1')
                                .text(currentValue);
                        })
                        .on('mouseout', function() {
                            var $this = d3.select(this);
                            var id = $this.attr('id').split('-')[1];
                            var bar = container.select('#bar-' + id);
                            var startAngle = bar.attr('s_startAngle');
                            var endAngle = bar.attr('s_endAngle');

                            container.select('.data-text')
                                .remove();
                            container.select('.center-text')
                                .transition()
                                .delay(0)
                                .duration(500)
                                .style('opacity', '1');

                            legendContainer.selectAll('g')
                                .transition()
                                .duration(500)
                                .style('opacity', '1');

                            var newArc = d3.svg.arc()
                                .innerRadius(chartDiameter / 2 - (2.3 * barRadius))
                                .outerRadius(chartDiameter / 2 - barRadius)
                                .startAngle(parseFloat(startAngle))
                                .endAngle(parseFloat(endAngle));

                           bar.transition()
                               .duration(100)
                               .attr('d', newArc);
                        });

                    // Legend circles
                    legendItem.append("circle")
                        .attr('r', 5)
                        .attr('fill', '#fff')
                        .attr('stroke', colourScheme[currentColor].colour)
                        .attr('stroke-width', '4');

                    // Legend text
                    legendItem.append("text")
                        .attr('font-style', 'italic')
                        .attr('font-size', '16px')
                        .attr('fill', '#414141')
                        .attr('x', 25)
                        .attr('y', 6)
                        .text(dataset[i]["key"]);

                    // Increase the next angle
                    currentAngle = currentAngle + (T / maxValue) * value;

                    // Increment the colour and check if we have any more colours
                    currentColor++;
                    if (typeof colourScheme[currentColor] == "undefined") currentColor = 1;
                }
            }
        });
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
            legendWidth: 200,
            showInactive: true,
            title: '',
            description: ''
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
                var legendWidth = options.legendWidth;

                // Keep tau (T) for working out angles (2pi)
                var T = 2 * Math.PI;

                // Get the SVG object
                var svg = d3.select(config.container)
                    .append('svg')
                    .attr('width', width + legendWidth)
                    .attr('height', height);

                // Accessible tags
                svg.append('title').text(options.title);
                svg.append('description').text(options.description);

                // Create a container for the main pie chart
                var container = svg.append("g")
                    .attr("transform", "translate(" + (height / 2) + "," + height / 2 + ")");

                // Create a container for the legend
                var legendContainer = svg.append("g")
                    .attr("transform", "translate(" + width + "," + (height - 10) + ")");

                // Add the text to the middle, and call the wrap function
                container.append('text')
                    .attr('font-style', 'italic')
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '19px')
                    .attr('y', -10)
                    .attr('fill', '#414141')
                    .attr('class', 'center-text')
                    .text(options.title)
                    .call(wrap, height / 3);

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
                        .attr('value', value)
                        .attr('id', 'bar-' + i)
                        .on('mouseover', function() {
                            var $this = d3.select(this);
                            var currentValue = $this.attr('value');
                            var id = $this.attr('id').split('-')[1];

                            // Set the opacity of all bars to a lower value
                            container.selectAll('path')
                                .transition()
                                .duration(500)
                                .style('opacity', '0.2');

                            legendContainer.selectAll('g')
                                .transition()
                                .duration(500)
                                .style('opacity', '0.2');
                            legendContainer.select('#legend-' + id)
                                .transition()
                                .duration(500)
                                .style('opacity', '1');

                            // Set the opacity of the selected bar to one
                            $this.transition()
                                .duration(200)
                                .style('opacity', '1');

                            // Hide the center text
                            container.select('.center-text')
                                .transition()
                                .duration(0)
                                .style('opacity', '0');

                            // Append data text to the center
                            container.append('text')
                                .attr('font-style', 'italic')
                                .attr('text-anchor', 'middle')
                                .attr('font-size', '40px')
                                .attr('y', 10)
                                .attr('fill', '#414141')
                                .attr('class', 'data-text')
                                .style('opacity', '0')
                                .text(currentValue)
                                .transition()
                                .duration(200)
                                .style('opacity', '1');
                        })
                        .on('mouseout', function() {
                            // Reset everything on mouseout
                            container.selectAll('path')
                                .transition()
                                .duration(500)
                                .style('opacity', '1');
                            container.selectAll('.data-text').remove();
                            container.select('.center-text')
                                .transition()
                                .delay(100)
                                .duration(500)
                                .style('opacity', '1');
                            legendContainer.selectAll('g')
                                .transition()
                                .duration(500)
                                .style('opacity', '1');
                        })
                        .transition()
                        .delay(500)
                        .duration(2000)
                        .call(arcTween, (T / maxValue) * value, arc);

                    // Group for legend item
                    var legendItem = legendContainer.append('g')
                        .attr('id', 'legend-' + i)
                        .attr('transform', 'translate(0, ' + (-40 - (i * 30)) + ')')
                        .on('mouseover', function() {
                            var $this = d3.select(this);
                            var id = $this.attr('id').split('-')[1];
                            var bar = svg.select('#bar-' + id);
                            var currentValue = bar.attr('value');

                            // Set the opacity of all bars to a lower value
                            container.selectAll('path')
                                .transition().duration(500)
                                .style('opacity', '0.2');

                            // Set the legend opacity
                            legendContainer.selectAll('g')
                                .transition()
                                .duration(200)
                                .style('opacity', '0.2');
                            $this.transition()
                                .duration(100)
                                .style('opacity', '1');

                            // Set the opacity of the selected bar to one
                            bar.transition()
                                .duration(500)
                                .style('opacity', '1');

                            // Hide the center text
                            container.select('.center-text')
                                .transition()
                                .duration(0)
                                .style('opacity', '0');

                            // Append data text to the center
                            container.append('text')
                                .attr('font-style', 'italic')
                                .attr('text-anchor', 'middle')
                                .attr('font-size', '40px')
                                .attr('y', 10)
                                .attr('fill', '#414141')
                                .attr('class', 'data-text')
                                .style('opacity', '0')
                                .text(currentValue)
                                .transition()
                                .duration(200)
                                .style('opacity', '1');
                        })
                        .on('mouseout', function() {
                            // Reset everything on mouseout
                            container.selectAll('path')
                                .transition()
                                .duration(500)
                                .style('opacity', '1');
                            container.selectAll('.data-text').remove();
                            container.select('.center-text')
                                .transition()
                                .delay(100)
                                .duration(500)
                                .style('opacity', '1');
                            legendContainer.selectAll('g')
                                .transition()
                                .duration(500)
                                .style('opacity', '1');
                        });

                    // Legend circle
                    legendItem.append("circle")
                        .attr('r', 5)
                        .attr('fill', '#fff')
                        .attr('stroke', colourScheme[currentColor].colour)
                        .attr('stroke-width', '4');

                    // Legend text
                    legendItem.append("text")
                        .attr('font-style', 'italic')
                        .attr('font-size', '16px')
                        .attr('fill', '#414141')
                        .attr('x', 25)
                        .attr('y', 6)
                        .text(dataset[i]["key"]);

                    // Increment the colour and check if we have any more colours
                    // Loop back to the start if we have run out
                    currentColor++;
                    if (typeof colourScheme[currentColor] == "undefined") currentColor = 1;
                }
            }
        });
    }

    /**
     * Create a global map
     *
     * @param container
     * @param jsonUrl
     * @param options
     */
    var createMap = function(container, jsonUrl, options)
    {
        // Check for requirements and add to the queue if it is not yet ready
        if (typeof(colours) == "undefined") {
            // Add this method to the queue with its parameters applied
            invokeQueue.push(prepareForQueue(createMap, [container, jsonUrl, options]));
            return;
        }

        // Set the default values
        setDefaults(options, {
            width: 1020,
            legendWidth: 100,
            title: '',
            description: ''
        });

        var legendWidth = options.legendWidth;
        var width = options.width - legendWidth,
            height = options.width * 0.7;

        var svg = d3.select(container)
            .append('svg')
            .attr('width', width + legendWidth)
            .attr('height', height * 0.75);

        // Accessible tags
        svg.append('title').text(options.title);
        svg.append('description').text(options.description);

        var projection = d3.geo.mercator()
            .translate([(width - legendWidth) / 2, (height * 0.75) / 2])
            .scale((width - legendWidth) / 2 / Math.PI)
            .center([0,50]);
        var path = d3.geo.path()
            .projection(projection);

        d3.json(options.worldJson, function (json) {
            svg.append('path')
                .datum(topojson.feature(json, json.objects.land))
                .attr('class', 'map')
                .attr('d', path);

            var legendContainer = svg.append('g')
                .attr('transform', 'translate(' + (width - legendWidth)  + ', 0)');

            d3.csv(jsonUrl, function(error, data) {
                // Loop through the data to create the legend, as we need
                // access to the "i" value
                for (var i=1; i < data.length; i++) {
                    var currentData = data[i];

                    var container = svg.append('g')
                        .datum({place: currentData.place, number: currentData.number, lon: currentData.lon, lat: currentData.lat})
                        .on('mouseover', function(d, i) {
                            // Move the group to the front
                            this.parentNode.appendChild(this);
                        })
                        .attr('transform', function(d) {
                            return 'translate(' + (projection([d.lon, d.lat])[0]) + "," + (projection([d.lon, d.lat])[1]) + ')';
                        });
                    container
                        .append("path")
                        .datum({place: currentData.place, number: currentData.number, lon: currentData.lon, lat: currentData.lat})
                        .attr("cx", function(d) {
                            return projection([d.lon, d.lat])[0];
                        })
                        .attr("cy", function(d) {
                            return projection([d.lon, d.lat])[1];
                        })
                        .attr('id', 'marker-' + i)
                        .attr('d', 'M130,19.321C130,8.65,121.337,0,110.651,0S91.301,8.65,91.301,19.321c0,9.365,6.674,17.169,15.531,18.94 l3.805,3.799l3.8-3.794C123.31,36.507,130,28.696,130,19.321z')
                        .attr('transform', function(d) {
                            return 'translate(-108, -40)';
                        })
                        .attr("fill", "#E12B88")
                        .on('mouseover', function(d, i) {
                            var $this = d3.select(this);
                            var parent = d3.select(this.parentNode);
                            var person = parent.select('g');
                            var xPos = $this.attr('xPos');
                            var yPos = $this.attr('yPos');
                            var id = $this.attr('id').split('-')[1];
                            var legend = svg.select('#legend-' + id);

                            legendContainer.selectAll('g')
                                .transition()
                                .duration(300)
                                .style('opacity', '0.2');
                            legend.transition()
                                .duration(300)
                                .style('opacity', '1');

                            $this.transition(500)
                                .attr('transform', 'translate(-242, -90) scale(2.2)');

                            person.transition(200)
                                .attr('transform', 'translate(-35, -58) scale(1.5)');

                            // Add number text
                            parent.append('text')
                                .attr('x', 15)
                                .attr('y', -37)
                                .attr('font-style', 'italic')
                                .attr('font-size', '0px')
                                .attr('fill', '#ffffff')
                                .attr('text-anchor', 'middle')
                                .attr('pointer-events', 'none')
                                .text('x' + d.number)
                                .transition()
                                .delay(100)
                                .attr('font-size', '22px');

                            // Add location text
                            parent.append('text')
                                .attr('x', 0)
                                .attr('y', -100)
                                .attr('fill', '#333')
                                .attr('text-anchor', 'middle')
                                .attr('font-style', 'italic')
                                .attr('font-size', '0px')
                                .text(d.place)
                                .transition()
                                .delay(200)
                                .attr('font-size', '16px');
                        })
                        .on('mouseout', function(d, i) {
                            var $this = d3.select(this);
                            var parent = d3.select(this.parentNode);
                            var person = parent.select('g');
                            var xPos = $this.attr('xPos');
                            var yPos = $this.attr('yPos');

                            person.transition(200)
                                .attr('transform', 'translate(-7, -30) scale(1)');

                            $this.transition(500)
                                .attr('transform', function() {
                                    return 'translate(-108, -40)';
                                });

                            parent.selectAll('text').remove();

                            legendContainer.selectAll('g')
                                .transition()
                                .duration(300)
                                .style('opacity', '1');
                        });

                    var person = container.append('g')
                        .attr('transform', 'translate(-7, -30)');

                    person.append('circle')
                        .attr('r', '2')
                        .attr('cx', 10)
                        .attr('cy', 2)
                        .attr('pointer-events', 'none')
                        .attr('fill', '#ffffff');
                    person.append('path')
                        .attr('d', 'M59,21H41c-5.5,0-9.602,4.482-9.115,9.961l2.229,25.078c0.33,3.713,2.689,6.963,5.885,8.676V92  c0,4.4,3.6,8,8,8h4c4.4,0,8-3.6,8-8V64.715c3.196-1.713,5.556-4.963,5.886-8.676l2.229-25.078C68.602,25.482,64.5,21,59,21z')
                        .attr('transform', 'scale(0.2)')
                        .attr('pointer-events', 'none')
                        .attr('fill', '#ffffff');

                    var legendItem = legendContainer.append('g')
                        .attr('id', 'legend-' + i)
                        .attr('transform', 'translate(0, '+ (i * 30) +')')
                        .on('mouseover', function() {
                            var $this = d3.select(this);
                            var id = $this.attr('id').split('-')[1];

                            var marker = svg.select('#marker-' + id);
                            var parent = d3.select(marker[0][0].parentNode);
                            var person = parent.select('g');
                            var xPos = $this.attr('xPos');
                            var yPos = $this.attr('yPos');
                            var d = marker.datum();

                            legendContainer.selectAll('g')
                                .transition()
                                .duration(300)
                                .style('opacity', '0.2');
                            $this.transition()
                                .duration(300)
                                .style('opacity', '1');

                            // Reorder the markers
                            marker[0][0].parentNode.parentNode.appendChild(parent[0][0]);

                            marker.transition(500)
                                .attr('transform', 'translate(-242, -90) scale(2.2)');

                            person.transition(200)
                                .attr('transform', 'translate(-35, -58) scale(1.5)');

                            // Add number text
                            parent.append('text')
                                .attr('x', 15)
                                .attr('y', -37)
                                .attr('font-style', 'italic')
                                .attr('font-size', '0px')
                                .attr('fill', '#ffffff')
                                .attr('text-anchor', 'middle')
                                .attr('pointer-events', 'none')
                                .text('x' + d.number)
                                .transition()
                                .delay(100)
                                .attr('font-size', '22px');

                            // Add location text
                            parent.append('text')
                                .attr('x', 0)
                                .attr('y', -100)
                                .attr('fill', '#333')
                                .attr('text-anchor', 'middle')
                                .attr('font-style', 'italic')
                                .attr('font-size', '0px')
                                .text(d.place)
                                .transition()
                                .delay(200)
                                .attr('font-size', '16px');
                        })
                        .on('mouseout', function() {
                            var $this = d3.select(this);
                            var id = $this.attr('id').split('-')[1];

                            var marker = svg.select('#marker-' + id);
                            var parent = d3.select(marker[0][0].parentNode);
                            var person = parent.select('g');
                            var xPos = $this.attr('xPos');
                            var yPos = $this.attr('yPos');
                            var d = marker.datum();

                            person.transition(200)
                                .attr('transform', 'translate(-7, -30) scale(1)');

                            marker.transition(500)
                                .attr('transform', function() {
                                    return 'translate(-108, -40)';
                                });

                            parent.selectAll('text').remove();

                            legendContainer.selectAll('g')
                                .transition()
                                .duration(300)
                                .style('opacity', '1');
                        });

                    // Legend circle
                    legendItem.append("circle")
                        .attr('cx', 15)
                        .attr('cy', -5)
                        .attr('r', 5)
                        .attr('fill', '#fff')
                        .attr('stroke', '#e12b88')
                        .attr('stroke-width', '4');

                    // Legend text
                    legendItem.append('text')
                        .attr('x', 30)
                        .text(currentData.place);
                }
            });

        });
    }

    /**
     * Create a counter that will start at the starting number and count up towards
     * the end number, depending on the speed that it is run at, defaults at 1000ms
     *
     * @param container
     * @param start
     * @param end
     * @param options
     */
    var createCounter = function(container, start, end, options)
    {
        // Set the default options
        var options = setDefaults(options, {
            width: 200,
            height: 100,
            color: '#000',
            fontfamily: 'Cambria',
            textstyle: 'normal',
            title: '',
            description: ''
        });

        // Create the SVG object
        var svg = d3.select(container).append('svg')
            .attr('width', options.width)
            .attr('height', options.height);

        // Accessible tags
        svg.append('title').text(options.title);
        svg.append('description').text(options.description);

        var container = svg.append('g');

        container.append('text')
            .attr('fill', options.color)
            .attr('text-style', options.textstyle)
            .text(start)
//            .tween("text", function(d) {
//                console.log(d.end);
//                var i = d3.interpolate(this.textContent, d),
//                    prec = (d + "").split("."),
//                    round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;
//
//                return function(t) {
//                    this.textContent = Math.round(i(t) * round) / round;
//                };
//            })
    }

    //@todo: Make work
    var createForceDirectedGraph = function(container, jsonUrl, options)
    {
        var config = {
            container: container
        }

        d3.json(jsonUrl, function(error, dataset) {
            if (error) return console.warn(error);
            else {
                var width = 960,
                    height = 500;

                var links = [];
                var nodes = dataset.nodes.slice();
                var bilinks = [];

                // Compute the distinct nodes from the links.
                links.forEach(function(link) {
                    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
                    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
                });

                var color = d3.scale.category20();

                var force = d3.layout.force()
                    .linkDistance(10)
                    .linkStrength(2)
                    .size([width, height]);

                var svg = d3.select(config.container).append('svg')
                    .attr('width', width)
                    .attr('height', height);

                svg.append("rect")
                    .attr("width", "100%")
                    .attr("height", "100%")
                    .attr('fill', '#023d45');

                dataset.links.forEach(function(link) {
                    var s = nodes[link.source],
                        t = nodes[link.target],
                        i = {};

                    nodes.push(i);
                    links.push({source: s, target: i}, {source: i, target: t});
                    bilinks.push([s, i, t]);
                });

                force.nodes(nodes)
                    .links(links)
                    .start();

                var link = svg.selectAll('.link')
                    .data(bilinks)
                    .enter().append('path')
                    .attr('class', 'link');

                var node = svg.selectAll('.node')
                    .data(dataset.nodes)
                    .enter().append('g')
                    .attr('class', 'node')
                    .call(force.drag);

                node.append('circle')
                    .attr('r', function (d) { return 3 * d.size; });

                force.on('tick', function() {
                    link.attr('d', function(d) {
                        return "M" + d[0].x + "," + d[0].y
                            + " S" + d[1].x + "," + d[1].y
                            + " " + d[2].x + "," + d[2].y;
                    });
                    node.attr('transform', function(d) {
                        return 'translate(' + d.x + ',' + d.y + ')';
                    });
                });
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
    var arcTween = function(transition, newAngle, arc)
    {
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
    var wrap = function(text, width)
    {
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
        createBarChart: createBarChart,
        createHorizontalBarChart: createHorizontalBarChart,
        createPieChart: createPieChart,
        createLayeredPieChart: createLayeredPieChart,
        createMap: createMap,
        createCounter: createCounter,
        createForceDirectedGraph: createForceDirectedGraph,
        setColourScheme: setColourScheme
    }

    return public;
}();