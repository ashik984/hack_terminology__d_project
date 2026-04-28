mapboxgl.accessToken = CONFIG.MAPBOX_TOKEN;

let map;
let markers = [];
let truckMarker;
let routeCoords = [];
let animationFrameId;

function initMap() {
  if (CONFIG.MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') {
    console.warn("Mapbox token not set. Map will not load properly.");
  }

  map = new mapboxgl.Map({
    container: 'map',
    style: CONFIG.MAP_STYLE,
    center: [CONFIG.MYSORE_CENTER.lng, CONFIG.MYSORE_CENTER.lat],
    zoom: 12
  });

  map.on('load', () => {
    addMarkers();
    
    // Add source and layer for route line
    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#FF6B00',
        'line-width': 6,
        'line-opacity': 0.8
      }
    });
  });
}

function addMarkers() {
  // Clear existing
  markers.forEach(m => m.remove());
  markers = [];

  // Add user pins
  MOCK_USERS.forEach(user => {
    const isFull = user.fillLevel >= CONFIG.ACTIVE_THRESHOLD;
    const color = isFull ? '#EF4444' : '#22C55E';
    
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<strong>${user.name}</strong><br>Fill Level: ${user.fillLevel}%`);

    const marker = new mapboxgl.Marker({ color })
      .setLngLat([user.lng, user.lat])
      .setPopup(popup)
      .addTo(map);

    markers.push(marker);
  });

  // Depot Marker
  new mapboxgl.Marker({ color: '#3B82F6' })
    .setLngLat([CONFIG.DEPOT.lng, CONFIG.DEPOT.lat])
    .setPopup(new mapboxgl.Popup().setHTML('<strong>Depot (Start)</strong>'))
    .addTo(map);

  // Dump Yard Marker
  new mapboxgl.Marker({ color: '#A855F7' })
    .setLngLat([CONFIG.DUMP_YARD.lng, CONFIG.DUMP_YARD.lat])
    .setPopup(new mapboxgl.Popup().setHTML('<strong>Dump Yard (End)</strong>'))
    .addTo(map);
}

async function startCollectionRoute() {
  if (!map) return;

  const activeStops = MOCK_USERS.filter(u => u.fillLevel >= CONFIG.ACTIVE_THRESHOLD);
  document.getElementById('active-stops-count').innerText = `${activeStops.length} Stops`;

  if (activeStops.length === 0) {
    alert("No active stops need collection right now.");
    return;
  }

  // Construct waypoints for Mapbox Directions API
  // Limit to 25 waypoints for Mapbox API limit
  const waypoints = [
    `${CONFIG.DEPOT.lng},${CONFIG.DEPOT.lat}`,
    ...activeStops.map(u => `${u.lng},${u.lat}`),
    `${CONFIG.DUMP_YARD.lng},${CONFIG.DUMP_YARD.lat}`
  ].join(';');

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${CONFIG.MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      routeCoords = route.geometry.coordinates;

      // Update ETA and Distance in UI
      const durationMin = Math.round(route.duration / 60);
      const distanceKm = (route.distance / 1000).toFixed(1);
      
      document.getElementById('route-info').style.display = 'flex';
      document.getElementById('eta-time').innerText = `${durationMin} min`;
      document.getElementById('dist-val').innerText = `${distanceKm} km`;

      // Draw the route on map
      map.getSource('route').setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoords
        }
      });

      // Fit map bounds to route
      const bounds = new mapboxgl.LngLatBounds(routeCoords[0], routeCoords[0]);
      for (const coord of routeCoords) {
        bounds.extend(coord);
      }
      map.fitBounds(bounds, { padding: 50 });

      // Start animation
      animateTruck();
    }
  } catch (err) {
    console.error("Routing error:", err);
    alert("Error fetching route. Check Mapbox token or API limits.");
  }
}

function animateTruck() {
  if (truckMarker) truckMarker.remove();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  
  // Create truck element
  const el = document.createElement('div');
  el.className = 'truck-marker';
  el.innerHTML = '🚛';
  el.style.fontSize = '24px';
  el.style.transformOrigin = 'center';

  truckMarker = new mapboxgl.Marker({ element: el })
    .setLngLat(routeCoords[0])
    .addTo(map);

  let counter = 0;
  
  function animate() {
    if (counter >= routeCoords.length - 1) {
      cancelAnimationFrame(animationFrameId);
      return;
    }

    const start = routeCoords[counter];
    const end = routeCoords[counter + 1];
    
    // Calculate bearing for rotation
    const bearing = turf.bearing(
      turf.point(start),
      turf.point(end)
    );

    truckMarker.setLngLat(end);
    el.style.transform = `rotate(${bearing}deg)`;

    counter++;
    
    // Control speed
    setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, CONFIG.ANIMATION_SPEED);
  }

  animate();
}

// Simple bearing function to avoid needing full turf.js dependency just for this
const turf = {
  point: (coords) => coords,
  bearing: (start, end) => {
    const lat1 = start[1] * Math.PI / 180;
    const lon1 = start[0] * Math.PI / 180;
    const lat2 = end[1] * Math.PI / 180;
    const lon2 = end[0] * Math.PI / 180;

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }
};
