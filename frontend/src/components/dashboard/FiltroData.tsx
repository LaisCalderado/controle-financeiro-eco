import React, { useState } from 'react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Filter, Calendar } from 'lucide-react';

interface FiltroDataProps {
  onFilterChange: (filtro: any) => void;
  currentFilter: any;
}

export default function FiltroData({ onFilterChange, currentFilter }: FiltroDataProps) {
  const [tipoFiltro, setTipoFiltro] = useState(currentFilter?.tipo || 'mes');
  const [dataInicio, setDataInicio] = useState(currentFilter?.dataInicio || startOfMonth(new Date()));
  const [dataFim, setDataFim] = useState(currentFilter?.dataFim || endOfMonth(new Date()));

  const aplicarFiltro = (tipo: string, inicio: Date, fim: Date) => {
    setTipoFiltro(tipo);
    setDataInicio(inicio);
    setDataFim(fim);
    onFilterChange({ tipo, dataInicio: inicio, dataFim: fim });
  };

  const handleTipoChange = (tipo: string) => {
    if (tipo === 'personalizado') {
      setTipoFiltro(tipo);
      return;
    }

    const hoje = new Date();
    let inicio, fim;

    switch (tipo) {
      case 'dia':
        inicio = startOfDay(hoje);
        fim = endOfDay(hoje);
        break;
      case 'mes':
        inicio = startOfMonth(hoje);
        fim = endOfMonth(hoje);
        break;
      case 'mes-passado':
        inicio = startOfMonth(subMonths(hoje, 1));
        fim = endOfMonth(subMonths(hoje, 1));
        break;
      case 'ano':
        inicio = startOfYear(hoje);
        fim = endOfYear(hoje);
        break;
      default:
        inicio = startOfMonth(hoje);
        fim = endOfMonth(hoje);
    }

    aplicarFiltro(tipo, inicio, fim);
  };

  const handleDataInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novaDataInicio = new Date(e.target.value + 'T00:00:00');
    setDataInicio(novaDataInicio);
    onFilterChange({ tipo: tipoFiltro, dataInicio: novaDataInicio, dataFim });
  };

  const handleDataFimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novaDataFim = new Date(e.target.value + 'T23:59:59');
    setDataFim(novaDataFim);
    onFilterChange({ tipo: tipoFiltro, dataInicio, dataFim: novaDataFim });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
      <Filter className="w-4 h-4 text-slate-500" />
      
      <select
        value={tipoFiltro}
        onChange={(e) => handleTipoChange(e.target.value)}
        className="h-9 px-3 py-2 text-sm rounded-md border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
      >
        <option value="dia">Hoje</option>
        <option value="mes">Este mês</option>
        <option value="mes-passado">Mês passado</option>
        <option value="ano">Este ano</option>
        <option value="personalizado">Personalizado</option>
      </select>

      {tipoFiltro === 'personalizado' && (
        <>
          <div className="relative">
            <Calendar 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 cursor-pointer z-10" 
              onClick={() => (document.getElementById('data-inicio') as HTMLInputElement)?.showPicker()}
            />
            <input
              id="data-inicio"
              type="date"
              value={format(dataInicio, "yyyy-MM-dd")}
              onChange={handleDataInicioChange}
              className="h-9 pl-10 pr-3 py-2 text-sm rounded-md border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>

          <span className="text-slate-400 text-sm">até</span>

          <div className="relative">
            <Calendar 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 cursor-pointer z-10" 
              onClick={() => (document.getElementById('data-fim') as HTMLInputElement)?.showPicker()}
            />
            <input
              id="data-fim"
              type="date"
              value={format(dataFim, "yyyy-MM-dd")}
              onChange={handleDataFimChange}
              className="h-9 pl-10 pr-3 py-2 text-sm rounded-md border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>
        </>
      )}

      <span className="text-sm text-slate-500 ml-auto hidden md:block">
        {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} - {format(dataFim, "dd/MM/yyyy", { locale: ptBR })}
      </span>
    </div>
  );
}