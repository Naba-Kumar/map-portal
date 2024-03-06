const viewProjSelect = document.getElementById('view-projection');
const  scaleProjection = getProjection(viewProjSelect.value);

const scaleControl = new ScaleLine({
  units: 'metric',
  bar: true,
  steps: 4,
  text: true,
  minWidth: 140,
});

const map = new Map({
  controls: defaultControls().extend([scaleControl]),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: transform([0, 52], 'EPSG:4326', scaleProjection),
    zoom: 6,
    projection: scaleProjection,
  }),
});

function onChangeProjection() {
  const currentView = map.getView();
  const currentProjection = currentView.getProjection();
  const newProjection = getProjection(viewProjSelect.value);
  const currentResolution = currentView.getResolution();
  const currentCenter = currentView.getCenter();
  const currentRotation = currentView.getRotation();
  const newCenter = transform(currentCenter, currentProjection, newProjection);
  const currentMPU = currentProjection.getMetersPerUnit();
  const newMPU = newProjection.getMetersPerUnit();
  const currentPointResolution =
    getPointResolution(currentProjection, 1 / currentMPU, currentCenter, 'm') *
    currentMPU;
  const newPointResolution =
    getPointResolution(newProjection, 1 / newMPU, newCenter, 'm') * newMPU;
  const newResolution =
    (currentResolution * currentPointResolution) / newPointResolution;
  const newView = new View({
    center: newCenter,
    resolution: newResolution,
    rotation: currentRotation,
    projection: newProjection,
  });
  map.setView(newView);
}
viewProjSelect.addEventListener('change', onChangeProjection);