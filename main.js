import './style.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

import { Map, View } from 'ol';
import OSM from 'ol/source/OSM';
// import {FullScreen, defaults as defaultControls} from 'ol/control.js';
import Control from 'ol/control/Control';
import { Projection, fromLonLat } from 'ol/proj';
import Draw from 'ol/interaction/Draw.js';
import Overlay from 'ol/Overlay.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { LineString, Polygon } from 'ol/geom.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { getArea, getLength } from 'ol/sphere.js';
import { unByKey } from 'ol/Observable.js';
import MousePosition from 'ol/control/MousePosition.js';
import { format } from 'ol/coordinate.js';
import LayerGroup from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Icon from 'ol/style/Icon.js';
import XYZ from 'ol/source/XYZ.js';
import axios from 'axios';
import Papa from 'papaparse';




const raster = new TileLayer({
  source: new OSM(),
  title: 'raster',
  name: 'raster'
});


// const source = new VectorSource();

const source = new VectorSource({ wrapX: false });


const vector = new VectorLayer({
  source: source,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.2)',
    'stroke-color': '#ffcc33',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': '#ffcc33',
  },
});


// Define base layers
var standardLayer = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attributions: ['&copy; <a href="https://www.esri.com/en-us/home">Esri</a>']
  }),
  title: 'Standard',
  visible: false,
  name: 'standardLayer'
});

var satelite = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attributions: ['&copy; <a href="https://www.esri.com/en-us/home">Esri</a>']
  }),
  title: 'satelite',
  visible: false,
  name: 'satelite'


});

var transportLayer = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
    attributions: ['&copy; <a href="https://www.esri.com/en-us/home">Esri</a>']
  }),
  title: 'Transport',
  visible: false,
  name: 'transportLayer'

});




const map = new Map({
  layers: [raster, vector, standardLayer, satelite, transportLayer],
  target: 'map',
  view: new View({
    center: new fromLonLat([92.07298769282396, 26.213469404852535]),
    zoom: 7
  }),
  controls: [],
  keyboardEventTarget: document
});

// let scaleLineControl = new ScaleLine({
//   className: "scaleLine",
//   bar:true,
//   // minWidth:1500,
//   maxWidth:140,
//   units: 'metric',
//   steps:6,
//   text:true,
//   target:'scale-line-control',
//   // target: document.getElementById('scale-line-control') // Optional target element to render the scale line
// });
// map.addControl(scaleLineControl);

//Custom Home Click functionality Starts....

function customHome(event) {

  // const homeButton = document.getElementById(event);
  const homeCoords = [10300257, 3061038];
  map.getView().setCenter(homeCoords);
  map.getView().setZoom(7); // Optional: Set zoom level for home view
}

window.handleHome = function (event) {
  customHome(event);
};

// Home Click  functionality Ends.....



//Custom Zoom- in  and Zoom-out functionality Starts....

function customZoom(event) {
  console.log(event)
  if (event == "zIn") {
    const view = map.getView();
    const currentZoom = view.getZoom();
    // Adjust zoom step based on your preference (e.g., 0.5)
    const newZoom = currentZoom + 0.5;
    view.setZoom(Math.min(newZoom, view.getMaxZoom())); // Prevent exceeding max zoom
  }
  else if (event == "zOut") {
    const view = map.getView();
    const currentZoom = view.getZoom();
    const newZoom = currentZoom - 0.5;
    view.setZoom(Math.max(newZoom, view.getMinZoom())); // Prevent zooming below min zoom

  }
}

window.handleZoom = function (event) {
  customZoom(event);
};
//Zoom- in  and Zoom-out functionality Ends.....





//Custom Full Screen functionality Starts....

