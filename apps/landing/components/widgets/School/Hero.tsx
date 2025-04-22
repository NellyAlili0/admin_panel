

function Hero() {
  return (
    <section
      className="relative w-full h-auto bg-cover bg-center pt-20 pb-16 bg-black mt-10"
      style={{ backgroundImage: `url("/assets/schools/school-hero.jpeg")` }}
    >
      {/* dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black opacity-50 pointer-events-none "></div>{" "}
      <div className="relative  flex items-center justify-start h-full px-6 sm:px-12 md:px-20 ">
        <div className="max-w-2xl text-white">
          <h1 className="text-3xl md:text-5xl font-semibold mb-4 md:mb-6">
            <span className="inline md:block mr-2 md:mr-0">
              Simplifying School
            </span>
            <span className="inline md:block md:my-2">
              Transport Management
            </span>
          </h1>
          <p className="text-base md:text-lg mb-8 font-light">
            We handle school transport, so you don’t have to. Our service
            removes the burden of managing transport logistics, allowing schools
            to focus entirely on education. With safe, reliable, and efficient
            transportation, including well-maintained buses, professional
            drivers, and real-time tracking, we ensure peace of mind for both
            administrators and parents. Partner with us to streamline operations
            and create a smoother school transport experience.
          </p>
          <div className="flex space-x-4 ">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeh2xXD5KIM8t9bIaY6IyVHV5ZW3LT1NkGxnTGO8mh7q8XO1A/viewform"
              target="_blank"
              className="bg-primary text-white font-normal py-3 px-2 md:px-6 rounded-lg z-10 text-xs md:text-base "
            >
              School Sign Up
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
