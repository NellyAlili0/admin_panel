import ContactInfo from "@/components/widgets/contact/ContactInfo";
import Hero from "@/components/widgets/contact/Hero";
import Location from "@/components/widgets/contact/Location";

export const metadata = {
    title: "Zidallie Contact - Get in Touch",
    description: "Get in touch with Zidallie to learn more about our services and how we can help you with your transport needs.",
    keywords: ["Zidallie", "Contact", "Get in Touch", "Transport", "Schools", "Parents"],
};

export default function Page() {
    return (
        <div>
            <Hero />
            <ContactInfo />
            <Location />
        </div>
    );
}