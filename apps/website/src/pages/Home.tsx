import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import PopularServices from "@/components/sections/PopularServices";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import NearbyProfessionals from "@/components/sections/NearbyProfessionals";
import Testimonials from "@/components/sections/Testimonials";
import CallToAction from "@/components/sections/CallToAction";
import Faq from "@/components/sections/Faq";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <PopularServices />
        <WhyChooseUs />
        <NearbyProfessionals />
        <Testimonials />
        <CallToAction />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
