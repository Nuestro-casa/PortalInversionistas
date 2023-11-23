'use client'
import { useEffect, useState, ReactNode } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { SelectChangeEvent } from '@mui/material/Select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { Container, Box, Card, CardActions, CardContent, Button, ButtonGroup, Typography, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';


interface ApiResponse {
    data: number;
  }
function CardComponentF2() {
    const [dataApiF2, setDataApiF2] = useState<ApiResponse | null>(null);

    useEffect(() => {
        const options = { method: 'GET', headers: { 'User-Agent': 'insomnia/2023.5.8' } };

        fetch('https://salesforce-gdrive-conn.herokuapp.com/inversionistas/main/f2?investor=skandia', options)
            .then(response => response.json())
            .then(response => {
                if (typeof response.data === 'number') {
                    setDataApiF2(response); // Coloca el objeto en un array para mantener consistencia
                    /* console.log(response); */
                } else {
                    console.error('El valor de data no es un número:', response);
                }
            }).catch(err => console.error(err));
    }, []);
      // Accede directamente al primer elemento del array
      const dataPrueba = dataApiF2;
      const porcentaje = dataApiF2?.data ? (dataApiF2.data * 100).toFixed(1) + '%' : null;
      /* console.log(dataPrueba + ' dataPrueba en point d2'); */



  return (
    <Box sx={{ backgroundColor:'#020101', borderRadius:'14px' , width: '360px', height:'220px' }}>
            <Card sx={{ mt:4, backgroundColor:'#020101', borderRadius:'14px', display:'flex', justifyContent:'center', alignContent: 'center', textAlign:'center'}}>
                <CardContent sx={{mt:4}}>
                    <Typography  component="div" sx={{color: '#5782F2', fontFamily: 'Roboto', fontSize:'30px',fontWeight:'500'}}>
                      <p> Tasa de morosidad </p> 
                    </Typography>
                    <Typography variant="h5"sx={{ mt:2, mb: 1.5, color:'#E3E8F3', fontStyle:'normal',fontWeight:'700' }} >
                    <h1>  {/* {dataPrueba?.data}% */}
                    {porcentaje}
                        </h1> 
                    </Typography>                    
                </CardContent>
               
            </Card>
        </Box>
  )
}

export default CardComponentF2