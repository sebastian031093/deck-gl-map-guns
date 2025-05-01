import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import { GL } from '@luma.gl/constants';
import { MapView, OrthographicView } from '@deck.gl/core';
import { ScatterplotLayer, GeoJsonLayer, ArcLayer } from '@deck.gl/layers';
import { HexagonLayer, HeatmapLayer } from '@deck.gl/aggregation-layers';
import mapboxgl from 'mapbox-gl';
// import data from '../public/gundata.json';

const accessToken = process.env.PUBLIC_MAPBOX_ACCESS_TOKEN;

console.log('Hi from deck gl example. sfhjsgfjsh');

// const preprocessData = (data) => {
//   return data.filter(d => d.longitude && d.latitude)
//     .map(d => ({
//       longitude: d.longitude,
//       latitude: d.latitude,
//       n_killed: d.n_killed,
//       n_injured: d.n_injured,
//       incident_id: d.incident_id
//     }));
// };

// const sourceData = preprocessData(data);
const sourceData = './gundata.json';
// console.log(sourceData);
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
  pickable: true,
  // Performance optimizations:
  updateTriggers: {
    getRadius: ['n_killed'],
    getFillColor: ['n_killed']
  },
  _dataDiff: (newData, oldData) => {
    // Custom diffing if your data updates frequently
    return newData.length !== oldData.length;
  }
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
  id: 'widget-HexagonLayer',
  data: sourceData,
  getPosition: d => [d.longitude, d.latitude],
  getElevationWeight: d => (d.n_killed * 2) + d.n_injured,
  elevationScale: 100,
  extruded: true,
  radius: 1609,
  opacity: 0.6,
  coverage: 0.88,
  lowerPercentile: 50,

  // Performance optimizations:// Performance optimizations:
  fp64: false, // Disable high precision if not needed
  material: {
    specularColor: [255, 255, 255],
    shininess: 30,
    ambient: 0.3,
    diffuse: 0.6,
    specular: 0.2
  }
});

const map = new mapboxgl.Map({
  container: 'map', // container ID
  accessToken: accessToken,
  // style: 'mapbox://styles/mapbox/dark-v10', // Dark theme
  style: 'mapbox://styles/mapbox/dark-v9', //
  center: [-100, 40],
  zoom: 4,
  bearing: 0,
  pitch: 30
});

map.once('load', () => {
  console.log('initMap');
  // Initialize deck.gl overlay and add it to Mapbox
  const deckOverlay = new DeckOverlay({
    // interleaved: true,
    controller: true,
    interleaved: true,
    parameters: {
      depthTest: true,
      blend: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
      blendEquation: GL.FUNC_ADD
    },

    getTooltip: ({ object, x, y }) => {
      const el = document.getElementById('tooltip');
      if (object) {
        const { n_killed, incident_id } = object;
        el.innerHTML = `<h1>ID ${incident_id}</h1>`
        el.style.display = 'block';
        el.style.opacity = 0.9;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      } else {
        el.style.opacity = 0.0;
      }
    },


    views: [
      // This view will be synchronized with the base map
      new MapView({ id: 'ScatterplotLayer' }),
      // This view will not be interactive
      new OrthographicView({ id: 'widget' })
    ],
    layerFilter: ({ layer, viewport }) => {
      const shouldDrawInWidget = layer.id.startsWith('widget');
      if (viewport.id === 'widget') return shouldDrawInWidget;
      return !shouldDrawInWidget;
    },
    layers: [,
      // hexagon(),
      scatterplot(),
      // heatmap(),
    ],
    // Performance tuning:
    _animate: true,
    _framerate: 30, // Limit frame rate
    useDevicePixels: false // Can improve performance
  });

  map.addControl(deckOverlay);
  // map.addControl(new mapboxgl.NavigationControl());
});

