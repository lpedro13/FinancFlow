import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MonthSelector = ({ currentMonth, onMonthChange }) => {
  const handlePreviousMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const handleSelectMonth = (monthIndex) => {
    const newMonth = new Date(currentMonth.getFullYear(), parseInt(monthIndex));
    onMonthChange(newMonth);
  };

  const handleSelectYear = (year) => {
    const newMonth = new Date(parseInt(year), currentMonth.getMonth());
    onMonthChange(newMonth);
  };

  const years = Array.from({ length: 10 }, (_, i) => currentMonth.getFullYear() - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: format(new Date(2000, i), 'MMMM', { locale: ptBR })
  }));

  return (
    <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
      <Button variant="ghost" size="icon" onClick={handlePreviousMonth} className="h-8 w-8">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <Select value={currentMonth.getMonth().toString()} onValueChange={handleSelectMonth}>
        <SelectTrigger className="w-[130px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {months.map(month => (
            <SelectItem key={month.value} value={month.value} className="text-sm">
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentMonth.getFullYear().toString()} onValueChange={handleSelectYear}>
        <SelectTrigger className="w-[80px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map(year => (
            <SelectItem key={year} value={year.toString()} className="text-sm">
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MonthSelector;