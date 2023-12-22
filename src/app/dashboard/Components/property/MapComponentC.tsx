import mapboxgl, { LngLatLike } from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import React, { useEffect, useRef, useState } from 'react'
import { Map } from 'mapbox-gl'
import { Container, Box, Button, ButtonGroup, Typography, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Link from 'next/link';
import RoomIcon from '@mui/icons-material/Room';
import ReactDOM from 'react-dom';
import { SelectChangeEvent } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getApiUrl } from '@/app/url/ApiConfig';
import { getApiUrlFinal } from '@/app/url/ApiConfig';

const themeBtn = createTheme({
  palette: {
    primary: {
      main: '#ffffff',
      light: '#3158A3',
      dark: '#9B9EAB',
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: '#ffffff',
      light: '#3158A3',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#47008F',
    },
    error: {
      main: '#FF0000', // Color rojo para resaltar errores
    },
  },
});

mapboxgl.accessToken = 'pk.eyJ1IjoiYWFyZXZhbG8iLCJhIjoiY2xwaWxxNGgwMDBtZDJwdGo0YjZzNHlnZyJ9.X_xxMOm_DCKERmwnhC4izA';
interface Location {
  latitud: number;
  longitud: number;
}

interface CityData {
  [key: string]: Location[];
}

function MapComponentC() {
  const mapDivC = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [data, setData] = useState<CityData>({});
  const [selectedCity, setSelectedCity] = useState<string>('BOGOTÁ D.C.');
  const [centroid, setCentroid] = useState<LngLatLike | null>(null);

  // Función para calcular el centro promedio de un conjunto de ubicaciones
  function calculateAverageCoordinates(locations: Location[]): mapboxgl.LngLatLike {
    const totalCoordinates = locations.length;
    const sumLat = locations.reduce((sum, location) => sum + location.latitud, 0);
    const sumLng = locations.reduce((sum, location) => sum + location.longitud, 0);

    const avgLat = sumLat / totalCoordinates;
    const avgLng = sumLng / totalCoordinates;

    return [avgLng, avgLat]; // Devolver un objeto LngLatLike
  }


  useEffect(() => {
    console.log('Efecto ejecutado');
    const fetchData = async () => {
      try {
        const response = await fetch(getApiUrlFinal('/inmuebles/c/?investor=Skandia'));
        /*  const response = await fetch('https://backend-portal-inversionistas-c6f90ae68a14.herokuapp.com/inversionistas/inmuebles/c/?investor=Skandia'); */

        if (!response.ok) {
          console.error('Error en la respuesta del servidor:', response.status, response.statusText);
          return;
        }

        const result = await response.json();
        /*  console.log('Resultado de data:', result); */
        setData(result);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchData();

    const initializeMap = () => {
      const locations = data[selectedCity];
      let defaultCenter: mapboxgl.LngLatLike /* = { lng: -74.5, lat: 4 } */ | undefined = undefined;

      if (locations && locations.length > 0) {
        // Calcular el centro promedio si hay ubicaciones
        const center = calculateAverageCoordinates(locations);
        defaultCenter = { lng: (center as [number, number])[0], lat: (center as [number, number])[1] };

      }
      // Establecer el valor por defecto en la mitad de Colombia si no hay ubicaciones
      if (!defaultCenter) {
        defaultCenter = { lng: -74.2973, lat: 4.7709 }; // Bogotá
      }

      const newMap = new mapboxgl.Map({
        container: mapDivC.current!, // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: defaultCenter, // Usar el centro calculado o el por defecto
        zoom: 12, // Zoom por defecto
      });

      // Desactiva el marcador por defecto
      newMap.once('load', () => {
        newMap.setLayoutProperty('country-label', 'visibility', 'none');
      });
      setMap(newMap);
      // Llamar a la función fetchData para obtener datos del endpoint

      fetchData();
    };

    if (!map) {
      initializeMap();
    }
    // Limpieza al desmontar el componente
    return () => {
      map && map.remove()
    };
  }, [map,]);


  const calculateCityCenter = (city: string) => {
    const locations = data[city];
    if (locations && locations.length > 0 && map) {
      const center = calculateAverageCoordinates(locations);
      // Realizar un nuevo flyTo para actualizar el centro del mapa
      map.flyTo({ center, zoom: 10 });
    }
  };

  useEffect(() => {
    if (map && selectedCity && data[selectedCity]) {
      calculateCityCenter(selectedCity);
      addMarkersToMap();
    }
  }, [map, selectedCity, data]);


  // Función para cambiar la ciudad seleccionada y centrar el mapa en esa ciudad
  /*  const handleCityChange = (city: string) => {
     setSelectedCity(city);
     if (map && data[city] && data[city].length > 0) {
       const center = data[city][0]; // Tomar la primera ubicación como referencia
       map.setCenter([center.longitud, center.latitud]);
       map.setZoom(80); // Puedes ajustar el zoom según tus necesidades
     }
   }; */
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (map && data[city] && data[city].length > 0) {
      const center = calculateAverageCoordinates(data[city]);
      map.flyTo({ center, zoom: 12 }); // Ajusta el zoom según tus necesidades
    }
  };

  // Función para agregar marcadores al mapa
  /*   const addMarkersToMap = () => {
      Object.keys(data).forEach(city => {
        data[city].forEach(location => {
          // Crear un elemento de marcador personalizado con una clase específica
          const markerElement = document.createElement('div');
          markerElement.className = 'custom-marker';
  
          // Puedes personalizar el estilo del marcador aquí
          markerElement.style.backgroundColor = '#FF864B'; // Cambia el color del fondo
          markerElement.style.width = '18px'; // Cambia el ancho del marcador
          markerElement.style.height = '18px'; // Cambia la altura del marcador
          markerElement.style.borderRadius = '80%'; // Hace que el marcador sea circular
  
          new mapboxgl.Marker({ element: markerElement })
            .setLngLat([location.longitud, location.latitud])
            .setPopup(new mapboxgl.Popup().setHTML(`<p>${city}</p>`))
            .addTo(map!);
        });
      });
    }; */
  const addMarkersToMap = () => {
    Object.keys(data).forEach(city => {
      data[city].forEach((location, index) => {
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
       
        markerElement.innerHTML = '🏠'; // Puedes cambiar este emoji según tus necesidades
        markerElement.style.fontSize = '26px'; // Ajusta el tamaño según tus necesidades
  
      /*   markerElement.style.backgroundColor = '#FF864B';
        markerElement.style.width = '18px';
        markerElement.style.height = '18px';
        markerElement.style.borderRadius = '80%'; */

        new mapboxgl.Marker({ element: markerElement })
          .setLngLat([location.longitud, location.latitud])
         /*  .setPopup(new mapboxgl.Popup().setHTML(`<p>${city}</p>`)) */
/*          .setPopup(new mapboxgl.Popup().setHTML(`<p>Dirección: ${location.direccion}</p><p>Barrio: ${location.barrio}</p>`)) */
         .setPopup(new mapboxgl.Popup().setHTML(`<p>Dirección: 'prueba '</p><p>Barrio:' prueba'</p>`))
          .addTo(map!);

        // Agregar evento de clic al marcador
        markerElement.addEventListener('click', () => handleMarkerClick(location));
      });
    });
  };
  const handleMarkerClick = (location: Location) => {
    if (map) {
      map.flyTo({ center: [location.longitud, location.latitud], zoom: 15 });
    }
  };

  // Actualizar marcadores cuando los datos o la ciudad cambien
  useEffect(() => {
    if (map && selectedCity && data[selectedCity]) {
      map.flyTo({
        center: calculateAverageCoordinates(data[selectedCity]),
        zoom: 11,
      });
      addMarkersToMap();
    }
  }, [map, selectedCity, data]);



  return (
    <ThemeProvider theme={themeBtn}>
      <div style={{ width: '100%', height: '540px' }}>
        <div ref={mapDivC} style={{ width: '100%', height: '100%', borderRadius: '20px' }} />

        <div>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-start', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleCityChange('BOGOTÁ D.C.')}
              disabled={selectedCity === 'BOGOTÁ D.C.'}
              sx={{
                borderRadius: '10px',
                color: '#ffffff', // Letra blanca
                fontFamily: 'Rustica',
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '16px',
                textTransform: 'none',
                width: '200px',
                backgroundColor: '#6C9FFF',
                borderColor: '#6C9FFF', // Color de borde normal
                '&:hover': {
                  backgroundColor: '#3158A3', // Cambia el fondo al pasar el mouse
                  borderColor: '#3158A3', // Cambia el borde al pasar el mouse
                },
                '&.Mui-disabled': {
                  color: '#9A9A9A',
                  backgroundColor: '#3158A3',
                  // Letra blanca cuando está deshabilitado
                },
              }}
            >
              Bogotá
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleCityChange('MOSQUERA')}
              disabled={selectedCity === 'MOSQUERA'}
              sx={{
                borderRadius: '10px',
                color: '#ffffff', // Letra blanca
                fontFamily: 'Roboto',
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '16px',
                textTransform: 'none',
                width: '200px',
                backgroundColor: '#6C9FFF',
                borderColor: '#6C9FFF', // Color de borde normal
                '&:hover': {
                  backgroundColor: '#3158A3', // Cambia el fondo al pasar el mouse
                  borderColor: '#3158A3', // Cambia el borde al pasar el mouse
                },
                '&.Mui-disabled': {
                  color: '#9A9A9A',
                  backgroundColor: '#3158A3',
                  // Letra blanca cuando está deshabilitado
                },
              }}
            >
              Alrededores Bogotá
            </Button>

            <Button
              variant="outlined"
              onClick={() => handleCityChange('MEDELLÍN')}
              disabled={selectedCity === 'MEDELLÍN'}
              sx={{
                borderRadius: '10px',
                color: '#ffffff', // Letra blanca
                fontFamily: 'Roboto',
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '16px',
                textTransform: 'none',
                width: '200px',
                backgroundColor: '#6C9FFF',
                borderColor: '#6C9FFF', // Color de borde normal
                '&:hover': {
                  backgroundColor: '#3158A3', // Cambia el fondo al pasar el mouse
                  borderColor: '#3158A3', // Cambia el borde al pasar el mouse
                },
                '&.Mui-disabled': {
                  color: '#9A9A9A',
                  backgroundColor: '#3158A3',
                  // Letra blanca cuando está deshabilitado
                },
              }}
            >
              Medellín
            </Button>
          </Stack>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default MapComponentC;