import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isBefore,
  startOfToday
} from 'date-fns';

const CalendarView = ({ onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = startOfToday();

  const renderHeader = () => (
    <div className="calendar-header">
      <span className="current-month">{format(currentMonth, 'MMMM yyyy')}</span>
      <div className="nav-btns">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>&lt;</button>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>&gt;</button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return <div className="days-row">{days.map(d => <div key={d} className="day-label">{d}</div>)}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Logic: Disable if in past OR not in current month
        const isDisabled = !isSameMonth(day, monthStart) || isBefore(day, today);
        const isSelected = isSameDay(day, selectedDate);

        days.push(
          <div
            key={day}
            className={`cell ${isDisabled ? 'disabled' : isSelected ? 'selected' : 'available'}`}
            onClick={() => !isDisabled && (setSelectedDate(cloneDay), onDateSelect(cloneDay))}
          >
            <span className="number">{formattedDate}</span>
            {(!isDisabled && !isSelected) && <div className="dot" />}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="row" key={day}>{days}</div>);
      days = [];
    }
    return <div className="body">{rows}</div>;
  };

  return (
    <div className="calendar-container">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CalendarView;