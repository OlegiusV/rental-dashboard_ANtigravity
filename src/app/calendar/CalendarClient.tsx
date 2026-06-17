"use client";

import { useState, useRef, useEffect } from 'react';
import { format, isToday, differenceInCalendarDays, addDays } from 'date-fns';

interface HouseData {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

interface CalendarClientProps {
  activeBookings: any[];
  daysStr: string[];
  housesData: HouseData[];
  cellWidth: number;
  startOfSeasonStr: string;
}

export default function CalendarClient({ activeBookings, daysStr, housesData, cellWidth, startOfSeasonStr }: CalendarClientProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const days = daysStr.map(d => new Date(d));
  const startOfSeason = new Date(startOfSeasonStr);
  const bookings = activeBookings.map(b => ({
    ...b,
    start: new Date(b.start),
    end: new Date(b.end)
  }));

  useEffect(() => {
    // Scroll to today's date
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const todayIndex = days.findIndex(d => isToday(d));
        if (todayIndex !== -1) {
          const actualW = typeof window !== 'undefined' && window.innerWidth <= 800 ? 45 : 80;
          const houseW = typeof window !== 'undefined' && window.innerWidth <= 800 ? 90 : 200;
          const clientWidth = scrollRef.current.clientWidth;
          const scrollLeft = houseW + (todayIndex * actualW) - (clientWidth / 2) + (actualW / 2);
          scrollRef.current.scrollLeft = Math.max(0, scrollLeft);
        }
      }
    }, 400);
    
