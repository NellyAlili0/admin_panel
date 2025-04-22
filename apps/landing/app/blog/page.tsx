
import BlogPage from "@/components/widgets/Blog/BlogPage";
import Hero from "@/components/widgets/Blog/Hero";
import blogData from "@/lib/blogs";

export const metadata = {
    title: "Zidallie Blog & News - News and Updates",
    description: "Stay updated with the latest news, blogs and updates from Zidallie. Read our blog to learn more about our services and industry insights.",
    keywords: ["Zidallie", "Blog", "News", "Updates", "Transport", "Schools", "Parents"],
};

export default function Page() {
    return (
        <div>
            <Hero />
            <BlogPage blogData={blogData} />
        </div>
    );
}