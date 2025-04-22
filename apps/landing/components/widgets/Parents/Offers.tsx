

function Offers() {
  return (
    <section
      id="features"
      className="container mx-auto space-y-6 py-4 max-w-6xl mt-10"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-10">
        <div className="w-16  h-[1px] bg-black my-8"></div>
        <h2 className="font-semibold text-3xl  leading-14">What We Offer</h2>
        <p className="max-w-[95%] leading-normal text-text-muted sm:leading-7 text-sm ">
          We understand the importance of safety, reliability, and convenience
          when it comes to your child’s transportation. Whether you need
          real-time tracking, transparent communication, or flexible scheduling
          options, Zidallie’s approach ensures that your child’s transportation
          needs are met with care and precision.
        </p>
      </div>
      {/* <div className="w-full flex items-center gap-10  flex-wrap justify-center">
        <div className="relative w-80 overflow-hidden rounded-lg select-none shadow-md hover:shadow hover:shadow-primary p-4">
          <div className="flex h-auto flex-col justify-between rounded-md py-6 px-2">
            <section className="w-full flex justify-center items-center mb-4 h-24">
              <img src={Image1} alt="Service 1" className="h-auto" />
            </section>
            <div className=" flex items-center justify-center flex-col">
              <h3 className="font-bold">App for peace of Mind</h3>
              <div className="w-16  h-[0.5px] bg-black my-8"></div>
              <p className="text-sm text-text-muted text-center leading-7">
                Track your child’s bus in real-time and get instant alerts for
                pickups, drop-offs, and delays — all in one app designed to keep
                you informed and reassured.
              </p>
            </div>
          </div>
        </div>
        <div className="relative w-80 overflow-hidden rounded-lg select-none shadow-md hover:shadow hover:shadow-primary p-4">
          <div className="flex h-auto flex-col justify-between rounded-md py-6 px-2">
            <section className="w-full flex justify-center items-center mb-4 h-24">
              <img src={Image2} alt="Service 1" className="h-auto" />
            </section>
            <div className=" flex items-center justify-center flex-col">
              <h3 className="font-bold">Well Trained Personnel</h3>
              <div className="w-16 h-[0.5px] bg-black my-8"></div>
              <p className="text-sm text-text-muted text-center leading-7">
                Our trained drivers and attendants ensure safe, reliable, and
                friendly transport for every child, giving parents and schools
                total peace of mind.
              </p>
            </div>
          </div>
        </div>
      </div> */}
    </section>
  );
}

export default Offers;
