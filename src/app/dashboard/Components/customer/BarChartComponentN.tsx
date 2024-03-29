'use client'
import { ResponsiveBar } from '@nivo/bar'
import { useEffect, useState, ReactNode } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { SelectChangeEvent } from '@mui/material/Select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';


import { Container, Box, Button, ButtonGroup, Typography, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getApiUrl, getApiUrlFinal } from '@/app/url/ApiConfig';
import { internal_processStyles } from '@mui/styled-engine-sc';
import { useAuth } from '@/app/context/authContext';
import { GridValues } from '@nivo/axes';



type DataApiType = {
    fecha: string;
    arriendo: any;
    capital: any;
    intereses: any;
    prepago: any;
};

type DataType = {
    ult_12_meses: DataApiType[];
    este_anho: DataApiType[];
    ult_6_meses: DataApiType[];
};

type ItemType = {
    fecha: string;
    arriendo: number;
    capital: number;
    intereses: number;
    prepago: number;
};


function BarChartComponentN() {

    // Extrae el correo electrónico del localStorage
    const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;

    const { userEmail } = useAuth();
  
    let first = true;

    const [data, setData] = useState<DataType | null>(null);
    const [responseData, setResponseData] = useState<any>(null);
    const [dataApi, setDataApi] = useState<DataType[]>([]);
    const [selectedDataKeyN, setSelectedDataKeyN] = useState<string>('ult_12_meses');
    const [selectedValue, setSelectedValue] = useState<string | number>('ult_12_meses');
    const [menuOpen, setMenuOpen] = useState(false);


    let gridYValues: GridValues<number> | undefined = [];

    useEffect(() => {
        if (!userEmail) {
            return;
        }
        const queryParameter = userEmail;
        const fetchData = async () => {
            try {
                const options = { method: 'GET', headers: { 'User-Agent': 'insomnia/2023.5.8' } };
                const response = await fetch(getApiUrlFinal(`/clientes/n?email=${queryParameter}`), options);

                const responseData = await response.json();
                setResponseData(responseData);
                setData(responseData); // Actualiza los datos cuando la respuesta de la API llega
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);


    /* Función para actualizar la selección del usuario */
    const handleDataSelection = (dataKey: string) => {
        setSelectedDataKeyN(dataKey);
    };

    /* Función que controla la selección del dropdown */
    const handleSelectChange = (event: SelectChangeEvent<string | number>, child: ReactNode) => {
        const selectedDataKeyN = event.target.value as string;
        setSelectedValue(selectedDataKeyN);
        handleDataSelection(selectedDataKeyN);
    };

    const formattedDataN = responseData && responseData[selectedDataKeyN]
        ? responseData[selectedDataKeyN].map((item: ItemType, index: number) => {
            // Convertir la fecha a un objeto Date
            const dateObject = new Date(item.fecha);

            // Verificar que la fecha es válida antes de usarla
            const isValidDate = !isNaN(dateObject.getTime()) && isFinite(dateObject.getTime());

            // Usar un identificador único en lugar de la fecha directamente
            const uniqueKey = isValidDate ? dateObject.getTime() : `invalid_date_${index}`;

            return {
                fecha: item.fecha,
                'Intereses moratorios': item.intereses,
                Arriendo: item.arriendo,
                Adelanto: item.prepago,
                // Usar el identificador único como clave
                key: uniqueKey,
            };
        })
        : [];


    /* prueba de formateo data a legible */
    function formatNumber(value: number): string {
        return (value / 1000000).toFixed(0) + " M";
    }

    /* prueba de formateo data a legible tooltip */
    function formatNumberTooltip(value: number): string {
        var millones = (value / 1000000).toFixed(1);
        var shortValue = millones.endsWith('.0') ? millones.slice(0, -2) : millones;

        return shortValue + " M";
    }

    // Dentro de tu componente, después de obtener los datos del API
    const arriendoValues = formattedDataN.map((item: any) => typeof item.Arriendo === 'number' ? item.Arriendo : 0);
    const prepagoValues = formattedDataN.map((item: any) => typeof item.Adelanto === 'number' ? item.Adelanto : 0);
    const interesesValues = formattedDataN.map((item: any) => typeof item.Intereses === 'number' ? item.Intereses : 0);

    // Suma de los máximos de todas las categorías

    const calculateTickValues = () => {
        var maxTotal = 0;
        for (var i = 0; i < arriendoValues.length; i++) {
            var totalMes = arriendoValues[i] + prepagoValues[i] + interesesValues[i];
            if (totalMes > maxTotal) {
                maxTotal = totalMes;
            }
        }

        const tickCount = 6;
        var count = 0;
        var tickIni = 500000;
        var tickStep = tickIni;
        var mult = tickIni / 10;
        while ((maxTotal / tickCount) > tickStep) {
            if (count % 4 == 0) {
                mult *= 10;
                tickStep += mult;
            }
            else if (count % 2 == 0) {
                tickStep += mult;
            }
            else {
                tickStep *= 2;
            }
            count++;
        }
        return Array.from({ length: tickCount + 1 }, (_, index) => index * tickStep);
    };

    if (data != null && first) {
        gridYValues = calculateTickValues();
        first = false;
    }

    return (
        <div className='grafica-barcharts nivo-text'>
            <div>
                <FormControl fullWidth>
                    <Grid container spacing={2} alignItems="center" sx={{ borderBottom: '1px solid #9B9EAB' }}>
                        <Grid xs={6} md={6} lg={6}>
                            <Typography className='title-dropdown-menu-container' variant="subtitle1" sx={{ fontFamily: 'Helvetica', fontWeight: 300, color: '#ffffff', fontSize: '26px', mt: 2 }}>Pagos mensuales y destino</Typography>
                        </Grid>
                        <Grid xs={6} md={6} lg={6} sx={{ textAlign: 'end' }}>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedValue}
                                label="Age"
                                onChange={handleSelectChange}
                                sx={{
                                    color: '#9B9EAB', justifyContent: 'flex-end', textAlign: 'end', fill: '#ffffff', '&.MuiSelect-icon': { color: '#FFFFFF !important' },
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                }}
                                MenuProps={{
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    },
                                    transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'right',
                                    },

                                    PaperProps: {
                                        sx: {
                                            backgroundColor: '#212126', // Fondo del menú desplegado
                                            border: '1px solid #5682F2', // Borde azul
                                            color: '#9B9EAB', // Letra blanca
                                        },
                                    },
                                }}
                                open={menuOpen}
                                onClose={() => setMenuOpen(false)} // Cierra el menú cuando se hace clic fuera de él
                                onOpen={() => setMenuOpen(true)}   // Abre el menú cuando se hace clic en el botón

                                IconComponent={() => (
                                    // Cambia el ícono según el estado del menú
                                    menuOpen ? (
                                        <ArrowDropUpIcon
                                            style={{ color: '#9B9EAB', fill: '#9B9EAB', marginLeft: '-20px' }}
                                            onClick={() => setMenuOpen(!menuOpen)}
                                        />
                                    ) : (
                                        <ArrowDropDownIcon
                                            style={{ color: '#9B9EAB', fill: '#9B9EAB', marginLeft: '-20px' }}
                                            onClick={() => setMenuOpen(!menuOpen)}
                                        />
                                    )
                                )}
                            >
                                {/* <MenuItem value='este_anho'>Este año</MenuItem> */}
                                <MenuItem value='ult_6_meses'>Últimos 6 meses</MenuItem>
                                <MenuItem value='ult_12_meses'>Últimos 12 meses</MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                </FormControl>
            </div>
            {data == null ? <div></div> :
                <ResponsiveBar
                    data={formattedDataN}
                    keys={['Arriendo', 'Adelanto', 'Intereses moratorios',]}
                    indexBy="fecha"
                    label={() => ''}
                    margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
                    padding={0.7}
                    maxValue={gridYValues[gridYValues.length - 1]}
                    valueScale={{ type: 'linear', min: 0 }}
                    indexScale={{ type: 'band', round: true }}
                    colors={['#5782F2', '#5ED1B1', ' #FFB024']}
                    theme={{
                        axis: {
                            ticks: {
                                text: {
                                    fill: '#9B9EAB', // Color del texto en los ejes
                                },
                            },
                        },
                        legends: {
                            text: {
                                fill: '#9B9EAB', // Color del texto de las leyendas
                            },
                        },
                        tooltip: {
                            container: {
                                background: 'black', // Fondo del tooltip
                                color: '#9B9EAB', // Color del texto del tooltip
                            },
                        },
                        grid: {
                            line: {
                                stroke: '#41434C' /* '#5C5E6B' */, // Cambia el color de las líneas de la cuadrícula
                            },
                        },
                    }}
                    groupMode="stacked"

                    tooltip={(point) => {
                        if (typeof point.data.fecha === 'string') {
                            const [year, month] = point.data.fecha.split('-');
                            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                            const formattedDate = `${monthNames[parseInt(month, 10) - 1]} ${year}`;
                            const formattedValue = formatNumberTooltip(Number(point.data[point.id]));

                            return (
                                <div style={{ background: 'black', padding: '8px', borderRadius: '4px', color: 'white' }}>
                                    <strong>{formattedDate}</strong>
                                    <div>{point.id}: {formattedValue}</div>
                                </div>
                            );
                        }
                        return null;
                    }}
                    borderRadius={4}
                    borderColor={{
                        from: 'color',
                        modifiers: [
                            [
                                'darker',
                                1.6
                            ]
                        ]
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: '',
                        legendPosition: 'middle',
                        legendOffset: 32,
                        tickValues: formattedDataN.map((item: { fecha: string }) => item.fecha),
                        format: (value) => {
                            if (typeof value === 'string') {
                                const [year, month] = value.split('-');
                                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                                const shortYear = year.slice(2); // Obtiene los últimos dos dígitos del año
                                return `${monthNames[parseInt(month, 10) - 1]} ${shortYear}`;
                            } else {
                                return value; // O proporciona un valor predeterminado si no es una cadena
                            }
                        },

                    }}
                    /*  gridYValues={[0, 4000000, 8000000, 12000000, 16000000]} */
                    gridYValues={gridYValues}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        /*  tickValues: [0, 4000000, 8000000, 12000000, 16000000], */
                        tickValues: gridYValues,
                        legend: '',
                        legendPosition: 'middle',
                        legendOffset: -40,
                        format: value => formatNumber(value),
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{
                        from: 'color',
                        modifiers: [
                            [
                                'darker',
                                1.6
                            ]
                        ]
                    }}
                    legends={[
                        {
                            dataFrom: 'keys',
                            anchor: 'bottom-left',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: 54,
                            itemsSpacing: 20,
                            itemDirection: 'left-to-right',
                            itemWidth: 80,
                            itemHeight: 20,
                            itemOpacity: 0.75,
                            symbolSize: 12,
                            symbolShape: 'square',
                            symbolBorderColor: 'rgba(0, 0, 0, .5)',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemBackground: 'rgba(0, 0, 0, .03)',
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}
                    role="application"
                    ariaLabel="Nivo bar chart demo"
                    barAriaLabel={e => e.id + ": " + e.formattedValue + " in country: " + e.indexValue}
                />}
        </div>
    )

}

export default BarChartComponentN