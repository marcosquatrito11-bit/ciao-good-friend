import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { Guides } from "@/components/Guides";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyEtna } from "@/components/WhyEtna";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Categories />
      <Guides />
      <HowItWorks />
      <WhyEtna />
      <CtaBanner />
      <Footer />
    </main>
  );
};

export default Index;
