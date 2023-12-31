import { useEffect, useState, ReactNode } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { SelectChangeEvent } from '@mui/material/Select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { FormControl, Typography, Select, MenuItem } from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import { DatumValue } from '@nivo/core';
import { getApiUrl, getApiUrlFinal } from '@/app/url/ApiConfig';
import { useAuth } from '@/app/context/authContext';

interface Item {
    [key: string]: any;
    fecha: string;
    unidades: number | null;
}


type DataType = {
    ult_12_meses: any[];
    este_anho: any[];
    ult_6_meses: any[];
    [key: string]: any;
};

type DataApiType = {
    fecha: string;
    fair_market_price: number;
    valor_contractual: number;
    formattedY?: string; // Agregamos formattedY al tipo
};



const LineChartComponentB = () => {
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

    const [data, setData] = useState<DataType>({ ult_12_meses: [], este_anho: [], ult_6_meses: [] });
    const [selectedDataKey, setSelectedDataKey] = useState<string>('ult_12_meses');
    const [selectedValue, setSelectedValue] = useState<string | number>('ult_12_meses');
    const [transformedDataContractual, setTransformedDataContractual] = useState<{ x: string; y: number }[]>([]);
    const [transformedDataFairMarket, setTransformedDataFairMarket] = useState<{ x: string; y: number }[]>([]);
    const [menuOpen, setMenuOpen] = useState(false);
    // Nuevos estados para valores dinámicos del eje y
    const [gridYValues, setGridYValues] = useState<number[]>([]);
    const [tickValues, setTickValues] = useState<number[]>([]);

    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const queryParameter = getQueryParameter(userEmail); 
        const fetchData = async () => {
            try {
                const options = { method: 'GET', headers: { 'User-Agent': 'insomnia/2023.5.8' } };
                const response = await fetch(getApiUrlFinal(`/principal/b?investor=${queryParameter}`), options);
                /*  const response = await fetch(getApiUrl('/inmuebles/b?investor=skandia'), options);  */

                const newData = await response.json();

                setData((prevData) => {
                    const updatedData = { ...prevData };
                    updatedData[selectedValue.toString()] = newData[selectedValue.toString()];
                    return updatedData;
                });

                handleDataSelection(selectedValue.toString());
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        setLoading(true); // Iniciar la carga
        fetchData();

    }, [selectedValue]);


    const handleDataSelection = (dataKey: string) => {
        setSelectedDataKey(dataKey);
    };

    const handleSelectChange = (event: SelectChangeEvent<string | number>) => {
        const selectedOption = event.target.value as string;
        setSelectedValue(selectedOption);
        handleDataSelection(selectedOption);
    };

    /*  función para formateo data según requerimiento de la gráfica */

    const transformData = (data: DataType, selectedDataKey: string, field: keyof DataApiType) => {
        return (data[selectedDataKey as keyof DataType] as DataApiType[]).map((item) => {
            /* console.log("Raw value:", item[field]); */

            const numericValue = typeof item[field] === 'number'
                ? item[field] as number
                : typeof item[field] === 'string'
                    ? parseFloat(item[field] as string)
                    : NaN;

            // Formateamos el valor y añadimos el sufijo "M"
            const formattedValue = !isNaN(numericValue)
                ? (numericValue >= 1000000
                    ? (numericValue / 1000000).toFixed(0) + 'M'
                    : numericValue.toLocaleString())
                : 'N/A';

            return {
                x: item.fecha,
                y: !isNaN(numericValue) ? numericValue : 0,
                formattedY: formattedValue, // Agregamos una propiedad adicional para el valor formateado
            };
        });
    };




    // Calcula los valores máximos y mínimos
    const calculateMinMaxValues = (data: DataApiType[]) => {
        const values = data.map(item => item.fair_market_price);
        values.push(...data.map(item => item.valor_contractual));

        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        return { minValue, maxValue };
    };

    /*    console.log("Data from API:", data); */


    useEffect(() => {
        if (data[selectedDataKey]) {
            // Calcula los valores máximos y mínimos al actualizar la data
            const { minValue, maxValue } = calculateMinMaxValues(data[selectedDataKey]);

            // Calcula los nuevos valores para el eje y
            const newGridYValues = Array.from({ length: 5 }, (_, i) => minValue + (i / 4) * (maxValue - minValue));

            // Actualiza los valores en el componente
            setGridYValues(newGridYValues);
            setTickValues(newGridYValues);
        }
    }, [data, selectedDataKey]);


    useEffect(() => {
        if (data[selectedDataKey]) {
            // Actualización de datos de gráfico aquí
            setTransformedDataContractual(transformData(data, selectedDataKey, 'valor_contractual'));
            setTransformedDataFairMarket(transformData(data, selectedDataKey, 'fair_market_price'));
        }
    }, [data, selectedDataKey]);


    /*  console.log("Min and Max Values:", calculateMinMaxValues(data[selectedDataKey])); */
    // Función para redondear y formatear el valor
    const formatTooltipValue = (value: number) => {
        const millionValue = value / 1000000;
        const roundedMillionValue = Math.round(millionValue);
        return `${roundedMillionValue}M`;
    };

    const formatYAxisValue = (value: number) => {
        const millionValue = value / 1000000;
        const roundedMillionValue = Math.round(millionValue);
        return `${roundedMillionValue}M`;
    };

    /*     console.log("Transformed data:", transformedDataContractual);
            console.log("Transformed data Market:", transformedDataFairMarket); 
     */

    return (
        <div className='grafica-linecharts-b nivo-text'>
                    <div>
                        <FormControl fullWidth>
                            <Grid container spacing={2} alignItems="center" sx={{ borderBottom: '1px solid #9B9EAB', mt: 1 }}>
                                <Grid xs={6} md={6} lg={6}>
                                    <Typography className='title-dropdown-menu-container' variant="subtitle1" sx={{ fontFamily: 'Helvetica', fontWeight: 300, color: '#ffffff', fontSize: '26px', mt: 2 }}>Valor de los inmuebles</Typography>

                                </Grid>
                                <Grid xs={6} md={6} lg={6} sx={{ textAlign: 'end' }}>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={selectedValue}
                                        label="Age"
                                        onChange={handleSelectChange}
                                        /*  IconComponent={() => <KeyboardArrowDownIcon />} */

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
                                            /*   getContentAnchorEl: null, */
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
                                       {/*  <MenuItem value='este_anho'>Este año</MenuItem> */}
                                        <MenuItem value='ult_6_meses'>Últimos 6 meses</MenuItem>
                                        <MenuItem value='ult_12_meses'>Últimos 12 meses</MenuItem>
                                    </Select>
                                </Grid>
                            </Grid>
                        </FormControl>
                    </div>
            {loading && <Typography sx={{color: '#212126'}}>Cargando...</Typography>}
            {!loading && (
            
                    <ResponsiveLine
                        axisBottom={{
                            legend: '',
                            legendOffset: -12,
                            tickValues: 'every month',
                            format: (value) => {
                                const date = new Date(value);
                                const month = new Intl.DateTimeFormat('es', { month: 'short' }).format(date);
                                return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear().toString().slice(2)}`;
                                /*  return `${date.toLocaleString('default', { month: 'short' }).charAt(0).toUpperCase()}${date.toLocaleString('default', { month: 'short' }).slice(1)} ${date.getFullYear()}`; */

                            },
                        }}
                        /*   gridYValues={[200000000, 300000000, 400000000, 500000000, 600000000]} */
                        gridYValues={gridYValues}
                        axisLeft={{
                            legend: '',
                            legendOffset: 12,
                            /*  tickValues: [200000000, 300000000, 400000000, 500000000, 600000000], */
                            tickValues: tickValues,
                            /*  format: (value) => `${value M`, */
                            format: (value) => formatYAxisValue(value),
                        }}

                        tooltip={(point) => {
                            const date = new Date(point.point.data.x);
                            const formattedValue = typeof point.point.data.y === 'number'
                                ? formatTooltipValue(point.point.data.y)
                                : 'N/A';

                            return (
                                <div style={{ background: '#272727', color: 'white', padding: '9px 12px', border: '1px solid #ccc' }}>
                                    <div style={{ color: '#C5F5CA' }}>
                                        <strong>{`Fecha: ${date.toLocaleString('default', { month: 'short' }).charAt(0).toUpperCase()}${date.toLocaleString('default', { month: 'short' }).slice(1)} ${date.getFullYear()}`}</strong>
                                    </div>
                                    <div style={{ color: '#FF864B' }}>{`Valor: ${formattedValue}`}</div>
                                </div>
                            );
                        }}

                        curve="monotoneX"

                        data={[
                            {
                                data: transformedDataContractual,
                                id: 'Contractual'
                            },
                            {
                                data: transformedDataFairMarket,
                                id: 'Fair Market Price'
                            },

                        ]}
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
                                    background: '#272727', // Fondo del tooltip
                                    color: '#9B9EAB', // Color del texto del tooltip
                                },
                            },
                            grid: {
                                line: {
                                    stroke: '#41434C' /* '#5C5E6B' */, // Cambia el color de las líneas de la cuadrícula
                                },
                            },
                        }}
                        enableGridX={false}
                        /*  gridYValues={[15, 20, 25, 30]} */


                        lineWidth={7}
                        colors={['#C5F5CA', '#FF864B']}
                        enablePointLabel={false}
                        margin={{
                            bottom: 50,
                            left: 50,
                            right: 50,
                            top: 50
                        }}
                        pointBorderColor={{
                            from: 'color',
                            modifiers: [
                                [
                                    'darker',
                                    0.3
                                ]
                            ]
                        }}
                        pointBorderWidth={1}
                        pointSize={16}
                        pointSymbol={function noRefCheck() { }}
                        useMesh

                        xFormat="time:%Y-%m-%d"
                        xScale={{
                            format: '%Y-%m-%d',
                            precision: 'day',
                            type: 'time',
                            useUTC: false
                        }}

                        yFormat={(value: DatumValue) => typeof value === 'number' ? `${value / 1000000}M` : ''}
                        yScale={{
                            type: 'linear',
                            min: 'auto',
                            max: 'auto',
                            stacked: false,
                            reverse: false,

                        }}
                        legends={[
                            {

                                anchor: 'bottom-left',
                                direction: 'row',
                                justify: false,
                                translateX: 10,
                                translateY: 55,
                                itemsSpacing: 32,
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


                    />
                

            )}
        </div>
    );
};

export default LineChartComponentB;
