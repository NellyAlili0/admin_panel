

function Statistics() {
  return (
    <section className="-mt-12 md:-mt-20">
      <div className="relative max-w-screen-xl md:px-4 mx-auto sm:px-6 lg:px-8 ">
        <div className="max-w-4xl mx-auto">
          <dl className=" bg-statistics rounded-lg shadow-lg grid grid-cols-3 py-2 sm:p-4  md:p-6">
            <div className="flex flex-col p-2 md:p-4 text-center  border-gray-700 sm:border-0 sm:border-r">
              <dt
                className="order-2 mt-2 text-xs sm:text-sm md:text-base  font-medium leading-6 text-statistics-text"
                id="item-1"
              >
                Rides
              </dt>
              <dd
                className="order-1 text-2xl sm:text-3xl md:text-5xl font-extrabold leading-none text-statistics-text"
                aria-describedby="item-1"
                id="starsCount"
              >
                100K+{" "}
              </dd>
            </div>
            <div className="flex flex-col p-2  md:p-4 text-center  border-gray-700 sm:border-0 border-l border-r">
              <dt className="order-2 mt-2 text-xs sm:text-sm md:text-base  font-medium leading-6 text-statistics-text">
                Students
              </dt>
              <dd
                className="order-1 text-2xl sm:text-3xl md:text-5xl font-extrabold leading-none text-statistics-text"
                id="downloadsCount"
              >
                10K+
              </dd>
            </div>
            <div className="flex flex-col p-2 md:p-4 text-center  border-statistics-text sm:border-0 sm:border-l">
              <dt className="order-2 mt-2 text-xs sm:text-sm md:text-base  font-medium leading-6 text-statistics-text">
                Schools
              </dt>
              <dd
                className="order-1  text-2xl sm:text-3xl md:text-5xl font-extrabold leading-none text-statistics-text"
                id="sponsorsCount"
              >
                25+
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export default Statistics;
