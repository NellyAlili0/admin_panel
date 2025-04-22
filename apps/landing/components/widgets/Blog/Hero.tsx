

function Hero() {
  return (
    <section
      className="relative w-full bg-cover bg-center h-80 flex items-center justify-center bg-black mt-10"
      style={{ backgroundImage: `url("/assets/blog-news/blog-hero.png")` }}
    >
      {/* dark overlay for better text visibility */}
      <div className="relative  flex items-center justify-center h-full px-6 sm:px-12 md:px-20 ">
        <div className=" text-white text-center ">
          <h1 className="text-3xl md:text-5xl font-semibold mb-6">
            Blogs & News
          </h1>
          <p className="text-base md:text-lg font-light">
            Company / Blogs & News
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
