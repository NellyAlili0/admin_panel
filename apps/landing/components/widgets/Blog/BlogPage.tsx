"use client"

import React, { useState, useEffect } from "react";
import BlogCard from "./BlogCard";
import { useRouter } from "next/navigation";

const BlogPage = ({ blogData }) => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    if (viewAll) {
      setData(blogData);
    } else {
      setData(blogData.slice(0, 3));
    }
  }, [viewAll]);

  const handleReadMore = (id: number) => {
    router.push(`/blog/${id}`);
  };

  const handleViewAll = () => {
    setViewAll(true);
  };

  return (
    <div className="flex justify-center items-center bg-blog-bg pb-16">
      <div className="max-w-6xl mx-5 md:mx-10">
        <div className="container mx-auto p-2 md:p-6">
          <section className="mt-10 mb-16">
            <h1 className="my-6 text-3xl font-bold tracking-tight md:text-4xl text-left md:text-center">
              Stay Updated with Our Blog and News
            </h1>
            <p className="max-w-xl mx-auto my-1 text-base text-gray-500 leading-8 text-left md:text-center">
              Explore our featured blogs and road safety news to stay informed
              about the latest developments.
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((blog: any) => (
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

          {!viewAll && (
            <section className="w-full flex justify-center items-center mt-10 py-5">
              <button
                onClick={handleViewAll}
                className="inline-flex items-center py-3 px-10 ml-1 bg-transparent hover:bg-primary focus:outline-none rounded-4xl text-base mt-4 md:mt-0 hover:text-white text-primary border border-primary"
              >
                View all
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
