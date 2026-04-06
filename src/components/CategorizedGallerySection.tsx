import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export type GalleryImage = { src: string; alt: string };

const CATEGORIES = ["community", "cigars", "lounge", "events", "ladies-night"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  lounge: "The Lounge & Bar",
  events: "Events",
  cigars: "Cigars",
  community: "Community",
  "ladies-night": "Ladies Night",
};

/** macOS screenshot filenames use U+202F between the time and "AM/PM". */
const NNBSP = "\u202f";

const GALLERY_CAPTIONS: Record<string, string> = {
  "580512872_17863436763513223_5233616996161284758_n.jpg": "Ladies Night in the lounge",
  "585159513_17864278512513223_5660544312649645129_n.jpg": "Cars & Cigars",
  "586903901_17865668085513223_6123565809163254740_n.jpg": "Warm lighting over leather and wood tones",
  "591173580_17866953369513223_4076419742576703159_n.jpg": "Friends catching up over drinks",
  "604395680_17868253992513223_880812479605106285_n.jpg": "Premium sticks lined up in the humidor",
  "605293395_17868382017513223_3442086218565352783_n.jpg": "Hand-selected cigars ready to light",
  "605656011_17868156843513223_3194506709341791938_n.jpg": "Ladies Night toast at the bar",
  "606904897_17868769233513223_2402522433528554150_n.jpg": "Evening smoke with South Texas sunset mood",
  "606976185_17868412983513223_5855742140579886973_n.jpg": "Laughter and cocktails on Ladies Night",
  "609255225_17869536099513223_7892965347821635369_n.jpg": "The bar, stocked for a relaxed night out",
  "612086995_17869770384513223_4189571264294972113_n.jpg": "Community regulars enjoying the lounge",
  "613719891_17870468649513223_1673385795035669928_n.jpg": "Wrapper and band details up close",
  "615239682_17870673027513223_9210724772083057760_n.jpg": "Humidor picks for every palate",
  "616233682_17870686134513223_979494318211724155_n.jpg": "A slow burn and good conversation",
  "621378620_17872100592513223_39090333076087337_n.jpg": "Cigar and spirits pairing at the rail",
  "624770251_17872759179513223_4240075675422108761_n.jpg": "Celebration vibes after hours",
  "625961026_17872731045513223_484494501309609670_n.jpg": "Fresh cuts from the tobacconist’s selection",
  "628448370_17873396073513223_4952463424014874406_n.jpg": "Night-out smoke on the patio",
  "630210155_17874944961513223_3907484928646509513_n.jpg": "Ladies Night out in Pharr",
  "640521743_17876872863513223_1598545724808852459_n.jpg": "Dressed-up evening at the lounge",
  "641104878_122170470326917320_524090666738891469_n.jpg": "Your favorite hour, made even better.",
  "641257260_17876872920513223_8406291060331286732_n.jpg": "Acoustic performer under the spotlight",
  "641767635_17876872875513223_7481023002489191223_n.jpg": "Smoke, sip, and celebrate — RGV style",
  "641787042_17876872929513223_6135396041659189178_n.jpg": "Closing the night with one more round",
  "641777087_17876480688513223_1895504743949000298_n.jpg": "Unwinding with a hand-rolled cigar",
  "648268694_17877210447513223_4436444531094811554_n.jpg": "Live music night — save the date in Pharr",
  "648720465_17877383793513223_7442216020774777898_n.jpg": "Unplugged duo on the Society stage",
  "649223639_17877383829513223_6721050269951457093_n.jpg": "Leather chairs, good friends, cigars, and a cold drink",
  "649246053_17877686865513223_1470363784287960166_n.jpg": "Premium pours, cigars, and lounge conversation",
  "656294732_17879541051513223_1720072432877599320_n.jpg": "The crew under the Cigar Society banner",
  [`Screenshot 2026-04-04 at 2.54.38${NNBSP}PM.png`]: "Celebration night in the lounge",
  [`Screenshot 2026-04-04 at 2.55.16${NNBSP}PM.png`]: "Industrial-chic seating for your evening",
  [`Screenshot 2026-04-04 at 2.55.41${NNBSP}PM.png`]: "Cigars, spirits, and South Texas nights",
  [`Screenshot 2026-04-04 at 2.56.58${NNBSP}PM.png`]: "Illuminated humidor wall and premium selection",
  [`Screenshot 2026-04-04 at 2.58.16${NNBSP}PM.png`]: "A perfect pour at the bar",
  [`Screenshot 2026-04-04 at 2.58.26${NNBSP}PM.png`]: "Fiddle, guitar, and a pour — from your table",
  [`Screenshot 2026-04-04 at 3.03.12${NNBSP}PM.png`]: "Friends gathered outside Cigar Society",
  [`Screenshot 2026-04-04 at 3.03.41${NNBSP}PM.png`]: "Blood Medicine cigars at the bar",
  [`Screenshot 2026-04-04 at 3.12.50${NNBSP}PM.png`]: "Premium spirits and hand-picked cigars at the bar",
  [`Screenshot 2026-04-04 at 3.15.37${NNBSP}PM.png`]: "Signature cocktail menu",
  [`Screenshot 2026-04-04 at 3.19.02${NNBSP}PM.png`]: "Rare bourbons and Fuente OpusX on display",
  "Uploaded image.png": "Arriving in style at Cigar Society",
};

