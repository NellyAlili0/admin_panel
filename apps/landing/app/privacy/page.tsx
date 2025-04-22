
import Hero from "@/components/widgets/Privacy/Hero";
import PrivacyPage from "@/components/widgets/Privacy/PrivacyPage";

export const metadata = {
    title: "Privacy Policy - Zidallie",
    description: "Learn about Zidallie's privacy policy and how we protect your personal information.",
    keywords: ["Zidallie", "Privacy", "Policy", "Transport", "Schools", "Parents"],
};

export default function Page() {
    return (
        <div>
            <Hero />
            {/* <PrivacyPage title={undefined} sections={undefined} /> */}
        </div>
    );
}