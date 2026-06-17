const ical = require('node-ical');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = 'https://ical.booking.com/v1/export?t=ec14e85b-ae44-47c0-a4e9-3354a61df22b';

async function test() {
  console.log(`Fetching all events for Retreat by the Falls...`);
  try {
    const events = await ical.async.fromURL(url);
    const eventList = [];
    for (const key in events) {
      const event = events[key];
      if (event.type === 'VEVENT') {
        eventList.push({
          summary: event.summary,
          start: event.start,
          end: event.end,
          description: event.description
        });
      }
    }
    console.log(`Total events fetched: ${eventList.length}`);
    // Sort and print the first 20 events
    eventList.sort((a, b) => new Date(a.start) - new Date(b.start));
    console.log(JSON.stringify(eventList.slice(0, 50), null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
