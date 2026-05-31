import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

export const Table = ({ columns = [], data = [], sortable = true, searchable = true, pagination = true, pageSize = 10, className, ...props }) => {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSort = (key) => {
        if (!sortable) return;
        setSortColumn(key);
        setSortDirection(prev => sortColumn === key ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
        setCurrentPage(1);
    };

    const filtered = searchTerm ? data.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()))) : data;
    const sorted = [...filtered].sort((a, b) => {
        if (!sortColumn) return 0;
        const aV = a[sortColumn], bV = b[sortColumn];
        if (aV < bV) return sortDirection === 'asc' ? -1 : 1;
        if (aV > bV) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    const totalPages = Math.ceil(sorted.length / pageSize);
    const paged = pagination ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted;

    return (
        <div className={cn('w-full', className)} {...props}>
            {searchable && (
                <div className="mb-4 relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="pl-10 pr-4 py-2 w-full border border-border rounded-lg bg-surface text-text-primary" />
                </div>
            )}
            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full">
                    <thead className="bg-surface-light">
                        <tr>{columns.map(col => (
                            <th key={col.key} onClick={() => handleSort(col.key)}
                                className={cn('px-4 py-3 text-left text-sm font-semibold text-text-primary', sortable && 'cursor-pointer hover:bg-surface-light select-none')}>
                                <div className="flex items-center gap-1">{col.label}{sortable && sortColumn === col.key && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                            </th>
                        ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paged.map((row, i) => (
                            <tr key={i} className="hover:bg-surface-light/50">{columns.map(col => (
                                <td key={col.key} className="px-4 py-3 text-sm text-text-secondary">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
                            ))}</tr>
                        ))}
                        {paged.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-text-secondary">No data found</td></tr>}
                    </tbody>
                </table>
            </div>
            {pagination && totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-text-secondary">Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}</div>
                    <div className="flex gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded border border-border disabled:opacity-50 hover:bg-surface-light"><ChevronLeft size={16} /></button>
                        <span className="px-3 py-1 text-sm flex items-center">{currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded border border-border disabled:opacity-50 hover:bg-surface-light"><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const Chart = ({ type = 'bar', data, options = {}, width = '100%', height = 400, className, ...props }) => {
    const canvasRef = React.useRef(null);
    const chartRef = React.useRef(null);
    React.useEffect(() => {
        if (!canvasRef.current) return;
        let destroyed = false;
        import('chart.js/auto').then(ChartJS => {
            if (destroyed) return;
            if (chartRef.current) chartRef.current.destroy();
            chartRef.current = new ChartJS.default(canvasRef.current, { type, data, options });
        }).catch(() => {});
        return () => { destroyed = true; if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
    }, [type, data, options]);
    return <div className={cn('relative', className)} style={{ width, height }} {...props}><canvas ref={canvasRef} /></div>;
};

export const Calendar = ({ value, onChange, minDate, maxDate, className, ...props }) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = []; for (let i = 0; i < firstDay; i++) days.push(null); for (let i = 1; i <= daysInMonth; i++) days.push(i);
    const handleSelect = (day) => { const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day); setSelectedDate(d); onChange?.(d.toISOString().split('T')[0]); };
    return (
        <div className={cn('bg-surface rounded-lg shadow-lg p-4 w-72', className)} {...props}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-surface-light rounded text-text-secondary">←</button>
                <h3 className="font-semibold text-text-primary">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-surface-light rounded text-text-secondary">→</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">{dayNames.map(d => <div key={d} className="text-center text-xs font-medium text-text-secondary py-1">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">{days.map((day, i) => (
                <div key={i} className="aspect-square">
                    {day !== null && <button onClick={() => handleSelect(day)}
                        className={cn('w-full h-full rounded-full text-sm transition-colors flex items-center justify-center',
                            selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth() && selectedDate?.getFullYear() === currentDate.getFullYear()
                                ? 'bg-primary-600 text-white' : 'text-text-primary hover:bg-surface-light')}>{day}</button>}
                </div>
            ))}</div>
        </div>
    );
};

export const Accordion = ({ items = [], multiple = false, className, ...props }) => {
    const [openItems, setOpenItems] = useState([]);
    const toggle = (i) => setOpenItems(prev => multiple ? (prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]) : (prev.includes(i) ? [] : [i]));
    return (
        <div className={cn('divide-y divide-border border border-border rounded-lg overflow-hidden', className)} {...props}>
            {items.map((item, i) => (
                <div key={i}>
                    <button onClick={() => toggle(i)} className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-text-primary hover:bg-surface-light transition-colors">
                        {item.title}<span className={cn('ml-2 transition-transform', openItems.includes(i) && 'rotate-45')}>+</span>
                    </button>
                    {openItems.includes(i) && <div className="px-4 pb-3 text-text-secondary">{item.content}</div>}
                </div>
            ))}
        </div>
    );
};

export const Tabs = ({ tabs = [], activeTab, onChange, variant = 'underline', className, ...props }) => {
    const [active, setActive] = useState(activeTab || tabs[0]?.id);
    const handleChange = (id) => { setActive(id); onChange?.(id); };
    const variants = {
        underline: 'border-b border-border',
        pills: 'flex gap-2 flex-wrap',
        buttons: 'flex gap-2 flex-wrap',
    };
    const tabClass = (isActive) => {
        if (variant === 'underline') return cn('px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px', isActive ? 'border-primary-600 text-primary-600' : 'border-transparent text-text-secondary hover:text-gray-700 dark:text-text-secondary dark:hover:text-gray-300');
        if (variant === 'pills') return cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors', isActive ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-surface-light');
        return cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors', isActive ? 'bg-primary-600 text-white' : 'bg-surface-light text-text-primary hover:bg-surface-light');
    };
    return (
        <div className={cn('w-full', className)} {...props}>
            <div className={cn('flex', variants[variant])}>{tabs.map(tab => (
                <button key={tab.id} onClick={() => handleChange(tab.id)} className={tabClass(active === tab.id)}>{tab.icon && <span className="mr-2">{tab.icon}</span>}{tab.label}</button>
            ))}</div>
            <div className="mt-4">{tabs.find(t => t.id === active)?.content}</div>
        </div>
    );
};

export const Carousel = ({ items = [], autoPlay = true, interval = 5000, showArrows = true, showDots = true, className, ...props }) => {
    const [current, setCurrent] = useState(0);
    const [playing, setPlaying] = useState(autoPlay);
    React.useEffect(() => { if (!playing || items.length < 2) return; const t = setInterval(() => setCurrent(p => (p + 1) % items.length), interval); return () => clearInterval(t); }, [playing, items.length, interval]);
    const prev = () => setCurrent(p => (p - 1 + items.length) % items.length);
    const next = () => setCurrent(p => (p + 1) % items.length);
    return (
        <div className={cn('relative overflow-hidden group', className)} {...props}>
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>{items.map((item, i) => <div key={i} className="w-full flex-shrink-0">{item}</div>)}</div>
            {showArrows && items.length > 1 && (<><button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">←</button><button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">→</button></>)}
            {showDots && items.length > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">{items.map((_, i) => <button key={i} onClick={() => setCurrent(i)} className={cn('w-2 h-2 rounded-full transition-all', current === i ? 'bg-white w-4' : 'bg-white/50')} />)}</div>}
        </div>
    );
};

export const Timeline = ({ events = [], orientation = 'vertical', className, ...props }) => {
    const orientationClasses = { vertical: 'flex flex-col space-y-4', horizontal: 'flex overflow-x-auto space-x-4 pb-4' };
    return (
        <div className={cn(orientationClasses[orientation], className)} {...props}>
            {events.map((ev, i) => (
                <div key={i} className={cn('relative', orientation === 'vertical' ? 'pl-8' : 'min-w-64')}>
                    {orientation === 'vertical' && <div className="absolute left-3 top-1 bottom-0 w-px bg-surface-light"><div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary-600 rounded-full" /></div>}
                    {orientation === 'horizontal' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-surface-light"><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary-600 rounded-full" /></div>}
                    <div className={cn('bg-surface rounded-lg p-4 shadow-sm border border-border', orientation === 'horizontal' && 'min-w-64')}>
                        {ev.date && <div className="text-xs text-text-secondary mb-1">{ev.date}</div>}
                        <h4 className="font-semibold text-text-primary mb-1">{ev.title}</h4>
                        <p className="text-sm text-text-secondary">{ev.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
