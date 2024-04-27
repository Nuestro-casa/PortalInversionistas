"use client";
// react imports
import { useEffect, useState } from "react";

// material-ui imports
import Grid from "@mui/material/Unstable_Grid2";
import { FormControl } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

// custom imports
import getApiUrl from "../../../url/ApiConfig";
import { useAuth } from "@/app/context/authContext";
import { titleGrid, selectGrid } from "../ChartAddons";
import { calculateAxisValues } from "../utils";
import { LineChart } from "../LineChartComps";

const endpoint = "/principal/rentabilidad_portafolio";

const tickCount = 5;
const tickIni = 0.0005;

type Rentabilidad = {
  fecha: string;
  rentabilidad: number;
};

export type RentabilidadFront = {
  x: string;
  y: number;
};

type RentabilidadPortafolio = {
  ult_12_meses: [Rentabilidad];
  este_anho: [Rentabilidad];
  ult_6_meses: [Rentabilidad];
  [key: string]: any;
};

const LineChartCompRentabilidad = () => {
  const { userEmail } = useAuth();
  const [data, setData] = useState<RentabilidadPortafolio | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>("ult_12_meses");

  const [menuOpen, setMenuOpen] = useState(false);
  const [gridYValues, setGridYValues] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(getApiUrl(endpoint, { email: userEmail }));
        const responseData = await response.json();
        setData(responseData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [userEmail]);

  useEffect(() => {
    if (data) {
      const dataMora = data[selectedKey as keyof RentabilidadPortafolio];
      const maxValue = Math.max(
        ...dataMora.map((item: Rentabilidad) => item.rentabilidad)
      );
      const gridYValues = calculateAxisValues(maxValue, tickIni, tickCount);
      setGridYValues(gridYValues);
    }
  }, [selectedKey, data]);

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setSelectedKey(event.target.value);
  };

  let formattedData: RentabilidadFront[] = [];
  if (data) {
    formattedData = data[selectedKey].map((item: Rentabilidad) => ({
      x: item.fecha,
      y: item.rentabilidad,
    }));
  }

  /* Mensaje para el tooltip explicativo */

  const minY = (gridYValues[0] * 100).toFixed(2);
  const maxY = (gridYValues[gridYValues.length - 1] * 100).toFixed(2);

  const longText = `Nota: Los valores mostrados en esta gráfica se encuentran en un rango de ${minY}% a ${maxY}% para facilitar su legibilidad. Verifique la escala para una interpretación precisa.`;

  return (
    <div className="grafica-Linecharts">
      <div>
        <FormControl fullWidth>
          <Grid
            container
            spacing={2}
            alignItems="center"
            sx={{ borderBottom: "1px solid #9B9EAB" }}
          >
            {titleGrid("Rentabilidad mensual del portafolio", longText)}
            {selectGrid(selectedKey, handleSelectChange, menuOpen, setMenuOpen)}
          </Grid>
        </FormControl>
      </div>
      <br />
      {LineChart(formattedData, gridYValues, 2, true)}
    </div>
  );
};

export default LineChartCompRentabilidad;
