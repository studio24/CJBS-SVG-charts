# Studio 24 Charting Tools

### Open Source license

Copyright (c) 2014 Studio 24 Ltd

Licensed under the MIT License, see LICENSE.md

### Overview

All charts use JSON data for configuration, with the exception of the Global Map which uses a CSV file, this is purely for ease of editing.

### Required Files

The following files are required to be included on all pages with any chart on it:

```
/js/d3/d3.min.js
/js/s24/s24.charts.js
/js/s24/s24.charts.css
```

The following file is required if the page has a Global Map on it:

```
/js/d3/toppjson.min.js
```

All files in the /js/d3 folder are required for the Global Map pages (world.json), however these are automatically included in the script, and the location is also configurable through the standard options.

### Initialisation

Before any charts are initialised on the page, the charting library must be first be initialised:

```
S24.Charts.init({
    colourScheme: '/js/studio24charts/colours.json'
});
```

The colour scheme is a changeable option, so if two pages have different colours, this can be updated.
