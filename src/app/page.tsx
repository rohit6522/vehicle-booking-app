import { Navbar } from "../components/marketing/Navbar";
import { Hero } from "../components/marketing/Hero";
import { FleetSection } from "../components/marketing/FleetSection";
import { Footer } from "../components/marketing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FleetSection />
      <Footer />
    </>
  );
}