function customFullscreen(event) {
  if (document.fullscreenEnabled) {
    // Fullscreen API is supported
    console.log("full screen supported");

    if (event == "easeIn") {
      function enterFullscreen(element) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { // Webkit prefix
          element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) { // Mozilla prefix
          element.mozRequestFullScreen();
        } else {
          // Handle fallback scenarios (optional)
        }
      }

      // Usage:
      const mapElement = document.getElementById('body');
      enterFullscreen(mapElement);
    } else {
      function exitFullscreen() {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Webkit prefix
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) { // Mozilla prefix
          document.mozCancelFullScreen();
        } else {
          // Handle fallback scenarios (optional)
        }
      }

      // Usage:
      exitFullscreen();


    }


  } else {
    // Handle fallback scenarios (optional)
    console.log("full screen not supported");
  }
}

window.handleFullscreen = function (event) {
  customFullscreen(event);
};

// Custom Full Screen functionality Ends.....






// Measure Tool starts here.................

/**
 * Currently drawn feature.
 * @type {import("ol/Feature.js").default}
 */
let sketch;

/**
 * The help tooltip element.
 * @type {HTMLElement}
 */
let helpTooltipElement;

/**
 * Overlay to show the help messages.
 * @type {Overlay}
 */
let helpTooltip;

/**
 * The measure tooltip element.
 * @type {HTMLElement}
 */
let measureTooltipElement;

/**
 * Overlay to show the measurement.
 * @type {Overlay}
 */
let measureTooltip;

/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
const continuePolygonMsg = 'Click to continue drawing the polygon';

/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
const continueLineMsg = 'Click to continue drawing the line';

/**
 * Handle pointer move.
 * @param {import("ol/MapBrowserEvent").default} evt The event.
 */
const pointerMoveHandler = function (evt) {
  if (evt.dragging) {
    return;
  }
  /** @type {string} */
  let helpMsg = 'Click to start drawing';

  if (sketch) {
    const geom = sketch.getGeometry();
    if (geom instanceof Polygon) {
      helpMsg = continuePolygonMsg;
    } else if (geom instanceof LineString) {
      helpMsg = continueLineMsg;
    }
  }

  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);

  helpTooltipElement.classList.remove('hidden');
};



map.on('pointermove', pointerMoveHandler);

map.getViewport().addEventListener('mouseout', function () {
  helpTooltipElement.classList.add('hidden');
});


let draw; // global so we can remove it later

/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */






const formatLength = function (line) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};

/**
 * Format area output.
 * @param {Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
const formatArea = function (polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
};

const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),

  }),
});


function customMeasure(event) {
  // console.log(event)

  // const type = event == 'area' ? 'Polygon' : 'LineString';

  // console.log(type)

  if (event === 'clear') {

    // removeInteractions();
    // console.log(map.getOverlays())
    map.getOverlays().clear();
    // measureTooltip.getSource().clear();
    // helpTooltip.getSource().clear();
    return

  }
  draw = new Draw({
    source: source,
    type: event,
    style: function (feature) {
      const geometryType = feature.getGeometry().getType();
      if (geometryType === event || geometryType === 'Point') {
        return style;
      }
    },
  });
  map.addInteraction(draw);

  createMeasureTooltip();
  createHelpTooltip();

  let listener;
  draw.on('drawstart', function (evt) {
    // set sketch
    sketch = evt.feature;

    /** @type {import("ol/coordinate.js").Coordinate|undefined} */
    let tooltipCoord = evt.coordinate;

    listener = sketch.getGeometry().on('change', function (evt) {
      const geom = evt.target;
      let output;
      if (geom instanceof Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  });

  draw.on('drawend', function () {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    unByKey(listener);
  });


}


/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'ol-tooltip hidden';
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',
  });
  map.addOverlay(helpTooltip);
}

/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(measureTooltip);
}

/**
 * Let user change the geometry type.
 */
// typeSelect.onchange = function () {
//   map.removeInteraction(draw);
//   addInteraction();
// };


window.handleMeasure = function (event) {
  map.removeInteraction(draw);
  customMeasure(event);
};
// measure tool ends...........



