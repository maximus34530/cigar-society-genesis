import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import cigarsImg from "@/assets/cigars-featured.jpg";
import cigarCloseup from "@/assets/cigar-closeup.jpg";

const categories = [
  {
    strength: "Mild",
    cigars: [
      { name: "Macanudo Café", origin: "Dominican Republic", wrapper: "Connecticut Shade", description: "Creamy and smooth with subtle notes of cedar and vanilla." },
      { name: "Ashton Classic", origin: "Dominican Republic", wrapper: "Connecticut", description: "Elegant and refined with a mellow, buttery finish." },
    ],
  },
  {
    strength: "Medium",
    cigars: [
      { name: "Arturo Fuente Hemingway", origin: "Dominican Republic", wrapper: "Cameroon", description: "Perfectly balanced with flavors of earth, nuts, and sweet spice." },
      { name: "Romeo y Julieta 1875", origin: "Honduras", wrapper: "Connecticut", description: "Classic medium-body with notes of almond and light pepper." },
    ],
  },
  {
    strength: "Full Body",
    cigars: [
      { name: "Padrón 1964 Anniversary", origin: "Nicaragua", wrapper: "Maduro", description: "Rich and complex with cocoa, coffee, and a long earthy finish." },
      { name: "Liga Privada No. 9", origin: "Nicaragua", wrapper: "Connecticut Broadleaf", description: "Dark and powerful with notes of dark chocolate, pepper, and leather." },
    ],
  },
];

const Cigars = () => (
  <Layout>
    <Seo
      title="Premium Cigars — Catalog & Selection"
      description="Browse mild, medium, and full-body cigars at Cigar Society in Pharr, TX — curated selections from the world's finest makers."
      path="/cigars"
    />
    <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
      <img src={cigarCloseup} alt="Premium cigars" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-background/75" />
      <div className="relative z-10 text-center px-4 animate-fade-in">
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground">Our Cigars</h1>
        <div className="gold-divider mt-6" />
      </div>
    </section>

    {categories.map((cat) => (
      <section key={cat.strength} className={`section-padding ${cat.strength === "Medium" ? "bg-muted" : ""}`}>
        <div className="container mx-auto">
          <SectionHeading title={cat.strength} subtitle={`Explore our ${cat.strength.toLowerCase()} cigar selection.`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {cat.cigars.map((cigar) => (
              <div key={cigar.name} className="bg-card rounded-lg border border-border overflow-hidden shadow-card hover:border-primary/30 transition-colors">
                <img src={cigarsImg} alt={cigar.name} className="w-full h-48 object-cover" loading="lazy" />
                <div className="p-6">
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-1">{cigar.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-3 text-xs font-body tracking-wider uppercase text-primary">
                    <span>{cigar.origin}</span>
                    <span>·</span>
                    <span>{cigar.wrapper}</span>
                    <span>·</span>
                    <span>{cat.strength}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{cigar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ))}
  </Layout>
);

export default Cigars;
