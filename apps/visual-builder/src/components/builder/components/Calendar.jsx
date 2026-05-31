import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Calendar = ({ 
    events = [],
    onDateSelect,
    className 
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        
        return days;
    };

    const getEventsForDate = (date) => {
        if (!date) return [];
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const changeMonth = (delta) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const handleDateClick = (date) => {
        if (!date) return;
        setSelectedDate(date);
        onDateSelect?.(date);
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = getDaysInMonth(currentDate);

    return (
        <div className={cn('bg-surface border border-border rounded-lg p-4', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-surface-light">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-text-primary">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-1 rounded hover:bg-surface-light">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-sm text-text-secondary py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((date, idx) => {
                    const dayEvents = getEventsForDate(date);
                    const isSelected = selectedDate && date && date.toDateString() === selectedDate.toDateString();
                    const isToday = date && date.toDateString() === new Date().toDateString();
                    
                    return (
                        <button
                            key={idx}
                            onClick={() => handleDateClick(date)}
                            disabled={!date}
                            className={cn(
                                'relative h-10 rounded-lg transition-colors',
                                !date && 'invisible',
                                isSelected && 'bg-primary-500 text-white',
                                isToday && !isSelected && 'ring-2 ring-primary-500',
                                date && !isSelected && 'hover:bg-surface-light'
                            )}
                        >
                            <span className="text-sm">{date?.getDate()}</span>
                            {dayEvents.length > 0 && (
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Events Panel */}
            {selectedDate && (
                <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-text-primary mb-2">
                        Events on {selectedDate.toLocaleDateString()}
                    </h4>
                    {getEventsForDate(selectedDate).length === 0 ? (
                        <p className="text-sm text-text-secondary">No events</p>
                    ) : (
                        <div className="space-y-2">
                            {getEventsForDate(selectedDate).map((event, idx) => (
                                <div key={idx} className="p-2 bg-surface-light rounded-lg">
                                    <p className="text-sm text-text-primary">{event.title}</p>
                                    {event.time && (
                                        <p className="text-xs text-text-secondary">{event.time}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

Calendar.displayName = 'Calendar';
export default Calendar;