// Draw feature starts.........
const drawStyles = {
  Point: {
    'circle-radius': 5,
    'circle-fill-color': 'red',
  },
  LineString: {
    'circle-radius': 5,
    'circle-fill-color': 'red',
    'stroke-color': 'yellow',
    'stroke-width': 2,
  },
  Polygon: {
    'circle-radius': 5,
    'circle-fill-color': 'red',
    'stroke-color': 'yellow',
    'stroke-width': 2,
    'fill-color': 'blue',
  },
  Circle: {
    'circle-radius': 5,
    'circle-fill-color': 'red',
    'stroke-color': 'blue',
    'stroke-width': 2,
    'fill-color': 'yellow',
  },
};

let drawFeature;
function customDraw(event) {
  const value = event;
  if (value !== 'None') {
    drawFeature = new Draw({
      source: source,
      type: event,
      style: drawStyles[value],
    });
    map.addInteraction(drawFeature);
  }
}

window.handleDraw = function (event) {
  map.removeInteraction(drawFeature);
  customDraw(event);
};

//  Draw ends here............................






//Pindrop Locate featue Starts....

// Add an empty vector source to hold pins
const pinSource = new VectorSource();
const pinLayer = new VectorLayer({
  source: pinSource
});
map.addLayer(pinLayer);

document.getElementById('locate_Pindrop').addEventListener('click', function () {
  // Get longitude and latitude values from input fields
  let lon = parseFloat(document.getElementById("lon").value);
  let lat = parseFloat(document.getElementById("lat").value);

  // Ensure that lon and lat are valid numbers
  if (isNaN(lon) || isNaN(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) {
    alert("Please enter valid longitude (-180 to 180) and latitude (-90 to 90) values.");
    return;
  }

  // Center the map view to the specified coordinates
  map.getView().setCenter(new fromLonLat([lon, lat]));
  map.getView().setZoom(10); // Set desired zoom level

  // Drop a pin at the specified coordinates
  let pinFeature = new Feature({
    geometry: new Point(fromLonLat([lon, lat]))
  });

  // Add the pin feature to the pin source
  pinSource.addFeature(pinFeature);

  let pinStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'https://openlayers.org/en/v6.13.0/examples/data/icon.png' // URL to the pin icon
    })
  });

  pinFeature.setStyle(pinStyle);


})

document.getElementById('locate_Pinremove').addEventListener('click', function () {
  console.log("remove")

  pinSource.clear(); // Clear all features from the pin source

})





// Pindrop / Locate featue Ends.....




// coordinate tool starts ................

const coordPos = document.getElementById('lonlat_display');

let projection = new Projection("EPSG:4326"); // Example: WGS 84 geographic projection

let mousePos = new MousePosition({
  projection: 'EPSG:4326',
  coordinateFormat: function (coordinate) {
    // Simple formatting example (modify based on your library)
    // const formattedCoords = `${coordinate[1]}, ${coordinate[0]}`; // [y], [x] order

    let point = new fromLonLat([coordinate[1], coordinate[0]], projection);

    let ltdegrees = Math.floor(point[0]);
    let ltminutes = (point[0] - ltdegrees) * 60;

    let ltcoor = ltdegrees + "° " + ltminutes.toFixed(2) + "'"


    let lndegrees = Math.floor(point[1]);
    let lnminutes = (point[1] - lndegrees) * 60;

    let lncoor = lndegrees + "° " + lnminutes.toFixed(2) + "'"

    let DDcoord = ltcoor + "  N " + lncoor + "E";

    // console.log(DDcoord)
    coordPos.innerHTML = DDcoord;



    // return formattedCoords; // Return the formatted string
  }
});

map.addControl(mousePos);

//  Co-Ordinate Feature Ends .............





// Scale Line Feature Added.........................


// Scale Line Feature End.........................



// Layer swither tool starts ...........

// Layer swither tool ends...........


// state dist Layer select tool starts


// Create a vector source for the state layer

