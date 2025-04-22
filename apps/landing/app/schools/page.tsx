import FAQ from "@/components/widgets/School/FAQ";
import Hero from "@/components/widgets/School/Hero";
import Offers from "@/components/widgets/School/Offers";
import Services from "@/components/widgets/School/Services";
import Tours from "@/components/widgets/School/Tours";
import OurFleet from "@/components/widgets/School/OurFleet";

export const metadata = {
    title: "School Transport Services - Zidallie",
    description: "Zidallie provides dedicated and reliable transport services for schools, ensuring safe and punctual travel for students.",
    keywords: ["Zidallie", "Contact", "Transport", "Schools", "Parents"],
};

export default function Page() {
    return (
        <div>
            <Hero />
            <Offers />
            <Services />
            <Tours />
            <OurFleet />
            <FAQ />
        </div>
    );
}