import { fetchMergedBookings } from '@/lib/bookingParser';
import { houses } from '@/config/houses';
import { addDays, eachDayOfInterval } from 'date-fns';
import CalendarClient from './CalendarClient';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const allBookings = await fetchMergedBookings();
  const activeBookings = allBookings.filter(b => b.status !== 'Отменена');
  
  // Start from June 1st 2026 to show all summer bookings
  const startOfSeason = new Date(2026, 5, 1, 12, 0, 0); // June 1, 2026, noon
  const endOfSeason = addDays(startOfSeason, 130); // 130 days covers June -> early October
  
  const days = eachDayOfInterval({ start: startOfSeason, end: endOfSeason });
  const cellWidth = 130; // Fixed width for each day cell

  // Serialize dates to pass to Client Component
  const activeBookingsSerialized = activeBookings.map(b => ({
    ...b,
    start: b.start.toISOString(),
    end: b.end.toISOString()
  }));

  const daysSerialized = days.map(d => d.toISOString());

  return (
    <CalendarClient 
       activeBookings={activeBookingsSerialized}
       daysStr={daysSerialized}
       housesData={houses}
       cellWidth={cellWidth}
       startOfSeasonStr={startOfSeason.toISOString()}
    />
  );
}
