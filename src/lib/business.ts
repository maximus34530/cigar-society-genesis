export const business = {
  name: "Cigar Society, LLC",
  shortName: "Cigar Society",
  address: "116 W State Ave, Pharr, TX 78577",
  directionsDestination: "Cigar Society, 116 W State Ave, Pharr, TX 78577",
  phoneDisplay: "(956) 223-1303",
  phoneE164: "+19562231303",
  // Known from your Google listing screenshot; keep day-by-day hours out until you provide the full schedule.
  hoursText: "Open • Closes 11 PM",
  mapEmbedSrc: `https://www.google.com/maps?q=${encodeURIComponent(
    "116 W State Ave, Pharr, TX 78577"
  )}&output=embed`,
  mapUrl: `https://www.google.com/maps?q=${encodeURIComponent("116 W State Ave, Pharr, TX 78577")}&output=search`,
  googleDirectionsUrl: `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${encodeURIComponent(
    "Cigar Society, 116 W State Ave, Pharr, TX 78577"
  )}`,
  appleDirectionsUrl: `https://maps.apple.com/?dirflg=d&daddr=${encodeURIComponent(
    "Cigar Society, 116 W State Ave, Pharr, TX 78577"
  )}`,
  homeV2VideoPaths: [
    "/videos/copy_99474A51-7078-450C-937E-34DEB928683E.MOV",
  ],
} as const;

