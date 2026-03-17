import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import heroImg from "@/assets/hero-lounge.jpg";
import cigarsImg from "@/assets/cigars-featured.jpg";
import humidorImg from "@/assets/humidor.jpg";
import exteriorImg from "@/assets/exterior.jpg";
import eventImg from "@/assets/event.jpg";
import cigarCloseup from "@/assets/cigar-closeup.jpg";
import loungeSeating from "@/assets/lounge-seating.jpg";

const images = [
  { src: heroImg, alt: "Premium cigar lounge interior" },
  { src: humidorImg, alt: "Walk-in humidor" },
  { src: cigarsImg, alt: "Featured cigar selection" },
  { src: eventImg, alt: "Cigar tasting event" },
  { src: exteriorImg, alt: "Lounge exterior" },
  { src: cigarCloseup, alt: "Cigar and cutter close-up" },
  { src: loungeSeating, alt: "Leather lounge seating area" },
  { src: heroImg, alt: "Lounge ambiance" },
];

const Gallery = () => (
  <Layout>
    <section className="section-padding">
      <div className="container mx-auto">
        <SectionHeading title="Gallery" subtitle="Step inside the Cigar Society US experience." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg group cursor-pointer aspect-[4/3]"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors duration-300 flex items-end">
                <span className="text-foreground font-body text-sm p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {img.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Gallery;
