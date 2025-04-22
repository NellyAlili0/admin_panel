
function OurFleet() {
  const buses = ["/assets/schools/bus-1.png", "/assets/schools/bus-2.png", "/assets/schools/bus-3.png"];
  return (
    <section className="w-full flex items-center justify-center flex-col mb-16 px-2">
      <div className="max-w-7xl mx-auto">
        <h3 className="font-bold text-3xl  sm:text-4xl text-center  mb-2">
          Our Fleet
        </h3>
        <p className="pb-10">Some of the vehicles in our fleet...</p>
        <div className="flex gap-5 items-center justify-center flex-wrap w-full">
          {buses.map((image, index) => (
            <section className="" key={index}>
              <img
                alt={`image-bus-${index}`}
                className="object-cover rounded-lg h-60 w-96"
                src={image}
              />
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OurFleet;
