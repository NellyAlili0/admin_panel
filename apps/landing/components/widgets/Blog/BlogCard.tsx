import React from "react";

const BlogCard = ({ image, name, description, date, onClick }) => {
  const truncatedDescription =
    description.length > 100
      ? description.substring(0, 100) + "..."
      : description;

  return (
    <div
      className="border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <img
        src={image}
        alt={name}
        className="w-full h-52 p-2 rounded-2xl object-cover"
      />
      <div className="p-4">
        <p className="text-xs text-gray-400">{date}</p>
        <h3 className="text-lg font-semibold mt-2">{name}</h3>
        <p className="text-sm text-gray-600 mt-3 leading-6">
          {truncatedDescription}
        </p>
        <button className="text-primary text-sm mt-4 flex items-center gap-3 cursor-pointer">
          <span>Read More</span>
          <img src={"/assets/blog-news/read-arrow.png"} alt="" />
        </button>
      </div>
    </div>
  );
};

export default BlogCard;
