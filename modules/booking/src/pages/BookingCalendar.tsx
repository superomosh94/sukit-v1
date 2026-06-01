import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { bookingApi, BookingData } from '../services/api';
import { cn } from '../utils/cn';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function BookingCalendar() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const loadBookings = async () => {
    setLoading(true);
    const data = await bookingApi.listBookings();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getBookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter((b) => b.startTime?.startsWith(dateStr));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-gray-500 text-sm">View and manage appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium">
            {currentDate.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {DAYS.map((d) => (
            <div
              key={d}
              className="p-2 text-center text-sm font-medium text-gray-500"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[100px] p-2 border-b border-r"
            />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayBookings = getBookingsForDay(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;
            return (
              <div
                key={day}
                className={cn(
                  'min-h-[100px] p-2 border-b border-r',
                  isToday && 'bg-blue-50 dark:bg-blue-900/20'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-medium',
                    isToday ? 'text-blue-600' : ''
                  )}
                >
                  {day}
                </span>
                <div className="mt-1 space-y-1">
                  {dayBookings.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className={cn(
                        'text-xs p-1 rounded flex items-center gap-1',
                        b.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      )}
                    >
                      {b.status === 'CONFIRMED' ? (
                        <CheckCircle className="w-2 h-2" />
                      ) : (
                        <XCircle className="w-2 h-2" />
                      )}
                      {b.startTime?.slice(11, 16)}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
