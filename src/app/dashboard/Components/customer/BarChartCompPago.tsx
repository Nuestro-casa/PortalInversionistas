"use client";
// react imports
import { useEffect, useState } from "react";

// material-ui imports
import Grid from "@mui/material/Unstable_Grid2";
import { FormControl } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

// nivo imports
import { ResponsiveBar } from "@nivo/bar";

// custom imports
import getApiUrl from "../../../url/ApiConfig";
import { getEmail } from "../../../context/authContext";
import { titleGrid, selectGrid } from "../ChartAddons";
import { formatFecha, formatNumber, generarTicks } from "../utils";

const endpoint = "/clientes/comportamiento_pago";
const tickCount: number = 5;

type CompPago = {
  fecha: string;
  pagado: any;
  mora: any;
};

type TramoCompPago = {
  ult_12_meses: CompPago[];
  este_anho: CompPago[];
  ult_6_meses: CompPago[];
};

type CompPagoFront = {
  fecha: string;
  "Pago a tiempo": number;
  "Pago con atraso": number;
};

function BarChartCompPago() {
  const email = getEmail();

  const [data, setData] = useState<TramoCompPago | null>(null);
  const [key, setKey] = useState<keyof TramoCompPago>("ult_12_meses");

  const [menuOpen, setMenuOpen] = useState(false);
  const [ticks, setTicks] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(getApiUrl(endpoint, { email: email }));

        const responseData = await response.json();
        setData(responseData); // Actualiza los datos cuando la respuesta de la API llega
      } catch (error) {
        console.error(error);
      }
    };

    if (email) {
      fetchData();
    }
  }, [email]);

  let formattedData: CompPagoFront[] = [];
  if (data) {
    formattedData = data[key].map((item: CompPago) => ({
      fecha: item.fecha,
      "Pago a tiempo": item.pagado,
      "Pago con atraso": Math.abs(item.mora), // Convertir valores a positivo
    }));
  }

  useEffect(() => {
    if (data) {
      const monthTotal: number[] = data[key].map((item) => {
        return item.pagado + Math.abs(item.mora);
      });
      const maxValue = Math.max(...monthTotal);

      setTicks(generarTicks(0, maxValue, tickCount));
    }
  }, [key, data]);

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setKey(event.target.value as keyof TramoCompPago);
  };

  return (
    <div className="grafica-barcharts-des nivo-text">
      <div>
        <FormControl fullWidth>
          <Grid
            container
            spacing={2}
            alignItems="center"
            sx={{ borderBottom: "1px solid #9B9EAB" }}
          >
            {titleGrid("Comportamiento de pago")}
            {selectGrid(key, handleSelectChange, menuOpen, setMenuOpen)}
          </Grid>
        </FormControl>
      </div>
      {data == null ? (
        <div></div>
      ) : (
        <ResponsiveBar
          data={formattedData}
          keys={["Pago a tiempo", "Pago con atraso"]}
          indexBy="fecha"
          label={() => ""}
          margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
          padding={0.8}
          maxValue={ticks[ticks.length - 1]}
          colors={["#12CA98", "#FFB024"]}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: "#9B9EAB", // Color del texto en los ejes
                },
              },
            },

            legends: {
              text: {
                fill: "#9B9EAB", // Color del texto de las leyendas
              },
            },
            tooltip: {
              container: {
                background: "black", // Fondo del tooltip
                color: "#9B9EAB", // Color del texto del tooltip
              },
            },
            grid: {
              line: {
                stroke: "#41434C" /* '#5C5E6B' */, // Cambia el color de las líneas de la cuadrícula
              },
            },
          }}
          valueFormat={(v) => v.toString()} // Convertir valores a positivos antes de formatear
          gridYValues={ticks}
          axisLeft={{
            tickSize: 2,
            tickPadding: 5,
            tickRotation: 0,
            tickValues: ticks,
            legend: "",

            legendPosition: "middle",
            legendOffset: -40,
            format: (value) => formatNumber(value),
          }}
          tooltip={(point) => setTooltip(point)}
          borderRadius={4}
          borderColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 0,
            tickRotation: 0,
            legend: "",
            legendPosition: "middle",
            legendOffset: 32,
            tickValues: formattedData.map(
              (item: { fecha: string }) => item.fecha
            ),
            format: (value) => formatFecha(value),
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          layout="vertical"
          groupMode="stacked"
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-left",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 54,
              itemsSpacing: 20,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "square",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          role="application"
        />
      )}
    </div>
  );
}

const setTooltip = (point: any) => {
  if (typeof point.data.fecha === "string") {
    const formattedDate = formatFecha(point.data.fecha);
    const formattedValue = formatNumber(Number(point.data[point.id]), 1);

    return (
      <div
        style={{
          background: "black",
          padding: "8px",
          borderRadius: "4px",
          color: "white",
        }}
      >
        <strong>{formattedDate}</strong>
        <div>
          {point.id}: {formattedValue}
        </div>
      </div>
    );
  }
  return null;
};

export default BarChartCompPago;
