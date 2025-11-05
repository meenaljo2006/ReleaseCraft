import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; 

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet /> {/* Outlet woh jagah hai jahan aapke baaki pages (jaise HomePage) render honge */}
    </>
  );
};

export default MainLayout;