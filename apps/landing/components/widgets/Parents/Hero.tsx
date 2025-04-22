

function Hero() {
  return (
    <section
      className="relative w-full h-auto bg-cover bg-center pt-20  pb-16 bg-black mt-10"
      style={{ backgroundImage: `url("/assets/parents/parents-hero.jpeg")` }}
    >
      {/* dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black opacity-50 pointer-events-none "></div>{" "}
      <div className="relative  flex items-center justify-start h-full px-6 sm:px-12 md:px-20 ">
        <div className="max-w-2xl text-white">
          <h1 className="text-3xl md:text-5xl font-semibold mb-4 md:mb-6">
            <span className="block">We Ensure Peace Of </span>
            <span className="block my-2">Mind For Parents</span>
          </h1>
          <p className="text-base md:text-lg mb-8 font-light">
            At Zidallie, your child’s safety and comfort come first. Our
            professional drivers and well-maintained vehicles ensure a secure
            journey, while real-time tracking keeps you updated every step of
            the way. We make school transport seamless and stress-free—so you
            can have complete peace of mind.
          </p>
          <div className="flex space-x-4 ">
            {/* <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeh2xXD5KIM8t9bIaY6IyVHV5ZW3LT1NkGxnTGO8mh7q8XO1A/viewform"
              target="_blank"
              className="bg-transparent border text-white font-normal py-3 px-2 md:px-6 rounded-lg z-10 text-xs md:text-base "
            >
              Get The App
            </a> */}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfkRSgEHgsINzWOs-7-Ii4Tf_ZeCabRdxHAqP4joVh_eEi8pw/viewform"
              target="_blank"
              className="bg-primary text-white font-normal py-3 px-2 md:px-6 rounded-lg z-10 text-xs md:text-base "
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
