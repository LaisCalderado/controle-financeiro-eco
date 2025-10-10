import React from 'react';
import { NavLink } from 'react-router-dom';
import './MainMenu.scss';

const MainMenu: React.FC = () => {
  return (
    <nav className="main-menu">
      <NavLink to="/dashboard/1" className={({isActive}) => isActive ? 'active' : ''}>📈 Dashboard</NavLink>
      <NavLink to="/controle-diario" className={({isActive}) => isActive ? 'active' : ''}>📅 Controle Diário</NavLink>
      <NavLink to="/resumo-mensal" className={({isActive}) => isActive ? 'active' : ''}>📊 Resumo Mensal</NavLink>
      <NavLink to="/financeiro" className={({isActive}) => isActive ? 'active' : ''}>💰 Financeiro</NavLink>
    </nav>
  );
};

export default MainMenu;