function galleryBasename(modulePath: string): string {
  const parts = modulePath.split("/");
  return parts[parts.length - 1] ?? modulePath;
}

const categoryModules: Record<Category, Record<string, { default: string }>> = {
  lounge: import.meta.glob<{ default: string }>(
    "../assets/gallery/lounge/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
    { eager: true },
  ),
  events: import.meta.glob<{ default: string }>(
    "../assets/gallery/events/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
    { eager: true },
  ),
  cigars: import.meta.glob<{ default: string }>(
    "../assets/gallery/cigars/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
    { eager: true },
  ),
  community: import.meta.glob<{ default: string }>(
    "../assets/gallery/community/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
    { eager: true },
  ),
  "ladies-night": import.meta.glob<{ default: string }>(
    "../assets/gallery/ladies-night/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
    { eager: true },
  ),
};

type CategorizedImages = Record<Category, GalleryImage[]>;

const GALLERY_BY_CATEGORY: CategorizedImages = Object.fromEntries(
  CATEGORIES.map((cat) => [
    cat,
    Object.entries(categoryModules[cat])
      .map(([path, mod]) => {
        const file = galleryBasename(path);
        return { src: mod.default, alt: GALLERY_CAPTIONS[file] ?? "Lounge photo" };
      })
      .sort((a, b) => a.alt.localeCompare(b.alt, undefined, { sensitivity: "base" })),
  ]),
) as CategorizedImages;

