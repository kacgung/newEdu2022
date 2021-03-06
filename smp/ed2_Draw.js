import 'ol/ol.css';
import { Map, View, Collection } from 'ol';    
import TileLayer from 'ol/layer/Tile';

import { XYZ, Vector, TileWMS } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import { GeoJSON, GML, WFS } from 'ol/format';
import { bbox as bboxStrategy } from 'ol/loadingstrategy.js';

import { Style, Stroke, Fill, Circle } from 'ol/style';
import { Draw, Modify, Snap } from 'ol/interaction';


const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
          source: new XYZ({
            url: 'http://xdworld.vworld.kr:8080/2d/Base/201512/{z}/{x}/{y}.png'
          })
        })
    ],
    view: new View({
        center: [14139375.266574217, 4507391.386530381],
        zoom: 13
    })
});

// Building WMS Layer
let buildingWMSSource = new TileWMS({
  url: '/geoserver/gwc/service/wms',
  params: {
      VERSION: '1.1.1',
      LAYERS: 'korea:building',
      WIDTH: 256,
      HEIGHT: 256,
      CRS: 'EPSG:3857',
      TILED: true
    }
});
let buildingWMSLayer = new TileLayer({
  source: buildingWMSSource,
  opacity: 0.3,
  visible: true

});
map.addLayer(buildingWMSLayer);

// Building Vector > mklink /D htdocs C:\???
let buildingVectorSource = new Vector({
  format: new GeoJSON(),
  url: extent => {
    return '/geoserver/ows?' +
      'service=WFS' +
      '&version=1.1.0' +
      '&request=GetFeature' +
      '&typeName=korea:building' +
      '&srsName=EPSG:3857' +
      '&outputFormat=application/json' +
      '&bbox=' + extent.join(',') + ',EPSG:3857';
  },
  strategy: bboxStrategy
});
let buildingVectorLayer = new VectorLayer({
  source: buildingVectorSource,
  visible: false
});
map.addLayer(buildingVectorLayer);

// Resoultion Changed Event 축척제어
map.getView().on('change:resolution', e => {
  if (map.getView().getZoom() > 16) {
    buildingVectorLayer.setVisible(true);
  } else {
    buildingVectorLayer.setVisible(false);
  }
});

// Draw Feature Vector Layer
let features = new Collection();
let featureOverlay = new VectorLayer({
  source: new Vector({ features: features }),
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.5)'
    }),
    stroke: new Stroke({
      color: 'rgba(55, 155, 55, 0.8)',
      width: 5
    }),
    image: new Circle({
      radius: 10,
      fill: new Fill({
        color: '#ffcc33'
      })
    })
  })
});
map.addLayer(featureOverlay);

// Draw Interaction
let draw = new Draw({
    type: 'MultiPolygon',
    geometryName: 'geom',
    features: features,
});
map.addInteraction(draw);
draw.setActive(true);
draw.on('drawend', function (e) {
    draw.setActive(false);
    modify.setActive(true);
});
  
// Modify Interaction
let modify = new Modify({
    features: features
});
map.addInteraction(modify);
modify.setActive(false);
  
// Snap Interaction
let snap = new Snap({
    source: buildingVectorSource
});
map.addInteraction(snap);
  
