

function Hero() {
  return (
    <section
      className="relative w-full h-auto bg-cover bg-top pt-20 pb-10 md:pb-16 bg-black mt-10"
      style={{ backgroundImage: `url("/assets/about/about-hero-min.jpeg")` }}
    >
      {/* dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black opacity-50 pointer-events-none "></div>{" "}
      <div className="relative  flex items-center justify-start h-full px-2 sm:px-12 md:px-20 ">
        <div className="max-w-2xl text-white">
          <h1 className="text-3xl md:text-5xl font-semibold mb-4 md:mb-6">
            About Our Company
          </h1>
          <p className="text-base  md:text-lg mb-10 font-light">
            At Zidallie, we provide safe and reliable school transport
            solutions, giving peace of mind to both parents and schools. We
            ensure every student’s transportation needs are met with care and
            professionalism.
          </p>
          <div className="py-4 ">
            <div className="flex items-center gap-10 flex-wrap justify-center md:justify-start">
              <div className="mb-5 text-center md:mb-0 border-r-2 pr-5">
                <div className="font-heading text-[2rem] font-semibold dark:text-white lg:text-4xl ">
                  🚍 100K+
                </div>
                <p className="text-sm font-medium tracking-widest pt-2 ">
                  Rides Completed
                </p>
              </div>
              <div className="mb-5 text-center md:mb-0 border-r-2  pr-5">
                <div className="font-heading text-[2rem] font-semibold dark:text-white lg:text-4xl">
                  🎒 10K+
                </div>
                <p className="text-sm font-medium tracking-widest pt-2 ">
                  Students Served
                </p>
              </div>
              <div className="mb-5 text-center md:mb-0 ">
                <div className="font-heading text-[2rem] font-semibold dark:text-white lg:text-4xl">
                  🏫 25+
                </div>
                <p className="text-sm font-medium tracking-widest pt-2">
                  Partner Schools
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
