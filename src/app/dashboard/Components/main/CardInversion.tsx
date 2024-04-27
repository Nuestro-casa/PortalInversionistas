"use client";
// react imports
import { useEffect, useState } from "react";

// custom imports
import getApiUrl from "../../../url/ApiConfig";
import { useAuth } from "../../../context/authContext";
import { CardCompBox } from "../CardComps";

const endpoint = "/principal/inversion_original";

type Inversion = {
  monto_inversion: number;
};
function CardInversion() {
  const { userEmail } = useAuth();
  const [data, setData] = useState<Inversion | null>(null);

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

  const monto_inversion = data
    ? "$ " +
      data.monto_inversion.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : "";

  return CardCompBox("Inversión original", monto_inversion);
}

export default CardInversion;
