export const business = {
  name: "Cigar Society, LLC",
  shortName: "Cigar Society",
  address: "116 W State Ave, Pharr, TX 78577",
  phoneDisplay: "(956) 223-1303",
  phoneE164: "+19562231303",
  // Known from your Google listing screenshot; keep day-by-day hours out until you provide the full schedule.
  hoursText: "Open • Closes 11 PM",
  mapEmbedSrc: `https://www.google.com/maps?q=${encodeURIComponent(
    "116 W State Ave, Pharr, TX 78577"
  )}&output=embed`,
  mapUrl: `https://www.google.com/maps?q=${encodeURIComponent("116 W State Ave, Pharr, TX 78577")}&output=search`,
  homeV2VideoPaths: [
    "/videos/cigar-in-ashtray.mp4",
    "/videos/cigar-in-hand.mp4",
    "/videos/over-the-shoulder-shot.mp4",
    "/videos/whiskey-being-poured.mp4",
  ],
} as const;

