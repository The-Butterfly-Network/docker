import { useEffect } from "react";
import ButterflyHeader from "@/components/ButterflyHeader";
import ButterflyFooter from "@/components/ButterflyFooter";
import CurrentFront from "@/components/CurrentFront";

const About = () => {
  useEffect(() => {
    // SEO: Title and meta description
    const prevTitle = document.title;
    document.title = "About Us - The Butterfly Network";

    const desc = "Learn about The Butterfly Network — our mission, values, and community projects.";
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    const prevDesc = metaDesc.content;
    metaDesc.content = desc;

    // Canonical link
    const canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", `${window.location.origin}/about`);
    document.head.appendChild(canonical);

    // Structured data (Organization)
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "The Butterfly Network",
      url: `${window.location.origin}`,
      sameAs: [
        "https://github.com/CloveTwilight3"
      ]
    });
    document.head.appendChild(ld);

    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc.content = prevDesc || metaDesc.content;
      document.head.removeChild(canonical);
      document.head.removeChild(ld);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <CurrentFront />
      <ButterflyHeader />
      <main className="container mx-auto px-6 py-12">
        <section className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">About The Butterfly Network</h1>
          <p className="text-muted-foreground text-lg">
            The Butterfly Network is a community-driven hub connecting inclusive projects, creators, and resources. We aim to make the web more welcoming and accessible for everyone.
          </p>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="text-muted-foreground">
              We curate and support projects that empower communities, celebrate diversity, and share knowledge freely. From gaming and social spaces to helpful tools, our network brings it all together.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">What We Do</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Showcase community sites and resources</li>
              <li>Promote collaboration between creators</li>
              <li>Highlight inclusive initiatives and events</li>
            </ul>
          </section>
          <section className="space-y-3 pt-8 border-t border-border">
            <h2 className="text-2xl font-semibold">Trademark Notice</h2>
            <p className="text-muted-foreground text-sm">
              "Doughmination System®" is a trademark in the United Kingdom under trademark number{" "}
              <a 
                href="https://trademarks.ipo.gov.uk/ipo-tmcase/page/Results/1/UK00004263144"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline transition-colors"
              >
                UK00004263144
              </a>.
            </p>
          </section>
        </section>
      </main>
      <ButterflyFooter />
    </div>
  );
};

export default About;
