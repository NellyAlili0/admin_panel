

function Hero() {
  const getGradient = () => {
    // Basic responsive check
    if (window.innerWidth < 640) {
      // Mobile
      return "linear-gradient(to right, #add8e6 0%, #add8e6 60%, transparent 90%, transparent 100%)";
    } else if (window.innerWidth < 1024) {
      // Tablet
      return "linear-gradient(to right, #add8e6 0%, #add8e6 40%, transparent 80%, transparent 100%)";
    } else {
      // Desktop
      return "linear-gradient(to right, #add8e6 0%, #add8e6 20%, transparent 50%, transparent 100%)";
    }
  };

  return (
    <section
      className="relative w-full h-auto bg-cover bg-center pt-20 pb-12 bg-contact-bg mt-10"
      style={{ backgroundImage: `url("/assets/contact/contact-hero.jpeg")` }}
    >
      {/* Gradient overlay - fully black on left, fades to transparent on right */}
      {/* <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-overlay to-transparent"></div> */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: getGradient(),
        }}
      ></div>

      {/* Text content */}
      <div className="relative flex items-center justify-start h-full px-6 sm:px-12 md:px-20">
        <div className="max-w-2xl ">
          <h1 className="text-3xl md:text-5xl font-semibold mb-6 text-contact">
            <span className="block">Safe and Reliable</span>
            <span className="block my-2">Student</span>
            <span className="block">Transportation</span>
          </h1>
          <p className="text-base mb-8 font-light max-w-md leading-7 text-contact-text">
            At Zidallie, we provide safe and reliable transportation solutions
            tailored for Primary School students, giving parents and schools
            peace of mind. Our service is designed to ensure a secure,
            comfortable, and timely journey for young learners every day.
          </p>
          <div className="flex space-x-4">
            <a
              href={`https://wa.me/254115545173`}
              target="__blank"
              className="bg-primary text-white font-normal py-3 px-2 md:px-6 rounded-lg z-10 text-xs md:text-base"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
