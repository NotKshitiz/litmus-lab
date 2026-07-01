import Backdrop from "@/components/Backdrop";
import LichenGrowth from "@/components/LichenGrowth";
import ScrollProgress from "@/components/ScrollProgress";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Features from "@/components/Features";
import Metrics from "@/components/Metrics";
import HowItWorks from "@/components/HowItWorks";
import Models from "@/components/Models";
import Roadmap from "@/components/Roadmap";
import Waitlist from "@/components/Waitlist";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Backdrop />
      <LichenGrowth />
      <ScrollProgress />
      <Nav />
      <Hero />
      <Problem />
      <Features />
      <Roadmap />
      <Metrics />
      <HowItWorks />
      <Models />
      <Waitlist />
      <Footer />
    </main>
  );
}
