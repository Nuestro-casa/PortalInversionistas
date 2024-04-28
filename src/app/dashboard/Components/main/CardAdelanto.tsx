"use client";
// react imports
import { useEffect, useState } from "react";

// custom imports
import getApiUrl from "../../../url/ApiConfig";
import { useAuth } from "../../../context/authContext";
import { formatFecha } from "../utils";
import { CardCompDateBox } from "../CardComps";

const endpoint = "/principal/adelanto";

type Adelanto = {
  adelanto: number;
  fecha: string;
};

function CardAdelanto() {
  const { userEmail } = useAuth();
  const [data, setData] = useState<Adelanto | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(getApiUrl(endpoint, { email: userEmail }));
        const responseData = await response.json();
        setData(responseData); // Actualiza los datos cuando la respuesta de la API llega
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [userEmail]);

  const formattedDate = data ? formatFecha(data.fecha) : "";
  const formattedAdelanto = data
    ? "$ " + data.adelanto.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : "";

  return CardCompDateBox("Adelanto", formattedDate, formattedAdelanto);
}

export default CardAdelanto;