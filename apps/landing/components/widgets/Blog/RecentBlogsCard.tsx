import React from "react";

function RecentBlogsCard({ blogPost, handleReadMore }) {
  const truncatedDescription = (description) => {
    return description.length > 100
      ? description.substring(0, 100) + "..."
      : description;
  };

  return (
    <div
      className="mt-6 cursor-pointer"
      onClick={() => handleReadMore(blogPost.id)}
    >
      <div className="flex gap-3 bg-white border border-gray-100 shadow-md rounded-xl overflow-hidden items-center px-2">
        <div className="relative w-24 h-24 flex-shrink-0">
          <img
            className="absolute left-0 top-0 w-full h-full object-cover object-center"
            loading="lazy"
            src={blogPost.image}
            alt={blogPost.name}
          />
        </div>
        <div className="flex flex-col gap-2 p-4">
          <p className="text-black text-sm">
            {truncatedDescription(blogPost.description)}
          </p>
          <span className="text-sm text-gray-500">{blogPost.date}</span>
        </div>
      </div>
    </div>
  );
}

export default RecentBlogsCard;
