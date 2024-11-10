import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './Map3D.css'; // Archivo CSS para los estilos personalizados

mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaTE1MjMiLCJhIjoiY20ydDk4MHBlMDBuNDJvcHZ3MDJvYmk2ciJ9.57WQmLIHUZMrA1JSfxtEQA';

const Map3D = () => {
  const mapContainer = useRef(null);
  const [userLocation, setUserLocation] = useState(null); // Para guardar la ubicación del usuario

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-71.2532, -29.9021],
      zoom: 15,
      pitch: 45,
      bearing: -17.6
    });

    // Agregar el buscador de ubicación
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
    });
    map.addControl(geocoder);

    // Configuración del control de geolocalización
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.addControl(geolocateControl);

    // Centrar el mapa en la ubicación del dispositivo cuando se obtenga la ubicación
    geolocateControl.on('geolocate', (e) => {
      const { longitude, latitude } = e.coords;
      setUserLocation([longitude, latitude]); // Guardar la ubicación del usuario
      map.setCenter([longitude, latitude]);
    });

    // Usar Directions API para calcular la ruta
    const getRoute = (start, end) => {
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?alternatives=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;

      fetch(directionsUrl)
        .then((response) => response.json())
        .then((data) => {
          const route = data.routes[0].geometry;
          if (map.getSource('route')) {
            map.getSource('route').setData({
              type: 'Feature',
              geometry: route
            });
          } else {
            map.addLayer({
              id: 'route',
              type: 'line',
              source: {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: route
                }
              },
              paint: {
                'line-color': '#888',
                'line-width': 8
              }
            });
          }
        })
        .catch((error) => console.error('Error obteniendo la ruta:', error));
    };

    // Esperar a que se obtenga la ubicación del usuario y calcular la ruta
    geocoder.on('result', (e) => {
      const destination = e.result.center;
      if (userLocation) {
        getRoute(userLocation, destination); // Calcular ruta cuando se selecciona un destino
      }
    });

    map.on('load', () => {
      // Cargar y agregar puntos del archivo GeoJSON
      fetch('/monumentos.geojson')
        .then((response) => response.json())
        .then((data) => {
          data.features.forEach((item) => {
            const marker = new mapboxgl.Marker({ color: 'green' })
              .setLngLat(item.geometry.coordinates)
              .setPopup(new mapboxgl.Popup().setHTML(`<h3>${item.properties.title}</h3>`)) // Popup para mostrar el nombre
              .addTo(map);
          });
        })
        .catch((error) => console.error('Error cargando el archivo GeoJSON:', error));

      // Agregar edificios 3D
      map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });
    });

    map.on('load', () => {
      // Cargar y agregar puntos del archivo GeoJSON para restaurantes
      fetch('/restaurantes.geojson')
        .then((response) => response.json())
        .then((data) => {
          data.features.forEach((item) => {
            const marker = new mapboxgl.Marker({ color: 'red' })
              .setLngLat(item.geometry.coordinates)
              .setPopup(new mapboxgl.Popup().setHTML(`<h3>${item.properties.title}</h3>`)) // Popup para mostrar el nombre
              .addTo(map);
          });
        })
        .catch((error) => console.error('Error cargando el archivo GeoJSON:', error));
    });

    return () => map.remove();
  }, [userLocation]); // Vuelve a cargar cuando cambie la ubicación del usuario

  return (
    <div ref={mapContainer} style={{ position: 'relative', width: '100%', height: '100vh' }}></div>
  );
};

export default Map3D;
