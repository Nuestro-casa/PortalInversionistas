'use client'
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
import { useAuth } from '@/app/context/authContext';

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
  barrio: string,
  mora: string,
  categoria_mora: string,
  valor_inmueble: number,
}

interface CityData {
  [key: string]: Location[];
}

function MapComponentC() {

  const { userEmail } = useAuth();
  const getQueryParameter = (userEmail: string | null): string => {
      if (!userEmail) {
          // En caso de que el correo electrónico no esté disponible
          return "";
      }
      // Verifica el correo electrónico y devuelve el parámetro de consulta correspondiente
      if (userEmail === "fcortes@duppla.co" || userEmail === "fernando@skandia.co") {
        return "skandia";
    } else if (userEmail === "aarevalo@duppla.co" || userEmail === "fernando@weseed.co") {
        return "weseed";
    } else if (userEmail === "scastaneda@duppla.co") {
        return "disponible";
    } 
      // En caso de que el correo electrónico no coincida con ninguno de los casos anteriores
      return "";
    };

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
    const queryParameter = getQueryParameter(userEmail);   
    const fetchData = async () => {
      try {
        const response = await fetch(getApiUrlFinal(`/inmuebles/c/?investor=${queryParameter}`));
        

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
  }, [map]);


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



  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (map && data[city] && data[city].length > 0) {
      const center = calculateAverageCoordinates(data[city]);
      map.flyTo({ center, zoom: 12 }); // Ajusta el zoom según tus necesidades
    }
  };

  const formatNumber = (value: any) => {
    const suffixes = ["", "K", "M", "B", "T"];
    let suffixNum = 0;
  
    while (value >= 1000 && suffixNum < suffixes.length - 1) {
      value /= 1000;
      suffixNum++;
    }
  
    return value.toFixed(0) + suffixes[suffixNum];
  };
  

  const addMarkersToMap = () => {
    Object.keys(data).forEach(city => {
      data[city].forEach((location, index) => {
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
  
        markerElement.innerHTML = '🏠'; // Puedes cambiar este emoji 
        markerElement.style.fontSize = '26px'; // Ajusta el tamaño emoji  
  
        let popupContent = `
          <p style="color: black;"><strong>${city}</strong></p>
          <p style="color: black;"><strong>Barrio:</strong> ${location.barrio}</p>
          <p style="color: black;"><strong>Valor del inmueble:</strong> ${formatNumber(location.valor_inmueble)}</p>
          <p style="color: black;"><strong>¿Está en mora?:</strong> ${location.mora}</p>
        `;
          // Agregar categoría de mora si es necesario
        if (location.mora === 'si') {
          popupContent += `<p style="color: black;"><strong>¿Cuánto?:</strong> ${location.categoria_mora}</p>`;
        }
  
        const popup = new mapboxgl.Popup().setHTML(popupContent);
  
        new mapboxgl.Marker({ element: markerElement })
          .setLngLat([location.longitud, location.latitud])
          .setPopup(popup)
          .addTo(map!);
  
        // Agregar evento de clic al marcador
        markerElement.addEventListener('click', () => handleMarkerClick(location));
  
        // Agregar evento close al popup
        popup.on('close', () => handlePopupClose());
      });
    });
  };
  
  
  const handlePopupClose = () => {
    // Acción a realizar cuando se cierra el tooltip
    if (map && selectedCity && data[selectedCity]) {
      map.flyTo({
        center: calculateAverageCoordinates(data[selectedCity]),
        zoom: 11,
      });
      // Puedes agregar más acciones si es necesario
    }
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
         {/*  <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-start', mt: 2 }}>
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
 */}
 <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-start', mt: 2 }}>
          {data['BOGOTÁ D.C.'] && (
            <Button
              variant="outlined"
              onClick={() => handleCityChange('BOGOTÁ D.C.')}
              disabled={selectedCity === 'BOGOTÁ D.C.'}
              sx={{
                borderRadius: '10px',
                color: '#ffffff',
                fontFamily: 'Rustica',
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '16px',
                textTransform: 'none',
                width: '200px',
                backgroundColor: '#6C9FFF',
                borderColor: '#6C9FFF',
                '&:hover': {
                  backgroundColor: '#3158A3',
                  borderColor: '#3158A3',
                },
                '&.Mui-disabled': {
                  color: '#9A9A9A',
                  backgroundColor: '#3158A3',
                },
              }}
            >
              Bogotá
            </Button>
          )}
          {data['MOSQUERA'] && (
            <Button
              variant="outlined"
              onClick={() => handleCityChange('MOSQUERA')}
              disabled={selectedCity === 'MOSQUERA'}
              sx={{
                borderRadius: '10px',
                color: '#ffffff',
                fontFamily: 'Roboto',
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '16px',
                textTransform: 'none',
                width: '200px',
                backgroundColor: '#6C9FFF',
                borderColor: '#6C9FFF',
                '&:hover': {
                  backgroundColor: '#3158A3',
                  borderColor: '#3158A3',
                },
                '&.Mui-disabled': {
                  color: '#9A9A9A',
                  backgroundColor: '#3158A3',
                },
              }}
            >
              Alrededores Bogotá
            </Button>
          )}
          {data['MEDELLÍN'] && (
            <Button
              variant="outlined"
              onClick={() => handleCityChange('MEDELLÍN')}
              disabled={selectedCity === 'MEDELLÍN'}
              sx={{
                borderRadius: '10px',
                color: '#ffffff',
                fontFamily: 'Roboto',
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '16px',
                textTransform: 'none',
                width: '200px',
                backgroundColor: '#6C9FFF',
                borderColor: '#6C9FFF',
                '&:hover': {
                  backgroundColor: '#3158A3',
                  borderColor: '#3158A3',
                },
                '&.Mui-disabled': {
                  color: '#9A9A9A',
                  backgroundColor: '#3158A3',
                },
              }}
            >
              Medellín
            </Button>
          )}
        </Stack>

        </div>
      </div>
    </ThemeProvider>
  );
}

export default MapComponentC;