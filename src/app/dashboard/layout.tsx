'use client'
import { ReactNode } from "react";
import PrivateRoute from "../login/privateRoute";
import Navbar from './Components/navbarFixed';
import { useAuth } from "../context/authContext";
import { Box, Container, Grid, Button, ButtonGroup, Typography } from "@mui/material";

function Layout({ children }: { children: ReactNode; }) {

  const { logout } = useAuth();

  return (
    <PrivateRoute>
      <Box sx={{ display: 'flex',  }}>
        <Box id='contenidoInmueble'
          component="main"
          sx={{
            flexGrow: 1,
            overflow: 'auto',        
            height: '100vh',
          }}
        >
          {/*Nabvar fixed Mui*/}
         <Navbar /> 

          {/*----------------------------visualización dashboard-------------------------------------------- */}
          <Box sx={{ flexGrow: 1, backgroundColor: '#272727', mt: 4, borderTopLeftRadius:'39px' , borderTopRightRadius: '39px'}}> 
            {children}
            <button onClick={logout}>Cerrar sesión</button>
          </Box>

          {/*------------------------------------------------------------------------ */}


        </Box>
      </Box>
    </PrivateRoute>
  )
}

export default Layout
