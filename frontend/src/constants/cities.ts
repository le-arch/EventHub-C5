/**
 * Cities Constants
 * 
 * List of major cities in Cameroon for event location selection.
 * Used in event creation forms and filters.
 * 
 * @module CitiesConstants
 */

export const CAMEROON_CITIES = [
  'Douala',
  'Yaoundé',
  'Garoua',
  'Bamenda',
  'Maroua',
  'Bafoussam',
  'Nkongsamba',
  'Limbe',
  'Edéa',
  'Kumbo',
  'Bertoua',
  'Loum',
  'Kribi',
  'Mbalmayo',
  'Foumban',
  'Ebolowa',
  'Buea',
  'Dschang',
  'Bafia',
  'Mokolo',
] as const

export type CameroonCity = typeof CAMEROON_CITIES[number]

// City regions mapping
export const CITY_REGIONS: Record<CameroonCity, string> = {
  Douala: 'Littoral',
  Yaoundé: 'Centre',
  Garoua: 'Nord',
  Bamenda: 'Nord-Ouest',
  Maroua: 'Extrême-Nord',
  Bafoussam: 'Ouest',
  Nkongsamba: 'Littoral',
  Limbe: 'Sud-Ouest',
  Edéa: 'Littoral',
  Kumbo: 'Nord-Ouest',
  Bertoua: 'Est',
  Loum: 'Littoral',
  Kribi: 'Sud',
  Mbalmayo: 'Centre',
  Foumban: 'Ouest',
  Ebolowa: 'Sud',
  Buea: 'Sud-Ouest',
  Dschang: 'Ouest',
  Bafia: 'Centre',
  Mokolo: 'Extrême-Nord',
}

// Get all cities grouped by region
export const CITIES_BY_REGION = Object.entries(CITY_REGIONS).reduce((acc, [city, region]) => {
  if (!acc[region]) {
    acc[region] = []
  }
  acc[region].push(city as CameroonCity)
  return acc
}, {} as Record<string, CameroonCity[]>)

// City coordinates for map display (optional)
export const CITY_COORDINATES: Record<CameroonCity, { lat: number; lng: number }> = {
  Douala: { lat: 4.0511, lng: 9.7679 },
  Yaoundé: { lat: 3.8480, lng: 11.5021 },
  Garoua: { lat: 9.3015, lng: 13.3977 },
  Bamenda: { lat: 5.9596, lng: 10.1452 },
  Maroua: { lat: 10.5910, lng: 14.3159 },
  Bafoussam: { lat: 5.4771, lng: 10.4176 },
  Nkongsamba: { lat: 4.9525, lng: 9.9314 },
  Limbe: { lat: 4.0242, lng: 9.2061 },
  Edéa: { lat: 3.8000, lng: 10.1333 },
  Kumbo: { lat: 6.2000, lng: 10.6667 },
  Bertoua: { lat: 4.5773, lng: 13.6845 },
  Loum: { lat: 4.7181, lng: 9.7351 },
  Kribi: { lat: 2.9376, lng: 9.9078 },
  Mbalmayo: { lat: 3.5167, lng: 11.5000 },
  Foumban: { lat: 5.7167, lng: 10.9000 },
  Ebolowa: { lat: 2.9000, lng: 11.1500 },
  Buea: { lat: 4.1667, lng: 9.2333 },
  Dschang: { lat: 5.4500, lng: 10.0667 },
  Bafia: { lat: 4.7500, lng: 11.2333 },
  Mokolo: { lat: 10.7410, lng: 13.8020 },
}