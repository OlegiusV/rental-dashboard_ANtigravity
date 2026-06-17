import { fetchMergedBookings } from './src/lib/bookingParser';

async function test() {
  console.log('Fetching all bookings...');
  const bookings = await fetchMergedBookings();
  const byPlatform = bookings.reduce((acc, b) => {
    acc[b.platform] = (acc[b.platform] || 0) + 1;
    return acc;
  }, {});
  console.log('Bookings by platform:', byPlatform);
  console.log('Total bookings:', bookings.length);
}

test();
