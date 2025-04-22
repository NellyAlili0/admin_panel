
import Hero from "@/components/widgets/conditions/Hero";
import TermsPage from "@/components/widgets/conditions/TermsPage";

export const metadata = {
    title: "Zidallie Conditions - Terms and Conditions",
    description: "Learn more about Zidallie's terms and conditions for using our services.",
    keywords: ["Zidallie", "Conditions", "Terms", "Transport", "Schools", "Parents"],
};

export default function Page() {
    return (
        <div>
            <Hero />
            {/* <TermsPage title={undefined} sections={undefined} /> */}
        </div>
    );
}