document.getElementById('selectButton').addEventListener('click', function () {
  const selectedState = document.getElementById('state').value;
  const selectedDistrict = document.getElementById('district').value;

  // Your main logic here
  console.log("Selected State:", selectedState);
  console.log("Selected District:", selectedDistrict);
  // You can perform any further processing or actions here

  const stateVectorSource = new VectorSource({
    url: './india_state_geo.json', // Replace with your state data URL
    format: new GeoJSON()
  });

  // Create a vector source for the district layer
  const districtVectorSource = new VectorSource({
    url: './india_Districts.geojson', // Replace with your district data URL
    format: new GeoJSON()
  });
  // Function to create a filter based on state name (adjust property name if needed)
  function getStateFilter(selected, category) {
    return function (feature) {
      if (category === 'state') {
        return feature.get('NAME_1').toLowerCase() === selected.toLowerCase(); // Modify property name based on your data
      } else if (category === 'district') {
        return feature.get('distname').toLowerCase() === selected.toLowerCase(); // Modify property name based on your data
      }
    };
  }

  // Apply the filter to the source based on selected state
  stateVectorSource.once('change', function () {
    stateVectorSource.getFeatures().forEach(function (feature) {
      if (!getStateFilter(selectedState, "state")(feature)) {
        stateVectorSource.removeFeature(feature);
      }
    });
  });

  // Apply the filter to the source based on selected district
  districtVectorSource.once('change', function () {
    districtVectorSource.getFeatures().forEach(function (feature) {
      if (!getStateFilter(selectedDistrict, "district")(feature)) {
        districtVectorSource.removeFeature(feature);
      }
    });
  });

  // Remove previous state layer if exists
  const existingStateLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'stateLayer');
  if (existingStateLayer) {
    map.removeLayer(existingStateLayer);
  }

  // Remove previous district layer if exists
  const existingDistrictLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'districtLayer');
  if (existingDistrictLayer) {
    map.removeLayer(existingDistrictLayer);
  }

  // Create a state vector layer with the filtered source
  const stateLayer = new VectorLayer({
    source: stateVectorSource,
    style: new Style({
      stroke: new Stroke({
        color: '#000',
        lineCap: 'butt',
        width: 1
      }),
    })
  });
  stateLayer.set('name', 'stateLayer');

  // Create a district vector layer with the filtered source
  const districtLayer = new VectorLayer({
    source: districtVectorSource,
    style: new Style({
      stroke: new Stroke({
        color: '#a0a',
        lineCap: 'butt',
        width: 1
      }),
    })
  });
  districtLayer.set('name', 'districtLayer');

  // Add the new layers to the map
  map.addLayer(stateLayer);
  map.addLayer(districtLayer);
});

// state dist Layer select tool starts

// side menu options

// admin states
// state boundary


const atatecheckbox = document.getElementById('stateboundary');

atatecheckbox.addEventListener('change', function () {
  // Get the existing state layer if it exists
  const existingStateLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'stateLayer');

  if (atatecheckbox.checked) {
    // Create a vector source for the state layer
    const stateVectorSource = new VectorSource({
      url: './assam_boundary.geojson', // Replace with your state data URL
      format: new GeoJSON()
    });

    const selectedState = 'assam';

    // Function to create a filter based on state name (adjust property name if needed)
    function getStateFilter(selected) {
      return function (feature) {
        return feature.get('Name').toLowerCase() === selected.toLowerCase(); // Modify property name based on your data
      };
    }

    // Apply the filter to the source based on selected state
    stateVectorSource.once('change', function () {
      stateVectorSource.getFeatures().forEach(function (feature) {
        if (!getStateFilter(selectedState)(feature)) {
          stateVectorSource.removeFeature(feature);
        }
      });
    });

    // Create a state vector layer with the filtered source
    const stateLayer = new VectorLayer({
      source: stateVectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#000',
          lineCap: 'butt',
          width: 1
        }),
      })
    });

    stateLayer.set('name', 'stateLayer');

    // Add the layer to the map
    map.addLayer(stateLayer);
  } else {
    // If the checkbox is unchecked, remove the existing state layer if it exists
    if (existingStateLayer) {
      map.removeLayer(existingStateLayer);
    }
  }
});


