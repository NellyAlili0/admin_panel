
import Hero from "@/components/widgets/Parents/Hero";
import Offers from "@/components/widgets/Parents/Offers";
import Services from "@/components/widgets/Parents/Services";
import FAQ from "@/components/widgets/Parents/FAQ";

export const metadata = {
    title: "Transport Services for Parents - Zidallie",
    description: "Zidallie offers reliable transport services for parents, ensuring your children travel safely to and from school.",
    keywords: ["Zidallie", "Contact", "Get in Touch", "Transport", "Schools", "Parents"],
};

export default function Page() {
    return (
        <div>
            <Hero />
            <Offers />
            <Services />
            <FAQ />
        </div>
    );
}