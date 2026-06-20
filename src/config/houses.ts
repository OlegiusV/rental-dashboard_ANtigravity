export interface ICalUrl {
  platform: 'Booking' | 'Airbnb' | 'VRBO' | 'Campanyon';
  url: string;
}

export interface HouseConfig {
  id: string;
  name: string;
  shortName: string;
  icalUrls: ICalUrl[];
  color: string;
}

export const houses: HouseConfig[] = [
  {
    id: '1',
    name: 'Retreat by the Falls',
    shortName: 'Retreat by the Falls',
    icalUrls: [
      {
        platform: 'Booking',
        url: 'https://ical.booking.com/v1/export?t=ec14e85b-ae44-47c0-a4e9-3354a61df22b',
      },
      {
        platform: 'Campanyon',
        url: 'https://service.campanyon.com/api/public/campspace/ics/ulqobfrmgfsexxsadufeiokeybfqnckdqmyuvsjobazdxmvmzfqoubgzonqsrudz/cal.ics',
      },
      {
        platform: 'Airbnb',
        url: 'https://www.airbnb.no/calendar/ical/1434913723535236204.ics?t=f8d2dd4520bf4279befef2cda555c815',
      }
    ],
    color: '#34d399', // Emerald
  },
  {
    id: '2',
    name: 'Retreat by the Falls & Riverside Sauna',
    shortName: 'Sauna Retreat',
    icalUrls: [
      {
        platform: 'Booking',
        url: 'https://ical.booking.com/v1/export?t=f53f5c6b-0c09-43ef-b53f-7ce08c833513',
      },
      {
        platform: 'Campanyon',
        url: 'https://service.campanyon.com/api/public/campspace/ics/algttebvgqjqdfxhefqbscttvbzssuayjzznkxxvpwkmynaguywjzhfgriruwqtc/cal.ics',
      },
      {
        platform: 'Airbnb',
        url: 'https://www.airbnb.no/calendar/ical/1698526356382307870.ics?t=f4186862042047de8f374e543e1c8938',
      }
    ],
    color: '#60a5fa', // Blue
  },
  {
    id: '3',
    name: 'Romantic Getaway: Hot Tub, Cinema & View',
    shortName: 'Romantic Getaway',
    icalUrls: [
      {
        platform: 'Booking',
        url: 'https://ical.booking.com/v1/export?t=fdba4463-7bdb-47aa-a94b-d3f4ff5ce58b',
      },
      {
        platform: 'Campanyon',
        url: 'https://service.campanyon.com/api/public/campspace/ics/bzqnuuhmhvqvboslzgfnhnfhscecajlndzmxrumjhalhjuoeahbsifujpfnzgonl/cal.ics',
      },
      {
        platform: 'Airbnb',
        url: 'https://www.airbnb.no/calendar/ical/1605106899418833124.ics?t=3e6ff6ab2c8541a9845e187f87f38115',
      }
    ],
    color: '#f472b6', // Pink
  },
  {
    id: '4',
    name: 'Royal Park Apartment Oslo City Center',
    shortName: 'Royal Park Apartment',
    icalUrls: [
      {
        platform: 'Booking',
        url: 'https://ical.booking.com/v1/export?t=83e32dad-d163-401e-9860-b6567e616409',
      }
    ],
    color: '#a78bfa', // Purple
  },
  {
    id: '5',
    name: 'Mountain & Lake Haven / Scenic Norway',
    shortName: 'Mountain & Lake Haven',
    icalUrls: [
      {
        platform: 'Booking',
        url: 'https://ical.booking.com/v1/export?t=9e036053-c663-4c4c-9735-1963b453af70',
      },
      {
        platform: 'Campanyon',
        url: 'https://service.campanyon.com/api/public/campspace/ics/wuirbqnqqamhcjzobsdcqyrczphchlhzmptedlsnpphyhaompciiwqqfgzvtecrd/cal.ics',
      },
      {
        platform: 'Airbnb',
        url: 'https://www.airbnb.no/calendar/ical/1051367251644143755.ics?t=c1e156d5527e4f678271c655feeec04c',
      }
    ],
    color: '#fbbf24', // Amber
  },
  {
    id: '6',
    name: 'The Cubist Retreat',
    shortName: 'The Cubist Retreat',
    icalUrls: [
      {
        platform: 'Booking',
        url: 'https://ical.booking.com/v1/export?t=c1f60ea2-291b-4e32-bb7b-77692eb5a73b',
      },
      {
        platform: 'Campanyon',
        url: 'https://service.campanyon.com/api/public/campspace/ics/zxhsmhjyquacjiuewrzrrrdoayawedurlvrndszwtvxebkzsqpdhsfdqwjhctxdn/cal.ics',
      },
      {
        platform: 'Airbnb',
        url: 'https://www.airbnb.no/calendar/ical/1168741375965054307.ics?t=f942a35263514fd581857d457f22a3db',
      }
    ],
    color: '#f87171', // Red
  }
];
