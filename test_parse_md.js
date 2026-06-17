const fs = require('fs');
const path = require('path');

function parseRussianDate(dateStr) {
  const parts = dateStr.trim().split(/\s+/);
  const day = parseInt(parts[0], 10);
  const monthStr = parts[1].toLowerCase();
  const year = 2026;
  
  const months = {
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
  
  const month = months[monthStr];
  if (month === undefined) {
    console.error(`Could not parse month: ${monthStr}`);
    return new Date(year, 5, day); // fallback to June
  }
  return new Date(year, month, day);
}

function parseMarkdownBookings() {
  const filePath = path.join(__dirname, '..', 'Бронирования_2026.md');
  if (!fs.existsSync(filePath)) {
    console.error(`File not found at ${filePath}`);
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const bookings = [];
  
  let isTable = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cols = trimmed.split('|').map(c => c.trim()).filter((c, i) => i > 0 && i < trimmed.split('|').length - 1);
      
      // Skip header and separator
      if (cols[0] === 'Заезд' || cols[0].startsWith(':---') || cols[0].includes('---')) {
        continue;
      }
      
      if (cols.length >= 8) {
        const startStr = cols[0];
        const endStr = cols[1];
        const nights = parseInt(cols[2], 10);
        const houseName = cols[3];
        const platform = cols[4];
        const guestName = cols[5];
        const guestsCount = cols[6];
        const status = cols[7];
        
        try {
          const start = parseRussianDate(startStr);
          const end = parseRussianDate(endStr);
          bookings.push({
            start: start.toISOString(),
            end: end.toISOString(),
            nights,
            houseName,
            platform,
            guestName,
            guestsCount,
            status
          });
        } catch (e) {
          console.error(`Error parsing row: ${trimmed}`, e);
        }
      }
    }
  }
  
  return bookings;
}

const bookings = parseMarkdownBookings();
console.log(`Parsed ${bookings.length} bookings.`);
console.log(`First booking:`, bookings[0]);
console.log(`Last booking:`, bookings[bookings.length - 1]);