function LoungePhotoTile({
  img,
  onOpen,
  layout,
}: {
  img: GalleryImage;
  onOpen: (img: GalleryImage) => void;
  layout: "marquee" | "static";
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open photo: ${img.alt}`}
      onClick={() => onOpen(img)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(img);
        }
      }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-primary/25 shadow-[0_0_0_1px_hsl(var(--gold)/0.12),0_20px_50px_-20px_hsl(0_0%_0%_/0.5)] outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer group/card",
        layout === "marquee" && "w-[min(78vw,320px)] shrink-0",
        layout === "static" && "w-full max-w-sm sm:max-w-none sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]",
      )}
    >
      <div className="aspect-[4/3] bg-muted">
        <img
          src={img.src}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-[1.02]"
          decoding="async"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent pt-12 pb-3 px-3">
        <p className="text-foreground font-body text-xs sm:text-sm text-center leading-snug">{img.alt}</p>
      </div>
    </div>
  );
}

/** ~55s per full loop at 60fps for a typical duplicated track width; feels close to the old CSS marquee. */
const GALLERY_AUTO_SCROLL_PX_PER_FRAME = 0.42;
const GALLERY_AUTO_PAUSE_AFTER_USER_MS = 4000;

function CategoryGalleryRow({
  category,
  images,
  prefersReducedMotion,
  onOpen,
}: {
  category: Category;
  images: GalleryImage[];
  prefersReducedMotion: boolean;
  onOpen: (img: GalleryImage) => void;
}) {
  const marqueeTrack = [...images, ...images];
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const rafRef = useRef(0);

  const pauseAutoScroll = useCallback(() => {
    pauseUntilRef.current = performance.now() + GALLERY_AUTO_PAUSE_AFTER_USER_MS;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || images.length === 0) return;

    const el = scrollRef.current;
    if (!el) return;

    const tick = () => {
      const now = performance.now();
      if (now >= pauseUntilRef.current) {
        isProgrammaticScrollRef.current = true;
        el.scrollLeft += GALLERY_AUTO_SCROLL_PX_PER_FRAME;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half - 2) {
          el.scrollLeft -= half;
        }
        // `scroll` can fire after this stack or the next frame; clearing the flag immediately
        // made `onScroll` treat every auto tick as a user scroll and pause forever.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isProgrammaticScrollRef.current = false;
          });
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [prefersReducedMotion, images.length, category]);

  const onScroll = useCallback(() => {
    if (!isProgrammaticScrollRef.current) {
      pauseAutoScroll();
    }
  }, [pauseAutoScroll]);

  return (
    <div className="mb-16 last:mb-0">
      <div className="container mx-auto max-w-6xl mb-6 px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl md:text-3xl text-center text-foreground mb-2">
          {CATEGORY_LABELS[category]}
        </h2>
        {images.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm font-body max-w-xl mx-auto">
            Photos for this section will appear here once they are added to the gallery folder.
          </p>
        ) : null}
      </div>

      {images.length > 0 ? (
        <div className="relative w-full">
          {!prefersReducedMotion ? (
            <>
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-20 bg-gradient-to-r from-background via-background/80 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-20 bg-gradient-to-l from-background via-background/80 to-transparent"
                aria-hidden
              />
              <div
                ref={scrollRef}
                role="region"
                aria-label={`${CATEGORY_LABELS[category]} — scroll horizontally or wait for auto-play`}
                className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-pl-4 scroll-pr-4 sm:scroll-pl-6 sm:scroll-pr-6 lg:scroll-pl-8 lg:scroll-pr-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onScroll={onScroll}
                onWheel={(e) => {
                  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    pauseAutoScroll();
                  }
                }}
              >
                <div className="flex w-max gap-4 md:gap-6 py-2 pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
                  {marqueeTrack.map((img, i) => (
                    <LoungePhotoTile
                      key={`${category}-${img.src}-${i}`}
                      img={img}
                      onOpen={onOpen}
                      layout="marquee"
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="container mx-auto flex max-w-6xl flex-wrap justify-center gap-4 md:gap-6 py-2 px-4 sm:px-6 lg:px-8">
              {images.map((img) => (
                <LoungePhotoTile key={`${category}-${img.src}`} img={img} onOpen={onOpen} layout="static" />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function CategorizedGallerySection() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const openImage = (img: GalleryImage) => {
    setSelected(img);
    setOpen(true);
  };

  return (
    <>
      <section
        className="section-padding bg-gradient-to-b from-background via-muted/15 to-background border-b border-border/50"
        aria-label="Photo gallery by category"
      >
        {CATEGORIES.map((cat) => (
          <CategoryGalleryRow
            key={cat}
            category={cat}
            images={GALLERY_BY_CATEGORY[cat]}
            prefersReducedMotion={prefersReducedMotion}
            onOpen={openImage}
          />
        ))}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background border-border">
          {selected ? (
            <div>
              <img
                src={selected.src}
                alt={selected.alt}
                className="w-full h-auto max-h-[70vh] object-contain"
                decoding="async"
                fetchPriority="high"
              />
              <div className="p-4 border-t border-border/60">
                <p className="text-muted-foreground text-sm">{selected.alt}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
