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
  startOfToday,
  getDay,
} from 'date-fns';

// availableDays: array of day-of-week numbers (0=Sun … 6=Sat) or null (all days allowed)
const CalendarView = ({ onDateSelect, availableDays }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const today = startOfToday();

  const isDateAvailable = (date) => {
    if (isBefore(date, today)) return false;
    if (!isSameMonth(date, currentMonth)) return false;
    // If availability data loaded, respect it; otherwise allow all weekdays
    if (availableDays !== null && availableDays !== undefined) {
      return availableDays.includes(getDay(date));
    }
    return true; // fallback: allow all (backend not yet loaded)
  };

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

        const available = isDateAvailable(day);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isOutside = !isSameMonth(day, monthStart);

        let cellClass = 'cell disabled';
        if (!isOutside && available) {
          cellClass = isSelected ? 'cell selected' : 'cell available';
        } else if (isOutside) {
          cellClass = 'cell outside';
        }

        days.push(
          <div
            key={day.toString()}
            className={cellClass}
            onClick={() => {
              if (!isOutside && available) {
                setSelectedDate(cloneDay);
                onDateSelect(cloneDay);
              }
            }}
          >
            <span className="number">{formattedDate}</span>
            {(!isOutside && available && !isSelected) && <div className="dot" />}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="row" key={day.toString()}>{days}</div>);
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