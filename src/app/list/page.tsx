import { fetchMergedBookings } from '@/lib/bookingParser';
import { calculatePayout } from '@/config/pricing';
import { format, differenceInCalendarDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function ListPage() {
  const allBookings = await fetchMergedBookings();

  // Sort active first, canceled later, then by start date
  const sortedBookings = [...allBookings].sort((a, b) => {
    if (a.status === 'Отменена' && b.status !== 'Отменена') return 1;
    if (a.status !== 'Отменена' && b.status === 'Отменена') return -1;
    return a.start.getTime() - b.start.getTime();
  });

  let totalNetIncome = 0;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: '#fff' }}>
        Список бронирований и Доходы
      </h1>
      
      <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500 }}>Домик / Гость</th>
                <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500 }}>Заезд — Выезд</th>
                <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500 }}>Ночей</th>
                <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500 }}>Платформа</th>
                <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500 }}>Статус</th>
                <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>Выплата (Нетто)</th>
              </tr>
            </thead>
            <tbody>
              {sortedBookings.map(booking => {
                const isCanceled = booking.status === 'Отменена';
                const isBlock = booking.status === 'Блок';
                const nights = Math.max(1, differenceInCalendarDays(booking.end, booking.start));
                const { gross, net, commissionRate } = calculatePayout(booking.houseId, booking.platform, nights);
                
                if (!isCanceled && !isBlock) {
                  totalNetIncome += net;
                }
                
                return (
                  <tr key={booking.id} style={{ 
                    borderBottom: '1px solid var(--glass-border)',
                    opacity: isCanceled || isBlock ? 0.4 : 1,
                    background: isCanceled || isBlock ? 'rgba(0,0,0,0.2)' : 'transparent'
                  }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: booking.color }}></div>
                        {booking.houseName}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {booking.summary} {booking.guestsCount ? `(${booking.guestsCount})` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      <span style={{ color: '#fff' }}>{format(booking.start, 'dd.MM')}</span>
                      <span style={{ color: 'var(--text-secondary)', margin: '0 0.5rem' }}>—</span>
                      <span style={{ color: '#fff' }}>{format(booking.end, 'dd.MM.yyyy')}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: 600 }}>
                      {nights}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        backgroundColor: `${booking.color}20`, 
                        color: booking.color 
                      }}>
                        {booking.platform}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', paddingLeft: '0.25rem' }}>
                        Ком: {Math.round(commissionRate * 100)}%
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        backgroundColor: isCanceled ? 'rgba(239, 68, 68, 0.1)' : isBlock ? 'rgba(100, 116, 139, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                        color: isCanceled ? 'var(--danger)' : isBlock ? '#94a3b8' : 'var(--success)' 
                      }}>
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ color: isCanceled || isBlock ? 'var(--text-secondary)' : '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>
                        {isBlock ? '—' : `NOK ${net.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textDecoration: isCanceled ? 'line-through' : 'none' }}>
                        {isBlock ? '' : `Брутто: NOK ${gross.toLocaleString('ru-RU')}`}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {allBookings.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Нет бронирований
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '4px solid #10b981' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>Ожидаемый общий доход (Чистыми)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Сумма по всем активным бронированиям с учетом комиссий платформ</p>
        </div>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>
          NOK {totalNetIncome.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
