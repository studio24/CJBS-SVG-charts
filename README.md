# Studio 24 Charting Tools

### Overview

The current list of available charts is as follows:

* Horizontal Bar Chart
* Pie Chart
* Layered Pie Chart
* Global Map

All charts use JSON data for configuration, with the exception of the Global Map which uses a CSV file, this is purely for ease of editing. 

### Required Files

The following files are required to be included on all pages with any chart on it:

```
/js/d3/d3.min.js
/js/studio24charts/studio24.charts.js
/js/studio24charts/studio24.charts.css
```

The following file is required if the page has a Global Map on it:

```
/js/d3/toppjson.min.js
```

All files in the /js/d3 folder are required for the Global Map pages (mercator.json and world.json), however these are automatically included in the script.

Before any charts are initialised on the page, the charting library must be first be initialised:

```
Studio24.Charts.init({
    colourScheme: '/js/studio24charts/colours.json'
});
```

The colour scheme is a changeable option, so if two pages have different colours, this can be updated.

### Bar Charts

Bar charts use JSON for the data that they use. An example is the following:

```
[
    { "key": "Element 1", "value": "3" },
    { "key": "Element 2", "value": "7" },
    { "key": "Element 3", "value": "9.5" },
    { "key": "Element 4", "value": "7" },
    { "key": "Element 5", "value": "5" },
    { "key": "Element 6", "value": "9" }
]
```

There are two types of bar charts, which can be invoked in the following ways:

```
Studio24.Charts.createBarChart('.svg-container-1', '/js/data/bar-chart-1.json', {
    width : X,
    height: X,
    colours: "data"
});
```

Or, for a horizontal bar chart:

```
Studio24.Charts.createHorizontalBarChart('.svg-container-1', '/js/data/horizontal-bar-chart-1.json', {
    width : X,
    height: X,
    colours: "data"
});
```

### Pie Charts

The data for pie charts is stored in JSON, in exactly the same way as bar charts (see above).

Pie charts are called in much the same way as Bar Charts. Again, there are two different types: pie chart and layered pie chart.

```
Studio24.Charts.createPieChart('.svg-container-1', '/js/data/pie-chart-1.json', {
    width : X,
    height: X,
    'title': 'A Pie Chart',
    colours: "data"
});
```

```
Studio24.Charts.createLayeredPieChart('.svg-container-1', '/js/data/layered-pie-chart-1.json', {
    width : X,
    height: X,
    title: 'A Layered Pie Chart',
    colours: "data"
});
```

### Maps

Maps are the only type of chart which are invoked with CSV data. This is because a CSV file is a more efficient way of storing data with more columns.

An example CSV looks like this:

```
place,number,lat,lon
UK,2,53.544918,-2.276611
South East Asia,1,3.521166,115.145264
Europe (Excluding UK),8,48.229842,11.434326
East Asia,2,33.144049,113.739014
North America/Canada,3,48.463498,-96.495361
Middle East,1,29.343875,42.714844
South Asia,2,21.739091,77.167969
Africa,1,5.747174,21.972656
Australasia,1,-23.120154,135.175781
Caribbean,1,20.591652,-75.937500
```

With this data the map can then be invoked from Javascript as follows:

```
Studio24.Charts.createMap('.svg-container-1', '/js/data/map-data.csv', {
    width : X,
    height: X
});
```
