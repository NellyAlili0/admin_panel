
function MissionVission() {
  return (
    <section className="container mx-auto space-y-6 py-8 md:py-12 lg:py-20 max-w-6xl">
      <div className="w-full flex items-center gap-10  flex-wrap justify-center">
        <div className="relative w-80 overflow-hidden rounded-lg select-none shadow-md hover:shadow hover:shadow-primary p-4 border border-gray-200">
          <div className="flex h-auto flex-col justify-between rounded-md py-6 px-2">
            <section className="w-full flex justify-center items-center mb-4 h-24">
              <img src={"/assets/about/mission.png"} alt="Service 1" className="h-auto" />
            </section>
            <div className=" flex items-center justify-center flex-col">
              <h3 className="font-semibold mb-5">Our Mission</h3>
              <p className="text-sm text-text-muted text-center leading-7">
                Our mission is to empower young minds by ensuring safe &
                reliable student transportation is accessible for all.
              </p>
            </div>
          </div>
        </div>
        <div className="relative w-80 overflow-hidden rounded-lg select-none shadow-md hover:shadow hover:shadow-primary p-4 border border-gray-200">
          <div className="flex h-auto flex-col justify-between rounded-md py-12 px-2">
            <section className="w-full flex justify-center items-center mb-4 h-24">
              <img src={"/assets/about/vision.png"} alt="Service 1" className="h-auto" />
            </section>
            <div className=" flex items-center justify-center flex-col">
              <h3 className="font-semibold mb-5">Our Vision</h3>
              <p className="text-sm text-text-muted text-center leading-7">
                We Aspire To Be The Safest Transportation Platform For Students.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MissionVission;
