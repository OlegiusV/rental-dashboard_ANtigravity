import { fetchMergedBookings } from '@/lib/bookingParser';
import { houses } from '@/config/houses';
import { format, isToday } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const allBookings = await fetchMergedBookings();
  const activeBookingsOnly = allBookings.filter(b => b.status !== 'Отменена');
  
  const today = new Date();
  today.setHours(12, 0, 0, 0); // Normalized to noon
  
  // Calculate stats
  const activeBookings = activeBookingsOnly.filter(b => b.start <= today && b.end >= today);
  const checkInsToday = activeBookingsOnly.filter(b => isToday(b.start));
  const checkOutsToday = activeBookingsOnly.filter(b => isToday(b.end));
  
  const totalHouses = houses.length;
  const occupancyRate = Math.round((activeBookings.length / totalHouses) * 100) || 0;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: '#fff' }}>
        Сегодняшняя сводка
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3rem', alignItems: 'start' }}>
        
        {/* Occupancy Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Заполняемость</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{occupancyRate}%</span>
            <span style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{activeBookings.length} из {totalHouses} домиков</span>
          </div>
        </div>

        {/* Check-ins Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Заезды сегодня</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)', lineHeight: 1 }}>{checkInsToday.length}</span>
              <span style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>домиков</span>
            </div>
          </div>
          
          {checkInsToday.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
              {checkInsToday.map(b => (
                <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{b.houseName}</span>
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 600, backgroundColor: `${b.color}20`, color: b.color }}>
                      {b.platform}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    {b.summary} {b.guestsCount ? `• ${b.guestsCount}` : ''}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {format(b.start, 'dd.MM.yyyy')} — {format(b.end, 'dd.MM.yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Check-outs Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Выезды сегодня</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning)', lineHeight: 1 }}>{checkOutsToday.length}</span>
              <span style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>домиков</span>
            </div>
          </div>
          
          {checkOutsToday.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
              {checkOutsToday.map(b => (
                <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{b.houseName}</span>
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 600, backgroundColor: `${b.color}20`, color: b.color }}>
                      {b.platform}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    {b.summary} {b.guestsCount ? `• ${b.guestsCount}` : ''}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {format(b.start, 'dd.MM.yyyy')} — {format(b.end, 'dd.MM.yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: '#fff' }}>
        Статус домиков
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {houses.map(house => {
          const currentBooking = activeBookings.find(b => b.houseId === house.id);
          
          return (
            <div key={house.id} className="glass-panel" style={{ padding: '1.5rem', borderTop: `4px solid ${house.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff' }}>{house.shortName}</h3>
                <span style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  backgroundColor: currentBooking ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: currentBooking ? 'var(--danger)' : 'var(--success)'
                }}>
                  {currentBooking ? 'Занят' : 'Свободен'}
                </span>
              </div>
              
              {currentBooking ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <p style={{ color: '#fff', marginBottom: '0.25rem' }}>Бронь ({currentBooking.platform})</p>
                  <p>До: {format(currentBooking.end, 'dd.MM.yyyy')}</p>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Готов к заселению</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
