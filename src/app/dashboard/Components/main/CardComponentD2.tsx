'use client'
import { useEffect, useState, ReactNode } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { SelectChangeEvent } from '@mui/material/Select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { Container, Box, Card, CardActions, CardContent, Button, ButtonGroup, Typography, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getApiUrl } from '@/app/url/ApiConfig';
import { useAuth } from '@/app/context/authContext';


interface ApiResponse {
    data: number;
  }
function CardComponentD2() {

    const { userEmail } = useAuth();
    const getQueryParameter = (userEmail: string | null): string => {
        if (!userEmail) {
            // En caso de que el correo electrónico no esté disponible
            return "";
        }
        // Verifica el correo electrónico y devuelve el parámetro de consulta correspondiente
        if (userEmail === "fcortes@duppla.co") {
            return "skandia";
        } else if (userEmail === "aarevalo@duppla.co") {
            return "weseed";
        } else if (userEmail === "scastaneda@duppla.co") {
            return "disponible";
        }
        // En caso de que el correo electrónico no coincida con ninguno de los casos anteriores
        return "";
    };

    const [dataApiD2, setDataApiD2] = useState<ApiResponse | null>(null);

    useEffect(() => {
        const queryParameter = getQueryParameter(userEmail);
        const options = { method: 'GET', headers: { 'User-Agent': 'insomnia/2023.5.8' } };

        fetch(getApiUrl(`/main/d2?investor=${queryParameter}`), options)
            .then(response => response.json())
            .then(response => {
                if (typeof response.data === 'number') {
                    setDataApiD2(response); // Coloca el objeto en un array para mantener consistencia
                    /* console.log(response); */
                } else {
                    console.error('El valor de data no es un número:',);
                }
            }).catch(err => console.error(err));
    }, []);

    // Accede directamente al primer elemento del array
    const dataPrueba = dataApiD2;
   /*  const porcentaje = dataApiD2?.data ? (dataApiD2.data * 100).toFixed(1) + '%' : null; */
    /* console.log(dataPrueba + ' dataPrueba en point d2'); */
    const porcentaje = dataApiD2?.data != null
    ? dataApiD2.data % 1 === 0 // Verifica si es un número entero
        ? `${Math.round(dataApiD2.data * 100)}%` // Si es entero, multiplica por 100 y agrega %
        : `${(dataApiD2.data * 100).toFixed(1)}%` // Si tiene decimales, multiplica por 100 y muestra un decimal
    : null;

  return (
    <Box className='size-card-main-d-f' sx={{  backgroundColor:'#020101' , borderRadius:'14px'  /* width: '360px', height:'220px' */ }}>
            <Card className='size-card-main-d-f' sx={{ mt:2 , mb: 2 , backgroundColor:'#020101', borderRadius:'14px', display:'flex', justifyContent:'center', alignContent: 'center', textAlign:'center'}}>
                <CardContent sx={{mt:1 , mb: 1}}>
                    <Typography  component="div" sx={{color: '#5782F2', fontFamily: 'Rustica', fontSize:'18px',fontWeight:'500'}} className='title-D-F' >
                      <p> Participación adquirida </p> 
                    </Typography>
                    <Typography variant="h5"sx={{ mt:0.2, mb: 1.5, color:'#E3E8F3', fontStyle:'normal',fontWeight:'700' }} >
                    <h3>  {/* {dataPrueba?.data}% */}
                    {porcentaje}
                        </h3> 
                    </Typography>                    
                </CardContent>
               
            </Card>
        </Box>
  )
}

export default CardComponentD2