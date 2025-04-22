

function Offers() {
  return (
    <section
      id="features"
      className="container mx-auto space-y-6 py-12 max-w-6xl"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-2 text-center mb-20">
        <div className="w-16  h-[1px] bg-black my-8"></div>
        <h2 className="font-semibold text-3xl  leading-14">What We Offer</h2>
        <p className="max-w-[95%] leading-normal text-text-muted sm:leading-7 text-sm ">
          We understand that every school has unique school transport needs.
          That’s why we provide customized solutions, including right-sized
          vehicles and transport management software, to fit your specific
          requirements. Our goal is to make school transport management easy and
          efficient, so you can focus on what matters most—educating your
          students.
        </p>
      </div>
      <div className="w-full flex items-center gap-10  flex-wrap justify-center">
        <div className="relative w-80 overflow-hidden rounded-lg select-none shadow-md hover:shadow hover:shadow-primary p-4">
          <div className="flex h-auto flex-col justify-between rounded-md py-6 px-2">
            <section className="w-full flex justify-center items-center mb-4 h-24">
              <img src={"/assets/schools/fleet.png"} alt="Service 1" className="h-auto" />
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
        <div className="relative w-80 overflow-hidden rounded-lg select-none shadow-md hover:shadow hover:shadow-primary p-4">
          <div className="flex h-auto flex-col justify-between rounded-md py-6 px-2">
            <section className="w-full flex justify-center items-center mb-4 h-24">
              <img src={"/assets/schools/school.png"} alt="Service 1" className="h-auto" />
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
      </div>
    </section>
  );
}

export default Offers;
