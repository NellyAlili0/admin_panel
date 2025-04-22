

function Tours() {
  return (
    <section className=" my-20 w-full  flex items-center justify-center">
      <section className="max-w-7xl bg-gray-100">
        <div className="w-full ">
          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-4 ">
            {/* Text Content */}
            <div className="flex flex-col justify-center py-3 px-4 md:px-6 xl:px-8 bg-gray-100 min-h-[400px]">
              <div className="w-16 h-[2px] bg-primary my-8"></div>
              <h2 className="text-3xl font-semibold text-primary sm:text-4xl">
                Hire Zidallie Tour Vehicles
              </h2>
              <p className="mt-4 text-gray-600 text-sm leading-8">
                Need reliable transport for school field trips, short-term
                leases, staff transfers, or other tour activities? Zidallie has
                you covered. We organize safe, educational, and fun-filled
                excursions for students of all ages. Our dedicated team ensures
                every trip aligns with learning objectives, offering unique
                experiences that inspire and engage young minds. Whether it’s a
                day trip to a museum or an adventure to a national park, we
                handle all the logistics—so you can focus on the joy of
                discovery.
              </p>
            </div>

            {/* Image */}
            <div
              className="relative min-h-[400px] w-full bg-cover bg-center bg-gray-300"
              style={{ backgroundImage: `url("/assets/schools/tour-bus-image.jpg")` }}
            >
              <img
                src={"/assets/schools/tour-bus-image.jpg"}
                alt="Tour Bus"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Tours;
