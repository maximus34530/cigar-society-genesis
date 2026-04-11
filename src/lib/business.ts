/** Matches the Google Business Profile name so Maps opens the listing, not a wrong pin at the street address. */
const GOOGLE_MAPS_PLACE =
  "Cigar Society Lounge and Bar, 116 W State Ave, Pharr, TX 78577" as const;

/** Canonical GBP / Google Maps place page — keep in sync with `LocalBusiness.sameAs` in `index.html`. */
const GOOGLE_MAPS_PLACE_PAGE_URL =
  "https://www.google.com/maps/place/Cigar+Society+Lounge+and+Bar/@26.1959365,-98.1871253,17z/data=!4m6!3m5!1s0x8665a15ba2993d4b:0xbd01be9230522f42!8m2!3d26.1959365!4d-98.184545!16s%2Fg%2F11xkd76kh7?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D" as const;

export const business = {
  name: "Cigar Society, LLC",
  /** Customer-facing venue name (footer heading, marketing). Legal entity is {@link business.name}. */
  publicVenueName: "Cigar Society Lounge and Bar" as const,
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
  /** Same pattern as `main`: address-only query + `output=embed` for the homepage/contact iframe. */
  mapEmbedSrc: `https://www.google.com/maps?q=${encodeURIComponent(
    "116 W State Ave, Pharr, TX 78577",
  )}&output=embed`,
  /** Google Maps place listing (hero CTAs, Contact, FAQ — same URL as About / JSON-LD `sameAs`). */
  mapUrl: GOOGLE_MAPS_PLACE_PAGE_URL,
  /** Same as {@link business.mapUrl}; kept for call sites that reference the place page explicitly. */
  googleMapsPlacePageUrl: GOOGLE_MAPS_PLACE_PAGE_URL,
  googleDirectionsUrl: `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${encodeURIComponent(GOOGLE_MAPS_PLACE)}`,
  /** Apple Maps place listing (official place id). */
  appleMapsUrl:
    "https://maps.apple.com/place?place-id=IF326323518F8FD96&address=116+W+State+Ave%2C+Pharr%2C+TX++78577%2C+United+States&coordinate=26.195983%2C-98.184578&name=Cigar+Society&_provider=9902" as const,
  appleDirectionsUrl: `https://maps.apple.com/?dirflg=d&daddr=${encodeURIComponent(GOOGLE_MAPS_PLACE)}`,
  homeV2VideoPaths: [
    "/videos/copy_99474A51-7078-450C-937E-34DEB928683E.MOV",
  ],
} as const;
