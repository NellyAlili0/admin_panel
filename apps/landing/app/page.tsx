import { Button } from "@/components/ui/button";
import Clients from "@/components/widgets/Home/Clients";
import Hero from "@/components/widgets/Home/Hero";
import Newsletter from "@/components/widgets/Home/Newsletter";
import OurStory from "@/components/widgets/Home/OurStory";
import Services from "@/components/widgets/Home/Services";
import Statistics from "@/components/widgets/Home/Statistics";
import Testimonials from "@/components/widgets/Home/Testimonials";
import { testimonialsData } from "@/lib/data";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Hero />
      <Statistics />
      <Services />
      <OurStory />
      <Testimonials testimonialsData={testimonialsData} isMobile={false} />
      <Clients />
      <Newsletter />
    </main>
  )
}
