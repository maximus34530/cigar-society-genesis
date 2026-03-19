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
  homeV2VideoPath: "/videos/home-v2.mp4",
} as const;

