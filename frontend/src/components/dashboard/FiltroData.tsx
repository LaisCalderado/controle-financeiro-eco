import React, { useState } from 'react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Filter } from 'lucide-react';

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

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
      <Filter className="w-4 h-4 text-slate-500" />
      
      <div className="flex gap-2">
        <button
          onClick={() => handleTipoChange('dia')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tipoFiltro === 'dia'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Hoje
        </button>
        <button
          onClick={() => handleTipoChange('mes')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tipoFiltro === 'mes'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Este mês
        </button>
        <button
          onClick={() => handleTipoChange('ano')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tipoFiltro === 'ano'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Este ano
        </button>
      </div>

      <span className="text-sm text-slate-500 ml-auto hidden md:block">
        {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} - {format(dataFim, "dd/MM/yyyy", { locale: ptBR })}
      </span>
    </div>
  );
}