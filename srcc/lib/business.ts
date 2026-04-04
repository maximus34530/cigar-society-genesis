/** Matches the Google Business Profile name so Maps opens the listing, not a wrong pin at the street address. */
const GOOGLE_MAPS_PLACE =
  "Cigar Society Lounge and Bar, 116 W State Ave, Pharr, TX 78577" as const;

const MAP_OSM_LAT = "26.1948332" as const;
const MAP_OSM_LON = "-98.1796119" as const;

export const business = {
  name: "Cigar Society, LLC",
  shortName: "Cigar Society",
  address: "116 W State Ave, Pharr, TX 78577",
  directionsDestination: "Cigar Society, 116 W State Ave, Pharr, TX 78577",
  phoneDisplay: "(956) 223-1303",
  phoneE164: "+19562231303",
  /** Single-line hours for legacy `<p>` displays (e.g. Contact). */
  hoursText:
    "Mon–Tue 10 AM–10 PM · Wed 10 AM–11 PM · Thu–Sat 10 AM–12 AM · Sun 11 AM–7 PM",
  hoursSchedule: [
    { day: "Monday", hours: "10 AM – 10 PM" },
    { day: "Tuesday", hours: "10 AM – 10 PM" },
    { day: "Wednesday", hours: "10 AM – 11 PM" },
    { day: "Thursday", hours: "10 AM – 12 AM" },
    { day: "Friday", hours: "10 AM – 12 AM" },
    { day: "Saturday", hours: "10 AM – 12 AM" },
    { day: "Sunday", hours: "11 AM – 7 PM" },
  ] as const,
  googleRating: { stars: 5.0, reviewCount: 27 } as const,
  instagramUrl: "https://www.instagram.com/cigarsocietystx/",
  instagramHandle: "cigarsocietystx",
  googleMapsPlaceQuery: GOOGLE_MAPS_PLACE,
  mapEmbedSrc: `https://www.openstreetmap.org/export/embed.html?bbox=-98.186%2C26.190%2C-98.173%2C26.199&layer=map&marker=${MAP_OSM_LAT}%2C${MAP_OSM_LON}`,
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(GOOGLE_MAPS_PLACE)}`,
  googleDirectionsUrl: `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${encodeURIComponent(GOOGLE_MAPS_PLACE)}`,
  appleDirectionsUrl: `https://maps.apple.com/?dirflg=d&daddr=${encodeURIComponent(GOOGLE_MAPS_PLACE)}`,
  homeV2VideoPaths: [
    "/videos/copy_99474A51-7078-450C-937E-34DEB928683E.MOV",
  ],
} as const;
