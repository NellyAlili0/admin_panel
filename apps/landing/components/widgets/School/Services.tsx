

function Services() {
  const services = [
    [
      "Flexible fleet sizes to accommodate varying passenger loads",
      "Efficient routes for optimized travel times and reduced costs",
      "Perfect for field trips, after-school activities, and special education transportation",
    ],
    [
      "Real-time tracking of buses and students for improved safety and security",
      "Automated route optimization to reduce fuel costs and minimize travel time",
      "Parent communication tools for bus tracking and notifications",
      "Maintenance scheduling and tracking to ensure buses are always in top condition",
      "Customizable reporting features for better fleet management",
      "Integration with existing school systems for seamless operations.",
    ],
  ];
  return (
    <div className="text-center w-full my-16 flex items-center justify-center flex-col">
      <div className="flex flex-wrap md:items-center mt-1 text-center mb-20">
        <div className="w-full md:w-1/2 px-4">
          <img
            src={"/assets/schools/versatile-fleet.png"}
            alt="gem"
            className="rounded object-scale-down  max-h-[480px] "
          />
        </div>
        <div className="w-full md:w-1/2 px-4  text-left lg:pl-12">
          <h3 className="font-semibold mt-8 text-xl md:mt-0 sm:text-2xl text-center">
            1. We provide a Versatile Fleet
          </h3>
          {/* <p className="text-base mt-6 ">{services[0].content}</p> */}
          <ul className="list-disc ml-8 mt-5">
            {services[0].map((item) => (
              <li className="my-4 leading-12 text-sm" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap items-center mt-20 text-center">
        <div className="w-full md:w-3/5 lg:w-1/2 px-4">
          <img
            src={"/assets/schools/management-system.png"}
            alt="project members"
            className="rounded object-scale-down  max-h-[480px]"
          />
        </div>
        <div className="w-full md:w-2/5 lg:w-1/2 px-4 md:order-first text-left lg:pr-12">
          <h3 className="font-semibold mt-8 text-xl md:mt-0 sm:text-2xl text-center">
            2. Zidallie’s School Bus Management System
          </h3>
          {/* <p className="text-base mt-6">{services[1].content}</p> */}
          <ul className="list-disc ml-8 mt-5 text-sm">
            {services[1].map((item) => (
              <li className="my-2 leading-8" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Services;
