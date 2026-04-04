/** Matches the Google Business Profile name so Maps opens the listing, not a wrong pin at the street address. */
const GOOGLE_MAPS_PLACE =
  "Cigar Society Lounge and Bar, 116 W State Ave, Pharr, TX 78577" as const;

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
  /** Full listing in Google Maps (embed above uses main-branch address-only `output=embed` URL). */
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(GOOGLE_MAPS_PLACE)}`,
  /** Stable Google Maps place URL (About “Get directions” and similar). */
  googleMapsPlacePageUrl:
    "https://www.google.com/maps/place/Cigar+Society+Lounge+and+Bar/@26.1959365,-98.184545,17z/data=!3m1!4b1!4m6!3m5!1s0x8665a15ba2993d4b:0xbd01be9230522f42!8m2!3d26.1959365!4d-98.184545!16s%2Fg%2F11xkd76kh7?entry=ttu&g_ep=EgoyMDI2MDQwMS4wIKXMDSoASAFQAw%3D%3D" as const,
  googleDirectionsUrl: `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${encodeURIComponent(GOOGLE_MAPS_PLACE)}`,
  /** Apple Maps place listing (official place id). */
  appleMapsUrl:
    "https://maps.apple.com/place?place-id=IF326323518F8FD96&address=116+W+State+Ave%2C+Pharr%2C+TX++78577%2C+United+States&coordinate=26.195983%2C-98.184578&name=Cigar+Society&_provider=9902" as const,
  appleDirectionsUrl: `https://maps.apple.com/?dirflg=d&daddr=${encodeURIComponent(GOOGLE_MAPS_PLACE)}`,
  homeV2VideoPaths: [
    "/videos/copy_99474A51-7078-450C-937E-34DEB928683E.MOV",
  ],
} as const;
