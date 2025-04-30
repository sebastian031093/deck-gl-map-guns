import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer, GeoJsonLayer, ArcLayer } from '@deck.gl/layers';
import { HexagonLayer, HeatmapLayer } from '@deck.gl/aggregation-layers';
import mapboxgl from 'mapbox-gl';


console.log('Hello from deck gl example. sfhjsgfjsh');
const sourceData = './gundata.json';
// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';


const scatterplot = () => new ScatterplotLayer({
  id: 'ScatterplotLayer',
  data: sourceData,
  stroked: true,
  radiusScale: 6,
  opacity: 0.8,
  filled: true,
  radiusMinPixels: 2,
  radiusMaxPixels: 5,
  getPosition: d => {
    if (!d.longitude || !d.latitude) {
      console.error('Missing position in:', d);
      return [0, 0]; // fallback position
    }
    return [d.longitude, d.latitude];
  },
  getFillColor: d => d.n_killed > 0 ? [200, 0, 40, 150] : [255, 140, 0, 100],
  pickable: true
});


const geojsonLayer = () => new GeoJsonLayer({
  id: 'airports',
  data: AIR_PORTS,
  // Styles
  filled: true,
  pointRadiusMinPixels: 2,
  pointRadiusScale: 2000,
  getPointRadius: f => 11 - f.properties.scalerank,
  getFillColor: [200, 0, 80, 180],
  // Interactive props
  pickable: true,
  autoHighlight: true,
  onClick: info =>
    // eslint-disable-next-line
    info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
  // beforeId: 'waterway-label' // In interleaved mode render the layer under map labels
})


const arcLayer = () => new ArcLayer({
  id: 'arcs',
  data: AIR_PORTS,
  dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
  // Styles
  getSourcePosition: f => [-0.4531566, 51.4709959], // London
  getTargetPosition: f => f.geometry.coordinates,
  getSourceColor: [0, 128, 200],
  getTargetColor: [200, 0, 80],
  getWidth: 1
})


const heatmap = () => new HeatmapLayer({
  id: 'HeatmapLayer',
  data: sourceData,
  getPosition: d => [d.longitude, d.latitude],
  getWeight: d => d.n_killed + (d.n_injured * 0.5),
  radiusPixels: 60,
});


const hexagon = () => new HexagonLayer({
  id: 'HexagonLayer',
  data: sourceData,
  getPosition: d => [d.longitude, d.latitude],
  getElevationWeight: d => (d.n_killed * 2) + d.n_injured,
  elevationScale: 100,
  extruded: true,
  radius: 1609,
  opacity: 0.6,
  coverage: 0.88,
  lowerPercentile: 50
});


mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViYXMxMzkzbWFuY28iLCJhIjoiY204N3NtYTM2MDhuNzJpcHVncndqaThncyJ9.oRr4Y7PAd_8vLo_qLDFMXA';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  // style: 'mapbox://styles/mapbox/dark-v10', // Dark theme
  style: 'mapbox://styles/mapbox/light-v9', // 
  center: [-100, 40],
  zoom: 4,
  bearing: 0,
  pitch: 30
});

map.once('load', () => {
  console.log('initMap');
  // Initialize deck.gl overlay and add it to Mapbox
  const deckOverlay = new DeckOverlay({
    interleaved: true,
    controller: true,

    layers: [,
      scatterplot(),
      // heatmap(),
      hexagon()
    ],
  });

  map.addControl(deckOverlay);
  map.addControl(new mapboxgl.NavigationControl());
});












// // deck.gl
// // SPDX-License-Identifier: MIT
// // Copyright (c) vis.gl contributors

// // import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
// // import { GeoJsonLayer, ArcLayer } from '@deck.gl/layers';
// // import mapboxgl from 'mapbox-gl';
// // // // import 'mapbox-gl/dist/mapbox-gl.css';

// // // source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
// // const AIR_PORTS =
// //   'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

// // // Set your Mapbox token here or via environment variable
// // const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2ViYXMxMzkzbWFuY28iLCJhIjoiY204N3NtYTM2MDhuNzJpcHVncndqaThncyJ9.oRr4Y7PAd_8vLo_qLDFMXA'; // eslint-disable-line

// // const map = new mapboxgl.Map({
// //   container: 'map',
// //   style: 'mapbox://styles/mapbox/light-v9',
// //   accessToken: MAPBOX_TOKEN,
// //   center: [0.45, 51.47],
// //   zoom: 4,
// //   bearing: 0,
// //   pitch: 30
// // });

// // const deckOverlay = new DeckOverlay({
// //   // interleaved: true,
// //   layers: [
// //     new GeoJsonLayer({
// //       id: 'airports',
// //       data: AIR_PORTS,
// //       // Styles
// //       filled: true,
// //       pointRadiusMinPixels: 2,
// //       pointRadiusScale: 2000,
// //       getPointRadius: f => 11 - f.properties.scalerank,
// //       getFillColor: [200, 0, 80, 180],
// //       // Interactive props
// //       pickable: true,
// //       autoHighlight: true,
// //       onClick: info =>
// //         // eslint-disable-next-line
// //         info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
// //       // beforeId: 'waterway-label' // In interleaved mode render the layer under map labels
// //     }),
// //     new ArcLayer({
// //       id: 'arcs',
// //       data: AIR_PORTS,
// //       dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
// //       // Styles
// //       getSourcePosition: f => [-0.4531566, 51.4709959], // London
// //       getTargetPosition: f => f.geometry.coordinates,
// //       getSourceColor: [0, 128, 200],
// //       getTargetColor: [200, 0, 80],
// //       getWidth: 1
// //     })
// //   ]
// // });

// // map.addControl(deckOverlay);
// // map.addControl(new mapboxgl.NavigationControl());