// District boundary

const districtcheckbox = document.getElementById('DistrictBoundary');

districtcheckbox.addEventListener('change', function () {
  // Get the existing state layer if it exists
  const existingDistrictLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'districtLayer');

  if (districtcheckbox.checked) {
    // Create a vector source for the state layer
    const districtVectorSource = new VectorSource({
      url: './assam_dist_json.geojson', // Replace with your state data URL
      format: new GeoJSON()
    });

    const selectedState = 'assam';

    // Function to create a filter based on state name (adjust property name if needed)
    function getStateFilter(selected) {
      return function (feature) {
        return feature.get('statename').toLowerCase() === selected.toLowerCase(); // Modify property name based on your data
      };
    }

    // Apply the filter to the source based on selected state
    districtVectorSource.once('change', function () {
      districtVectorSource.getFeatures().forEach(function (feature) {
        if (!getStateFilter(selectedState)(feature)) {
          districtVectorSource.removeFeature(feature);
        }
      });
    });

    // Create a state vector layer with the filtered source
    const districtLayer = new VectorLayer({
      source: districtVectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#a0a',
          lineCap: 'butt',
          width: 1
        }),
      })
    });

    districtLayer.set('name', 'districtLayer');

    // Add the layer to the map
    map.addLayer(districtLayer);
  } else {
    // If the checkbox is unchecked, remove the existing state layer if it exists
    if (existingDistrictLayer) {
      map.removeLayer(existingDistrictLayer);
    }
  }
});


// ---Upload

// document.getElementById("csvUpload").addEventListener('click', function () {
//   var fileInput = document.getElementById('csvInput');
//   var file = fileInput.files[0];

//   if (!file) {
//     alert("Please select a file to upload.");
//     return;
//   }

//   var reader = new FileReader();
//   reader.onload = function (event) {
//     var data = event.target.result;
//     processData(data);
//   };
//   reader.onerror = function (event) {
//     console.error("File could not be read! Code " + event.target.error.code);
//   };
//   reader.readAsText(file);
// });

// function processData(data) {
//   try {
//     // Split CSV data into lines
//     var lines = data.split('\n');

//     // Loop through each line (assuming CSV format is "latitude,longitude")
//     lines.forEach(function(line) {
//       var values = line.split(',');
//       console.log(values)
//       if (values.length === 2) {
//         var latitude = parseFloat(values[0]);
//         var longitude = parseFloat(values[1]);

//         // Check if latitude and longitude are valid numbers
//         if (!isNaN(latitude) && !isNaN(longitude)) {
//           // Create a marker for each coordinate and add it to the map
//           var marker = new Feature({
//             geometry: new ol.geom.Point(fromLonLat([longitude, latitude]))
//           });

//           var vectorSourceUpload = new VectorSource({
//             features: [marker]
//           });

//           var vectorLayerUpload = new VectorLayer({
//             source: vectorSourceUpload
//           });

//           map.addLayer(vectorLayerUpload);
//         } else {
//           console.error("Invalid latitude or longitude in CSV.");
//         }
//       } else {
//         console.error("Invalid data format in CSV.");
//       }
//     });
//   } catch (error) {
//     console.error("Error processing CSV:", error);
//   }
// }





document.getElementById("uploadButton").addEventListener('click', function () {
  var fileInput = document.getElementById('fileInput');
  var file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  var reader = new FileReader();
  reader.onload = function (event) {
    var data = event.target.result;
    var extension = file.name.split('.').pop().toLowerCase();
    processData(data, extension);
  };
  reader.onerror = function (event) {
    console.error("File could not be read! Code " + event.target.error.code);
  };
  reader.readAsText(file);
});

