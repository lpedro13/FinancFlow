import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { formatCurrency, formatDate, parseDate } from '@/utils/formatters';

const InvestmentChart = ({ data, type = 'line' }) => {
  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const LineComponent = type === 'area' ? Area : Line;

  const chartData = data.map(item => ({
    ...item,
    date: parseDate(item.date).getTime(), 
  }));


  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartComponent data={chartData}>
        <defs>
          <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorCurrentValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
          </linearGradient>
           <linearGradient id="colorDividends" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          stroke="#9ca3af"
          tickFormatter={(timestamp) => formatDate(new Date(timestamp))}
          minTickGap={20}
          type="number"
          domain={['dataMin', 'dataMax']}
          scale="time"
        />
        <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value, true)} />
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          labelFormatter={(label) => formatDate(new Date(label))}
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <LineComponent
          type="monotone"
          dataKey="totalInvested"
          stroke="#3b82f6"
          fillOpacity={type === 'area' ? 1 : undefined}
          fill={type === 'area' ? "url(#colorInvested)" : undefined}
          strokeWidth={2}
          name="Total Investido"
          dot={false}
        />
        <LineComponent
          type="monotone"
          dataKey="currentValue"
          stroke="#10b981"
          fillOpacity={type === 'area' ? 1 : undefined}
          fill={type === 'area' ? "url(#colorCurrentValue)" : undefined}
          strokeWidth={2}
          name="Valor Atual"
          dot={false}
        />
        <LineComponent
          type="monotone"
          dataKey="dividends"
          stroke="#f59e0b"
          fillOpacity={type === 'area' ? 1 : undefined}
          fill={type === 'area' ? "url(#colorDividends)" : undefined}
          strokeWidth={2}
          name="Dividendos Acumulados"
          dot={false}
        />
      </ChartComponent>
    </ResponsiveContainer>
  );
};

export default InvestmentChart;