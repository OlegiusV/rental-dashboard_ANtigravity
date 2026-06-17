import ical from 'node-ical';
import fs from 'fs';
import path from 'path';
import { houses, HouseConfig } from '@/config/houses';
import { isSameDay } from 'date-fns';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export interface BookingEvent {
  id: string;
  houseId: string;
  houseName: string;
  platform: string;
  summary: string; // Used for guest name or general title
  start: Date;
  end: Date;
  color: string;
  guestsCount?: string;
  status: string;
  source: 'markdown' | 'ical';
}

function parseRussianDate(dateStr: string): Date {
  const parts = dateStr.trim().split(/\s+/);
  const day = parseInt(parts[0], 10);
  const monthStr = parts[1].toLowerCase();
  const year = 2026;
  
  const months: Record<string, number> = {
    'января': 0, 'январь': 0,
    'февраля': 1, 'февраль': 1,
    'марта': 2, 'март': 2,
    'апреля': 3, 'апрель': 3,
    'мая': 4, 'май': 4,
    'июня': 5, 'июнь': 5,
    'июля': 6, 'июль': 6,
    'августа': 7, 'август': 7,
    'сентября': 8, 'сентябрь': 8,
    'октября': 9, 'октябрь': 9,
    'ноября': 10, 'ноябрь': 10,
    'декабря': 11, 'декабрь': 11
  };
  
  const month = months[monthStr] !== undefined ? months[monthStr] : 5;
  // Use noon to avoid timezone shift issues
  return new Date(year, month, day, 12, 0, 0);
}

function getPlatformColor(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes('airbnb')) return '#f43f5e'; // Rose
  if (p.includes('booking')) return '#2563eb'; // Blue
  if (p.includes('campanyon')) return '#10b981'; // Emerald
  if (p.includes('vrbo')) return '#06b6d4'; // Cyan
  return '#64748b'; // Slate for others
}

function parseMarkdownBookings(): BookingEvent[] {
  // Try to find the markdown file
  let filePath = path.join(process.cwd(), '..', 'Бронирования_2026.md');
  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), 'Бронирования_2026.md'); // fallback
  }
  
  if (!fs.existsSync(filePath)) {
    console.warn('Бронирования_2026.md not found');
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const bookings: BookingEvent[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cols = trimmed.split('|').map(c => c.trim()).filter((c, i) => i > 0 && i < trimmed.split('|').length - 1);
      
      if (cols[0] === 'Заезд' || cols[0].startsWith(':---') || cols[0].includes('---')) {
        continue;
      }
      
      if (cols.length >= 8) {
        const startStr = cols[0];
        const endStr = cols[1];
        const houseName = cols[3];
        const platform = cols[4];
        const guestName = cols[5];
        const guestsCount = cols[6];
        const status = cols[7];
        
        try {
          const start = parseRussianDate(startStr);
          const end = parseRussianDate(endStr);
          
          // Match house by name
          let houseId = 'unknown';
          let matchedName = houseName;
          const matchedHouse = houses.find(h => 
            h.shortName.toLowerCase() === houseName.toLowerCase() || 
            h.name.toLowerCase() === houseName.toLowerCase() ||
            houseName.toLowerCase().includes(h.shortName.toLowerCase())
          );
          
          if (matchedHouse) {
            houseId = matchedHouse.id;
            matchedName = matchedHouse.shortName;
          }
          
          bookings.push({
            id: `md-${Date.now()}-${Math.random()}`,
            houseId,
            houseName: matchedName,
            platform,
            summary: guestName,
            start,
            end,
            color: getPlatformColor(platform),
            guestsCount,
            status,
            source: 'markdown'
          });
        } catch (e) {
          console.error(`Error parsing row: ${trimmed}`, e);
        }
      }
    }
  }
  return bookings;
}

export async function fetchMergedBookings(): Promise<BookingEvent[]> {
  const allEvents: BookingEvent[] = parseMarkdownBookings();

  await Promise.all(houses.map(async (house) => {
    for (const feed of house.icalUrls) {
      try {
        const events = await ical.async.fromURL(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/calendar, text/plain, */*'
          }
        });
        
        for (const key in events) {
          const event = events[key];
          if (event && event.type === 'VEVENT') {
            const rawStart = new Date(event.start as Date);
            const rawEnd = new Date(event.end as Date);
            
            // Adjust from UTC to local Oslo summer time (approx +2h) 
            // Setting it to noon locally to prevent timezone edge cases
            const start = new Date(rawStart.getTime() + 2 * 60 * 60 * 1000);
            start.setHours(12, 0, 0, 0);
            
            const end = new Date(rawEnd.getTime() + 2 * 60 * 60 * 1000);
            end.setHours(12, 0, 0, 0);
            
            // Check if this event already exists in our markdown bookings
            const overlaps = allEvents.some(b => 
               b.houseId === house.id && 
               isSameDay(b.start, start) && 
               isSameDay(b.end, end)
            );
            
            if (!overlaps) {
              let summaryStr = 'Забронировано';
              if (typeof event.summary === 'string') {
                summaryStr = event.summary;
              } else if (event.summary && typeof event.summary === 'object' && 'val' in event.summary) {
                summaryStr = (event.summary as any).val || 'Забронировано';
              }
              
              summaryStr = summaryStr.replace('CLOSED - ', '').replace('RESERVED - ', '').replace('Not available', 'Занято').trim();
              
              const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
              const isBlock = durationDays > 21 || summaryStr.toLowerCase().includes('not available') || summaryStr.toLowerCase().includes('block');
              
              if (!isBlock) {
                allEvents.push({
                  id: `${house.id}-${key}`,
                  houseId: house.id,
                  houseName: house.shortName,
                  platform: feed.platform,
                  summary: summaryStr,
                  start,
                  end,
                  color: getPlatformColor(feed.platform),
                  status: 'Активна',
                  source: 'ical'
                });
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching iCal for ${house.name} from ${feed.platform}:`, error);
      }
    }
  }));

  // Filter out canceled ones completely as requested
  const validEvents = allEvents.filter(e => e.status !== 'Отменена');
  return validEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
}
