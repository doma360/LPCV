import { useScrollToHash } from "@/lib/useScrollToHash";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import ProfessionalsMarquee from "@/components/sections/ProfessionalsMarquee";
import HowItWorks from "@/components/sections/HowItWorks";
import PopularServices from "@/components/sections/PopularServices";
import FeaturedProfessionals from "@/components/sections/FeaturedProfessionals";
import Stats from "@/components/sections/Stats";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import AppTeaser from "@/components/sections/AppTeaser";
import Testimonials from "@/components/sections/Testimonials";
import CallToAction from "@/components/sections/CallToAction";
import Faq from "@/components/sections/Faq";

export default function Home() {
  useScrollToHash();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProfessionalsMarquee />
        <HowItWorks />
        <PopularServices />
        <FeaturedProfessionals />
        <Stats />
        <WhyChooseUs />
        <AppTeaser />
        <Testimonials />
        <CallToAction />
        <Faq />
      </main>
      <Footer />
    </>
  );
}