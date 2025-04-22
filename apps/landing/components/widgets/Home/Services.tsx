

function Services() {
  return (
    <section
      id="features"
      className="container mx-auto space-y-6 py-8 md:py-12 lg:py-20 max-w-6xl"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-2 text-center mb-20">
        <div className="w-16  h-[1px] bg-black my-8"></div>
        <h2 className="font-semibold text-3xl  leading-14">Why Choose Us</h2>
        <p className="max-w-[85%] leading-normal text-text-muted sm:leading-7 text-sm ">
          Our mission is to empower young minds by providing safe, reliable, and
          exclusive <span className="font-bold">school transport</span>. We’ve
          seen firsthand how the lack of dependable{" "}
          <span className="font-bold">school transport</span> can hinder
          education and limit access to opportunities, and we’re committed to
          bridging that gap.
        </p>
      </div>
      <div className="w-full flex items-center gap-3 md:justify-between flex-wrap justify-center">
        <div className="relative w-80 overflow-hidden rounded-lg select-none shadow-md border border-gray-100 hover:shadow hover:shadow-primary p-4">
          <div className="flex h-auto flex-col justify-between rounded-md py-6 px-2">
            <section className="w-full flex justify-center items-center mb-4 h-24">
              <img src={"/assets/Home/services_safety.png"} alt="Service 1" className="h-auto" />
            </section>
            <div className=" flex items-center justify-center flex-col">
              <h3 className="font-semibold">Technology Integration</h3>
              <div className="w-16  h-[0.5px] bg-black my-8"></div>
              <p className="text-sm text-text-muted text-center leading-7">
                We enhance student transportation with real-time tracking for
                parents and advanced routing software for efficiency and
                sustainability.
              </p>
            </div>
          </div>
        </div>
        <div className="relative w-80 overflow-hidden rounded-lg select-none shadow-md border border-gray-100 hover:shadow hover:shadow-primary p-4">
          <div className="flex h-auto flex-col justify-between rounded-md py-6 px-2">
            <section className="w-full flex justify-center items-center mb-4 h-24">
              <img src={"/assets/Home/services_technology.png"} alt="Service 1" className="h-auto" />
            </section>
            <div className=" flex items-center justify-center flex-col">
              <h3 className="font-semibold">Customized Solutions</h3>
              <div className="w-16 h-[0.5px] bg-black my-8"></div>
              <p className="text-sm text-text-muted text-center leading-7">
                We provide customized transportation solutions, tailoring routes
                and assistance to meet the unique needs of schools, students,
                and parents.
              </p>
            </div>
          </div>
        </div>
        <div className="relative w-80 overflow-hidden rounded-lg select-none shadow-md border border-gray-100 hover:shadow hover:shadow-primary p-4">
          <div className="flex h-auto flex-col justify-between rounded-md py-6 px-2">
            <section className="w-full flex justify-center items-center mb-4 h-24">
              <img src={"/assets/Home/services_safety.png"} alt="Service 1" className="h-auto" />
            </section>
            <div className=" flex items-center justify-center flex-col">
              <h3 className="font-semibold">Safety Priority</h3>
              <div className="w-16  h-[0.5px] bg-black my-8"></div>
              <p className="text-sm text-text-muted text-center leading-7">
                Safety is our core value, ensuring every student’s journey is
                secure through advanced technology and rigorous driver training.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;
