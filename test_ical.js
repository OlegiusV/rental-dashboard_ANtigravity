const ical = require('node-ical');
const fs = require('fs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const feeds = [
  { name: 'Retreat by the Falls', url: 'https://ical.booking.com/v1/export?t=ec14e85b-ae44-47c0-a4e9-3354a61df22b' },
  { name: 'Retreat by the Falls & Riverside Sauna', url: 'https://ical.booking.com/v1/export?t=f53f5c6b-0c09-43ef-b53f-7ce08c833513' },
  { name: 'Romantic Getaway: Hot Tub, Cinema & View', url: 'https://ical.booking.com/v1/export?t=fdba4463-7bdb-47aa-a94b-d3f4ff5ce58b' },
  { name: 'Royal Park Apartment Oslo City Center', url: 'https://ical.booking.com/v1/export?t=83e32dad-d163-401e-9860-b6567e616409' },
  { name: 'Scenic Norway! Close to Oslo', url: 'https://ical.booking.com/v1/export?t=9e036053-c663-4c4c-9735-1963b453af70' },
  { name: 'The Cubist Retreat', url: 'https://ical.booking.com/v1/export?t=c1f60ea2-291b-4e32-bb7b-77692eb5a73b' }
];

async function test() {
  for (const feed of feeds) {
    console.log(`\n=== Fetching ${feed.name} ===`);
    try {
      const events = await ical.async.fromURL(feed.url);
      let count = 0;
      for (const key in events) {
        const event = events[key];
        if (event.type === 'VEVENT') {
          const start = new Date(event.start);
          const end = new Date(event.end);
          // Only show some events to not overflow console, especially around June 2026
          if (start.getFullYear() === 2026 && start.getMonth() === 5) { // June is month 5
            console.log(`Event: ${event.summary}`);
            console.log(`  Start: ${start.toISOString()}`);
            console.log(`  End: ${end.toISOString()}`);
            console.log(`  Description: ${event.description || 'N/A'}`);
            count++;
          }
        }
      }
      console.log(`Found ${count} events in June 2026.`);
    } catch (e) {
      console.error(`Error:`, e);
    }
  }
}

test();
