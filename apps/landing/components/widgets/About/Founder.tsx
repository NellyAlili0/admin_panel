
function Founder() {
  return (
    <section className="my-10 shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch">
          {/* Image Container */}
          <div
            className="w-full lg:w-1/2 h-[350px] sm:h-[400px] lg:h-auto bg-cover bg-top rounded-tl-[50px] rounded-br-[50px] lg:rounded-tl-[135px] lg:rounded-br-[135px] rounded-lg"
            style={{
              backgroundImage: `url("/assets/about/founder.png")`,
            }}
          ></div>

          {/* Text Container */}
          <div className="w-full lg:w-1/2 lg:pl-6 flex flex-col justify-center p-1 md:p-6 min-h-[440px]">
            <div className="w-16 h-[1px] bg-black my-5"></div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 py-3">
              Founded with Learners in Mind
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-7 sm:leading-8">
              Our CEO, Nelly Alili, founded Zidallie to ensure safe, reliable,
              and accessible school transport for all students. Transportation
              challenges should never stand in the way of education, yet
              millions of learners struggle with unsafe or inconsistent options.
              <br />
              <br />
              📚 <strong>1 in 3 students</strong> face transportation barriers
              that affect school attendance. <br />
              🚍 <strong>Millions</strong> lack access to safe and dependable
              school transport.
              <br />
              <br />
              At Zidallie, we’re bridging this gap—making school commutes
              seamless and stress-free, so every child has the opportunity to
              learn and thrive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Founder;
