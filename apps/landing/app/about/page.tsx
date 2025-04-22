import Founder from "@/components/widgets/About/Founder";
import Hero from "@/components/widgets/About/Hero";
import MissionVission from "@/components/widgets/About/MissionVission";
import Clients from "@/components/widgets/Home/Clients";

export const metadata = {
    title: "About Zidallie - Our Mission and Vision",
    description: "Learn more about Zidallie, our mission, vision, and the team dedicated to providing reliable transport services for schools and parents.",
    keywords: ["Zidallie", "About", "Mission", "Vision", "Team", "Transport", "Schools", "Parents"],
};

export default function Page() {
    return (
        <div>
            <Hero />
            <MissionVission />
            <Founder />
            {/* <Team /> */}
            <Clients />
        </div>
    );
}