    return () => clearTimeout(timer);
  }, [daysStr]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const containerStyle = isFullScreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--bg-color)',
    zIndex: 9999,
    padding: '2rem',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const
  } : {};

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Календарь
          </h1>
          <button 
            onClick={toggleFullScreen}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              color: '#fff', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background 0.2s'
            }}>
            {isFullScreen ? 'Свернуть' : 'На весь экран'}
          </button>
        </div>
        {/* Simple legend for platforms */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', background: 'var(--glass-bg)', padding: '0.75rem 1.5rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#2563eb' }}></div>
            <span style={{ fontSize: '0.8rem', color: '#fff' }}>Booking</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f43f5e' }}></div>
            <span style={{ fontSize: '0.8rem', color: '#fff' }}>Airbnb</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }}></div>
            <span style={{ fontSize: '0.8rem', color: '#fff' }}>Campanyon</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#06b6d4' }}></div>
            <span style={{ fontSize: '0.8rem', color: '#fff' }}>Vrbo</span>
          </div>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="glass-panel" 
        style={{ 
          overflowX: 'auto',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '1.5rem', 
          paddingBottom: '2rem',
          flexGrow: 1,
          height: isFullScreen ? 'auto' : 'calc(100vh - 200px)'
        }}
      >
        <table style={{ borderCollapse: 'collapse', minWidth: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ padding: 'var(--cal-house-padding)', width: 'var(--cal-house-col-width)', minWidth: 'var(--cal-house-col-width)', textAlign: 'left', borderBottom: '1px solid var(--glass-border)', position: 'sticky', left: 0, top: 0, background: 'var(--bg-color-secondary)', zIndex: 40, whiteSpace: 'normal', lineHeight: 1.2 }}>Домик</th>
              {days.map(day => {
                const isTodayDate = isToday(day);
                return (
                  <th key={day.toISOString()} id={isTodayDate ? 'today-column' : undefined} style={{ 
                    padding: '0.5rem 0', 
                    width: 'var(--cal-cell-width)', 
                    minWidth: 'var(--cal-cell-width)', 
                    textAlign: 'center', 
                    borderBottom: '1px solid var(--glass-border)', 
                    fontSize: '0.875rem',
                    background: isTodayDate ? 'rgba(255,255,255,0.05)' : 'var(--bg-color-secondary)',
                    borderLeft: isTodayDate ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    borderRight: isTodayDate ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30
                  }}>
                    <div style={{ color: isTodayDate ? '#fff' : 'var(--text-secondary)' }}>{format(day, 'MMM')}</div>
                    <div style={{ color: isTodayDate ? '#fff' : '#fff', fontWeight: 600, fontSize: isTodayDate ? '1.1rem' : '1rem' }}>{format(day, 'd')}</div>
                    {isTodayDate && <div style={{ fontSize: '0.6rem', color: 'var(--success)', marginTop: '2px', fontWeight: 700 }}>СЕГОДНЯ</div>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {housesData.map(house => {
              const houseBookings = bookings.filter(b => b.houseId === house.id);
              
              return (
                <tr key={house.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: 'var(--cal-house-padding)', width: 'var(--cal-house-col-width)', minWidth: 'var(--cal-house-col-width)', height: 'var(--cal-row-height)', fontWeight: 600, fontSize: 'var(--cal-house-font)', color: '#fff', position: 'sticky', left: 0, background: 'var(--bg-color-secondary)', zIndex: 20, borderRight: `4px solid ${house.color}`, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.2 }}>
                    {house.shortName}
                  </td>
                  
                  {days.map((day, dayIndex) => {
                    const isTodayDate = isToday(day);
                    
                    return (
                      <td key={day.toISOString()} style={{ 
                        padding: '0', 
                        width: 'var(--cal-cell-width)', 
                        minWidth: 'var(--cal-cell-width)', 
                        borderRight: isTodayDate ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--glass-border)', 
                        borderLeft: isTodayDate ? '1px solid rgba(255,255,255,0.2)' : 'none',
                        background: isTodayDate ? 'rgba(255,255,255,0.03)' : 'transparent',
                        position: 'relative' 
                      }}>
                          {dayIndex === 0 && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
                              {houseBookings.map((b, idx) => {
                                 const offsetDays = differenceInCalendarDays(b.start, startOfSeason);
                                 const duration = Math.max(1, differenceInCalendarDays(b.end, b.start));

                                 const guestName = b.summary || 'Занято';
                                 const subText = `${b.platform}` + (b.guestsCount ? ` • ${b.guestsCount}` : '');
                                 const title = `${guestName} (${b.platform}) | ${format(b.start, 'dd.MM')} - ${format(b.end, 'dd.MM')}`;

                                 return (
                                   <div 
                                      key={b.id + idx}
                                      style={{
                                        position: 'absolute',
                                        top: 'var(--cal-booking-top)',
                                        left: `calc(${offsetDays} * var(--cal-cell-width) + (var(--cal-cell-width) / 2))`,
                                        width: `calc(${duration} * var(--cal-cell-width))`,
                                        height: 'var(--cal-booking-height)',
                                        background: b.color,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        opacity: b.status === 'Блок' ? 0.3 : 1
                                      }}
                                       title={title}
                                       onClick={() => setSelectedBooking(b)}
                                   >
                                      <div style={{ 
                                          position: 'sticky', 
                                          left: '0px', 
                                          padding: '0 12px',
                                          minWidth: '0' 
                                      }}>
                                          <div style={{ 
                                              color: '#fff', 
                                              fontSize: 'var(--cal-booking-font)', 
                                              fontWeight: 600, 
                                              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                                              lineHeight: 1.1
                                          }}>
                                              {guestName}
                                          </div>
                                          <div style={{
                                              color: 'rgba(255,255,255,0.95)',
                                              fontSize: 'var(--cal-booking-sub)',
                                              fontWeight: 500,
                                              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                                              lineHeight: 1.2,
                                              marginTop: '2px'
                                          }}>
                                              {subText}
                                          </div>
                                      </div>
                                   </div>
                                 );
                              })}
                            </div>
                          )}
                      </td>
                    )
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} onClick={() => setSelectedBooking(null)}>
          <div style={{
            background: 'var(--bg-color-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedBooking(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-secondary)', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >×</button>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, backgroundColor: `${selectedBooking.color}20`, color: selectedBooking.color }}>
                {selectedBooking.platform}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              {selectedBooking.summary || 'Занято'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Домик: <strong style={{ color: '#fff' }}>{selectedBooking.houseName}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Заезд:</span>
                <span style={{ color: '#fff', fontWeight: 500 }}>{format(new Date(selectedBooking.start), 'dd.MM.yyyy')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Выезд:</span>
                <span style={{ color: '#fff', fontWeight: 500 }}>{format(new Date(selectedBooking.end), 'dd.MM.yyyy')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ночей:</span>
                <span style={{ color: '#fff', fontWeight: 500 }}>{Math.max(1, differenceInCalendarDays(new Date(selectedBooking.end), new Date(selectedBooking.start)))}</span>
              </div>
              {selectedBooking.guestsCount && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Гостей:</span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{selectedBooking.guestsCount}</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedBooking(null)}
              style={{ width: '100%', padding: '0.75rem', marginTop: '1.5rem', borderRadius: '8px', background: 'var(--accent-color)', color: '#fff', fontWeight: 600 }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