function processData(data, extension) {
  try {
    if (extension === 'geojson') {
      visualizeGeoJSON(data);
    } else if (extension === 'csv') {
      visualizeCSV(data);
    } else {
      console.error("Unsupported file format.");
    }
  } catch (error) {
    console.error("Error processing file:", error);
  }
}

function visualizeGeoJSON(data) {
  try {
    var features = JSON.parse(data).features;

    if (!features || !Array.isArray(features)) {
      console.error("Invalid GeoJSON data format.");
      return;
    }

    features.forEach(function (feature) {
      var geometry = feature.geometry;
      if (geometry && geometry.type === 'Point' && Array.isArray(geometry.coordinates) && geometry.coordinates.length === 2) {
        var coordinates = geometry.coordinates;
        var latitude = coordinates[1];
        var longitude = coordinates[0];

        if (!isNaN(latitude) && !isNaN(longitude)) {
          var marker = new Feature({
            geometry: new Point(fromLonLat([longitude, latitude]))
          });

          var vectorSource = new VectorSource({
            features: [marker]
          });

          var vectorLayer = new VectorLayer({
            source: vectorSource
          });

          map.addLayer(vectorLayer);
        } else {
          console.error("Invalid latitude or longitude in GeoJSON.");
        }
      } else {
        console.error("Invalid GeoJSON feature format.");
      }
    });
  } catch (error) {
    console.error("Error processing GeoJSON:", error);
  }
}


function visualizeCSV(data) {
  console.log("csv")
  try {
    // Your CSV parsing and visualization logic here
    // For example, you can use a library like PapaParse for CSV parsing

    new Papa.parse(data, {
      header: true,
      complete: function (results) {
        results.data.forEach(function (row) {
          // Assuming latitude and longitude columns are named 'latitude' and 'longitude'
          var latitude = parseFloat(row.latitude);
          var longitude = parseFloat(row.longitude);

          if (!isNaN(latitude) && !isNaN(longitude)) {
            var marker = new Feature({
              geometry: new Point(fromLonLat([longitude, latitude]))
            });

            var vectorSource = new VectorSource({
              features: [marker]
            });

            var vectorLayer = new VectorLayer({
              source: vectorSource
            });

            map.addLayer(vectorLayer);
          } else {
            console.error("Invalid latitude or longitude in CSV.");
          }
        });
      }
    });
  } catch (error) {
    console.error("Error processing CSV:", error);
  }
}



// ------------

//  Print option-----------


// document.getElementById("export-pdf").addEventListener("click", function() {
//   var format = document.getElementById("format").value;
//   var resolution = parseInt(document.getElementById("resolution").value);
//   var scale = parseInt(document.getElementById("scale").value);

//   let printop = new PrintControl;
//   map.addControl(printop)

//   // Make sure ol-ext has been loaded
//   if (1) {
//     // Define print options
//     var options = {
//       layout: format,
//       dpi: resolution,
//       scale: scale
//     };

//     // Print the map
//     printop.print(options);
//   } else {
//     console.error('ol-ext library is not loaded.');
//   }
// });



// Create the map
// var map = new ol.Map({
//   target: 'map',
//   layers: [standardLayer, cycleOSMLayer, transportLayer, humanitarianLayer],
//   view: new ol.View({
//     center: ol.proj.fromLonLat([0, 0]),
//     zoom: 2
//   })
// });

// handletoggleLayer

// Define the toggleLayer function to switch between layers

function toggleLayer(layerName) {
  var layers = map.getLayers().getArray();
  layers.forEach(function (layer) {
    if (layer.get('name') === layerName) {
      layer.setVisible(true);
    } else {
      layer.setVisible(false);
    }
  });
}

window.handletoggleLayer = function (layerName) {
  toggleLayer(layerName);
};


// --BAse layer  changes feature end


// geo coder
let geoLocateLat;
let geoLocateLon;

