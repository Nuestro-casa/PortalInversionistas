import React from 'react'
import { useEffect, useState, ReactNode } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { SelectChangeEvent } from '@mui/material/Select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { Container, Box, Button, ButtonGroup, Typography, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ResponsivePie } from '@nivo/pie'


type DataApiType = {
  [key: string]: number;
  menor_30: number;
  mayor_30: number;
  total: number;
};

/* type DataType = {
  ult_12_meses: DataApiType;
  este_anho: DataApiType;
  ult_6_meses: DataApiType;
}; */
type DataType = {
  [key: string]: any;
};

type ItemType = {
  id: string;
  label: string;
  value: number;
};
type MayHaveLabel = {
  id: string;
  label: string;
  value: number;
};

function PieChartComponentG2() {

  const [responseData, setResponseData] = useState<DataType>({
    ult_12_meses: { menor_30: 0, mayor_30: 0, total: 0 },
    este_anho: { menor_30: 0, mayor_30: 0, total: 0 },
    ult_6_meses: { menor_30: 0, mayor_30: 0, total: 0 },
});
const [selectedDataKey, setSelectedDataKey] = useState<string>('este_anho');
const [selectedValue, setSelectedValue] = useState<string | number>('este_anho');


useEffect(() => {
    const fetchData = async () => {
        try {
            const options = { method: 'GET', headers: { 'User-Agent': 'insomnia/2023.5.8' } };
            const response = await fetch(`https://salesforce-gdrive-conn.herokuapp.com/inversionistas/main/g2?investor=skandia`, options);
            const responseData = await response.json();

            if (responseData) {
                setResponseData(responseData);
            } else {
                console.error('Respuesta de la API vacía');
            }
        } catch (error) {
            console.error(error);
        }
    };

    fetchData();
}, []);


const getColorByKey = (key: string): string => {
  switch (key) {
    case 'a_tiempo':
      return 'green';
    case 'en_mora':
      return 'red';
    default:
      return 'gray';
  }
};

const formattedDataPieG2 = responseData
? responseData[selectedDataKey]
  ? Object.keys(responseData[selectedDataKey])
      .filter((key) => key !== 'total') // Filtra la categoría 'total'
      .map((key: string) => {
        const item = responseData[selectedDataKey][key];
        let categoryLabel = key;

        // Personaliza los nombres de las categorías
        if (key === 'menor_30') {
          categoryLabel = 'Menor a 30 días';
        } else if (key === 'mayor_30') {
          categoryLabel = 'Mayor a 30 días';
        }

        return {
          id: key,
          label: categoryLabel,
          value: item * 100,
          formattedValue: `${(item * 100).toFixed()}%`,
          color: getColorByKey(key), // Reemplaza getColorByKey con tu lógica de asignación de colores
        };
      })
  : []
: [];

    /* Función para actualizar la selección del usuario */
    const handleDataSelection = (dataKey: string) => {
      setSelectedDataKey(dataKey);
  };

  /* Función que controla la selección del dropdown */
  const handleSelectChange = (event: SelectChangeEvent<string | number>, child: ReactNode) => {
      const selectedDataKey = event.target.value as string;
      setSelectedValue(selectedDataKey);
      handleDataSelection(selectedDataKey);
  };



  return (
    <div className="grafica-piecharts" style={{ position: 'relative', width: '100%', height: '380px' }}>
    <div>
        <FormControl fullWidth>
            <Grid container spacing={2} alignItems="center" sx={{ borderBottom: '1px solid #9B9EAB' }}>
                <Grid xs={6} md={6} lg={6}>
                    <Typography variant="subtitle1" sx={{ color: '#ffffff', ml:1 }}>Cartera en mora</Typography>
                </Grid>
                <Grid xs={6} md={6} lg={6} sx={{ textAlign: 'end' }}>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedValue}
                        label="Age"
                        onChange={handleSelectChange}
                        sx={{
                            color: '#9B9EAB',
                            justifyContent: 'flex-end',
                            textAlign: 'end',
                            fill: '#ffffff',
                            '&.MuiSelect-icon': { color: '#FFFFFF !important' },
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        }}
                    >
                        <MenuItem value='este_anho'>Este año</MenuItem>
                        <MenuItem value='ult_6_meses'>Últimos 6 meses</MenuItem>
                        <MenuItem value='ult_12_meses'>Últimos 12 meses</MenuItem>
                    </Select>
                </Grid>
            </Grid>
        </FormControl>
    </div>

    {formattedDataPieG2.length > 0 && (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <ResponsivePie
                data={formattedDataPieG2}
                margin={{ top: 40, right: 80, bottom: 80, left: -40 }}
                startAngle={0}
                innerRadius={0.7}
                padAngle={1}
                activeInnerRadiusOffset={3}
                activeOuterRadiusOffset={8}
                colors={['#6C9FFF', '#B7C6FF']}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 0.2]],
                }}
                enableArcLinkLabels={false}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                enableArcLabels={false}
                arcLabelsRadiusOffset={0.1}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{
                    from: 'color',
                    modifiers: [['darker', 2]],
                }}
                defs={[
                    {
                        id: 'dots',
                        type: 'patternDots',
                        background: 'inherit',
                        color: 'rgba(255, 255, 255, 0.3)',
                        size: 4,
                        padding: 1,
                        stagger: true,
                    },
                    {
                        id: 'lines',
                        type: 'patternLines',
                        background: 'inherit',
                        color: 'rgba(255, 255, 255, 0.3)',
                        rotation: -45,
                        lineWidth: 6,
                        spacing: 10,
                    },
                ]}
               tooltip={(tooltipProps) => {
                    const { id, value, color, formattedValue , label} = tooltipProps.datum;
                  
                    return (
                      <div
                        style={{
                          background: '#000',
                          color: color, // Usa el color personalizado asignado
                          padding: '10px',
                          borderRadius: '5px',
                          fontSize: '14px',
                        }}
                      >
                        <div>
                          <strong> {label}: {formattedValue}%</strong>
                        </div>                                
                      </div>
                    );
                  }} 
                  
                legends={[
                    {
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 68,
                        translateY: 1,
                        itemsSpacing: 7,
                        itemWidth: 111,
                        itemHeight: 35,
                        itemTextColor: '#999',
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 17,
                        symbolShape: 'circle',

                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemTextColor: '#000'
                                }
                            }
                        ]
                    }
                ]}
            />


        </div>

    )
    }
    <div className="centrado" style={{ position: 'absolute', top: '60%', left: '40%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ color: "#ffffff", marginBottom: '8px', textAlign: 'center', fontWeight: '600', fontStyle: 'normal', fontSize: '36px' }}>
            {responseData[selectedDataKey].total.toLocaleString()}
            </Typography>
            <Typography sx={{ color: '#6E7880', textAlign: 'center', fontWeight: '400', fontStyle: 'normal', fontSize: '24px' }}>
                Total
            </Typography>
        </div>
    </div>
</div >
  )
}

export default PieChartComponentG2