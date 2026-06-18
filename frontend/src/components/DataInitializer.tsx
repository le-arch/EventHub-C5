'use client';

import { useEffect } from 'react';

export function DataInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('events')) {
      const sampleEvents = [
        {
          id: '1',
          title: 'Douala Music Fest',
          venueName: 'Palais des Congrès',
          city: 'Douala',
          startDate: '2025-12-01',
          startTime: '18:00',
          status: 'published',
          ticketStats: { totalSold: 120, totalRevenue: 600000, totalAttendees: 100 },
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Tech Conference Yaoundé',
          venueName: 'Hôtel Hilton',
          city: 'Yaoundé',
          startDate: '2025-11-15',
          startTime: '09:00',
          status: 'draft',
          ticketStats: { totalSold: 0, totalRevenue: 0, totalAttendees: 0 },
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('events', JSON.stringify(sampleEvents));
      console.log('Sample events seeded');
    }
  }, []);
  return null;
}