document.addEventListener('DOMContentLoaded', function () {
  const locationInput = document.getElementById('locationInput');
  const resultContainer = document.getElementById('resultContainer');

  // Event listener for input changes
  locationInput.addEventListener('input', function () {
    const location = locationInput.value.trim();
    if (location) {
      getSuggestions(location);
    } else {
      // Clear the result container if the input is empty
      resultContainer.innerHTML = '';
    }
  });


  // Function to get suggestions from Nominatim API
  async function getSuggestions(location) {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
      const suggestions = response.data;
      displaySuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error.message);
    }
  }

  // Function to display suggestions in the result container
  function displaySuggestions(suggestions) {
    if (suggestions && suggestions.length > 0) {
      const suggestionHTML = suggestions.map(suggestion => {
        return `<li class="suggestion-item" data-lat="${suggestion.lat}" data-lon="${suggestion.lon}" data-name="${suggestion.display_name}">${suggestion.display_name}</li>`;
      }).join('');
      resultContainer.innerHTML = `<ul>${suggestionHTML}</ul>`;
      // Add click event listener to each suggestion item
      const suggestionItems = document.querySelectorAll('.suggestion-item');
      suggestionItems.forEach(item => {
        item.addEventListener('click', function () {
          const name = item.getAttribute('data-name');
          locationInput.value = name; // Automatically add the selected suggestion to the input field
          console.log(item)
          geoLocateLat = item.getAttribute('data-lat');
          geoLocateLon = item.getAttribute('data-lon');
          locateLocation(geoLocateLat, geoLocateLon);
          clearSuggestions(); // Clear suggestions after selecting one
        });
      });
    } else {
      resultContainer.innerHTML = '<p>No suggestions found.</p>';
    }
  }

  // Function to clear suggestions
  function clearSuggestions() {
    resultContainer.innerHTML = '';
  }

  // Function to locate a specific location on the map
  function locateLocation(lat, lon) {
    // Here, you can write your code to locate the location on the map

    const geoLocateSource = new VectorSource();
    const geoLocateLayer = new VectorLayer({
      source: geoLocateSource
    });

    // Center the map view to the specified coordinates
    map.getView().setCenter(new fromLonLat([lon, lat]));
    map.getView().setZoom(16); // Set desired zoom level

    // Drop a pin at the specified coordinates
    let geolocateFeature = new Feature({
      geometry: new Point(fromLonLat([lon, lat]))
    });

    // Add the pin feature to the pin source
    geoLocateSource.addFeature(geolocateFeature);

    let pinStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: './modules/location.gif' // URL to the pin icon
      })
    });

    geolocateFeature.setStyle(pinStyle);




    // For demonstration purposes, I'm logging the latitude and longitude
    console.log('Locating:', lat, lon);
    // You can use these coordinates to display the location on the map using OpenLayers or any other mapping library
  }
});

// geo coder

map.addLayer(pinLayer);

document.getElementById('locate_Pindrop').addEventListener('click', function () {
  // Get longitude and latitude values from input fields
  let lon = parseFloat(document.getElementById("lon").value);
  let lat = parseFloat(document.getElementById("lat").value);


  const pinSource = new VectorSource();
  const pinLayer = new VectorLayer({
    source: pinSource
  });
  // Center the map view to the specified coordinates
  map.getView().setCenter(new fromLonLat([lon, lat]));
  map.getView().setZoom(10); // Set desired zoom level

  // Drop a pin at the specified coordinates
  let pinFeature = new Feature({
    geometry: new Point(fromLonLat([lon, lat]))
  });

  // Add the pin feature to the pin source
  pinSource.addFeature(pinFeature);

  let pinStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'https://openlayers.org/en/v6.13.0/examples/data/icon.png' // URL to the pin icon
    })
  });

  pinFeature.setStyle(pinStyle);


})

document.getElementById('locate_Pinremove').addEventListener('click', function () {
  console.log("remove")

  pinSource.clear(); // Clear all features from the pin source

})