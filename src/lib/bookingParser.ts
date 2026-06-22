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
  let filePath = path.join(process.cwd(), 'Бронирования_2026.md');
  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), 'public', 'Бронирования_2026.md'); // fallback just in case
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
  const markdownEvents: BookingEvent[] = parseMarkdownBookings();
  const icalEvents: BookingEvent[] = [];
  const fetchedHouseFeeds = new Set<string>();

  await Promise.all(houses.map(async (house) => {
    for (const feed of house.icalUrls) {
      try {
        const response = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'text/calendar, text/plain, */*'
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch iCal: ${response.status} ${response.statusText}`);
        }
        
        fetchedHouseFeeds.add(`${house.id}-${feed.platform.toLowerCase()}`);
        
        const text = await response.text();
        const events = ical.parseICS(text);
        
        for (const key in events) {
          const event = events[key];
          if (event && event.type === 'VEVENT') {
            const rawStart = new Date(event.start as Date);
            const rawEnd = new Date(event.end as Date);
            
            const start = new Date(rawStart.getTime() + 2 * 60 * 60 * 1000);
            start.setHours(12, 0, 0, 0);
            
            const end = new Date(rawEnd.getTime() + 2 * 60 * 60 * 1000);
            end.setHours(12, 0, 0, 0);
            
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
              icalEvents.push({
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
      } catch (error) {
        console.error(`Error fetching iCal for ${house.name} from ${feed.platform}:`, error);
        fs.appendFileSync('ical_errors.log', `${new Date().toISOString()} - Error fetching iCal for ${house.name} from ${feed.platform}: ${error}\n`);
      }
    }
  }));

  const allEvents: BookingEvent[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Process Markdown events
  for (const mdEvent of markdownEvents) {
    if (mdEvent.status.toLowerCase().includes('отменен') || mdEvent.status.toLowerCase().includes('отменена')) continue;
    if (mdEvent.start.getFullYear() > 2026) continue;

    const isPlatform = ['booking', 'airbnb', 'campanyon'].some(p => mdEvent.platform.toLowerCase().includes(p));
    
    if (isPlatform && mdEvent.start >= today) {
      const feedKey = `${mdEvent.houseId}-${mdEvent.platform.toLowerCase()}`;
      if (fetchedHouseFeeds.has(feedKey)) {
        const hasMatchingIcal = icalEvents.some(icalEv => 
          icalEv.houseId === mdEvent.houseId &&
          isSameDay(icalEv.start, mdEvent.start) &&
          isSameDay(icalEv.end, mdEvent.end)
        );
        
        if (!hasMatchingIcal) {
          continue; // Drop canceled markdown event
        }
      }
    }
    
    allEvents.push(mdEvent);
  }

  // 2. Process iCal events
  for (const icalEv of icalEvents) {
    if (icalEv.start.getFullYear() > 2026) continue;
    
    const alreadyAdded = allEvents.some(mdEv => 
      mdEv.houseId === icalEv.houseId &&
      isSameDay(mdEv.start, icalEv.start) &&
      isSameDay(mdEv.end, icalEv.end)
    );
    
    if (!alreadyAdded) {
      allEvents.push(icalEv);
    }
  }

  return allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
}
