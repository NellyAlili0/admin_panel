import BlogDetail from "@/components/widgets/Blog/BlogDetail";
import blogData from "@/lib/blogs";

export default async function Page({ params }: { params : any }) {
    const { id } = await params;
    const blog = blogData.find((blog) => blog.id === Number(id));
    return (
        <div>
            <BlogDetail blog={blog} />
        </div>
    );
}