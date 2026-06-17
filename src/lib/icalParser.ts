import ical from 'node-ical';
import { houses, HouseConfig } from '@/config/houses';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export interface BookingEvent {
  id: string;
  houseId: string;
  houseName: string;
  platform: string;
  summary: string;
  start: Date;
  end: Date;
  color: string;
}

export async function fetchAllBookings(): Promise<BookingEvent[]> {
  const allEvents: BookingEvent[] = [];

  // Fetch all in parallel for speed
  await Promise.all(houses.map(async (house) => {
    for (const feed of house.icalUrls) {
      try {
        const events = await (ical.async as any).fromURL(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/calendar, text/plain, */*'
          }
        });
        
        for (const key in events) {
          const event = events[key];
          if (event && event.type === 'VEVENT') {
            const start = new Date(event.start as Date);
            const end = new Date(event.end as Date);
            
            let summaryStr = 'Забронировано';
            if (typeof event.summary === 'string') {
              summaryStr = event.summary;
            } else if (event.summary && typeof event.summary === 'object' && 'val' in event.summary) {
              summaryStr = (event.summary as any).val || 'Забронировано';
            }
            // Очищаем имя от лишних префиксов Booking.com
            summaryStr = summaryStr.replace('CLOSED - ', '').replace('RESERVED - ', '').replace('Not available', 'Занято').trim();
            
            allEvents.push({
              id: `${house.id}-${key}`,
              houseId: house.id,
              houseName: house.shortName,
              platform: feed.platform,
              summary: summaryStr,
              start,
              end,
              color: house.color,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching iCal for ${house.name} from ${feed.platform}:`, error);
      }
    }
  }));

  // Sort by start date
  return allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
}
