"use client";

import Link from "next/link";

const BlogDetail = (blog: any) => {

  if (!blog) {
    return <div className="text-center">Blog not found!</div>;
  }

  // const getRecentBlogs = (blogs, count = 3) => {
  //   return blogData
  //     .slice() // Make a copy to avoid mutating the original array
  //     // .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date (newest first)
  //     .slice(0, count); // Take the top 3
  // };

  // const getMoreBlogs = (allBlogs, currentBlogId, recentBlogs) => {
  //   // Collect IDs of recent blogs to exclude
  //   const recentBlogIds = recentBlogs.map((blog) => blog.id);

  //   // Filter out the current blog and recent blogs
  //   return allBlogs
  //     .filter(
  //       (blog) =>
  //         blog.id !== currentBlogId && // Exclude the current blog
  //         !recentBlogIds.includes(blog.id) // Exclude recent blogs
  //     )
  //     .slice(0, 3); // Only take 3
  // };

  // const recentBlogs = getRecentBlogs(blogData);
  // const moreBlogs = getMoreBlogs(blogData, id, recentBlogs);

  function handleReadMore(id: any) {
    throw new Error("Function Error.");
  }

  return (
    <section className="max-w-7xl mx-auto">
      <div className=" w-full p-2 md:p-10 grid lg:grid-cols-[65%_35%] gap-8 ">
        {/* Blog Content - 70% */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-6 blog">
          {/* <p className="text-base mb-3">{blog.date}</p> */}

          <img
            src={blog.image}
            alt={blog.name}
            className="w-full h-auto object-cover"
          />
          <div className="px-4 py-4">
            <h1 className="text-2xl md:text-3xl font-semibold mb-4">
              {blog.name}
            </h1>
            {/* <div className="product-des" dangerouslySetInnerHTML={{ __html: blog.content }}></div> */}
            <div dangerouslySetInnerHTML={{ __html: blog.content }}></div>
          </div>
        </div>

        {/* Recent Blogs - 30% */}
        <div className="mt-6">
          <section className="flex flex-col md:flex-row justify-start items-start md:items-center md:justify-between  mb-10 gap-3">
            <h1 className="font-bold text-2xl">Recent Blogs</h1>
            <Link
              href="/blog"
              className="inline-flex items-center py-2 px-6 ml-1 bg-transparent hover:bg-primary focus:outline-none rounded-xl text-base mt-4 md:mt-0 hover:text-white text-primary border border-primary"
            >
              <span className="mr-2">View More</span>
              <img src={"/assets/blog-news/read-arrow.png"} alt="" />
            </Link>
          </section>
          {/* <section>
            {recentBlogs &&
              recentBlogs.map((blogPost, index) => (
                <RecentBlogsCard
                  key={index}
                  blogPost={blogPost}
                  handleReadMore={handleReadMore}
                />
              ))}
          </section> */}
        </div>
      </div>
      {/* <section className="bg-about-bg w-full p-6 md:p-12">
        <h1 className="text-2xl font-semibold my-10">More Stories</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {moreBlogs.map((blog) => (
            <BlogCard
              key={blog.id}
              image={blog.image}
              name={blog.name}
              description={blog.description}
              date={blog.date}
              onClick={() => handleReadMore(blog.id)}
            />
          ))}
        </div>
      </section> */}
    </section>
  );
};

export default BlogDetail;
