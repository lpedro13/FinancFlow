import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange, triggerClassName = "w-[200px]" }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`${triggerClassName} justify-start text-left font-normal`}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, 'dd/MM/yy', { locale: ptBR }) : <span>Data inicial</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`${triggerClassName} justify-start text-left font-normal`}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, 'dd/MM/yy', { locale: ptBR }) : <span>Data final</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={onEndDateChange}
            initialFocus
            locale={ptBR}
            disabled={(date) => startDate && date < startDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;