
function Hero() {
  return (
    <section
      className="relative w-full h-auto bg-cover bg-center pt-20 pb-28 md:pb-48 bg-black mt-10"
      style={{ backgroundImage: `url("/assets/Home/hero-image.jpeg")` }}
    >
      {/* dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black  opacity-50 pointer-events-none "></div>{" "}
      {/* adding a shadow at the hero section */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
      <div className="relative  flex items-center justify-start h-full px-6 sm:px-12 md:px-20 ">
        <div className="max-w-2xl text-white">
          <h1 className="text-[27px] md:text-5xl font-semibold  mb-4 leading-10 md:leading-14">
            <span className="block">Safe & Reliable School</span>
            <span className="block">Transportation Services</span>
          </h1>
          <p className="text-base md:text-lg mb-8 font-light">
            At Zidallie, we provide safe & reliable school transportation
            services, ensuring peace of mind for parents and seamless logistics
            for schools. Our service guarantees a secure and smooth journey for
            students to and from school every day.
          </p>
          <div className="flex space-x-4 ">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeh2xXD5KIM8t9bIaY6IyVHV5ZW3LT1NkGxnTGO8mh7q8XO1A/viewform"
              target="_blank"
              className="bg-primary text-white font-normal py-3 px-2 md:px-6 rounded-lg z-10 text-xs md:text-base "
            >
              School Sign Up
            </a>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfkRSgEHgsINzWOs-7-Ii4Tf_ZeCabRdxHAqP4joVh_eEi8pw/viewform"
              target="_blank"
              className="bg-transparent border text-white font-normal py-3 px-2 md:px-6 rounded-lg z-10 text-xs md:text-base "
            >
              Parents Sign Up
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
