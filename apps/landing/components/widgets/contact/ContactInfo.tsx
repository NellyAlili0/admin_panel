

function ContactInfo() {
  return (
    <div className="py-12 my-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight  sm:text-4xl text-center">
            Contact Us
          </p>
          <p className="mt-4 max-w-2xl text-base text-gray-500 lg:mx-auto text-center">
            Here are some of the ways that you can get in touch with us
          </p>
        </div>
        <div className="mt-10">
          <div className="flex flex-wrap gap-10 items-center justify-evenly">
            <div className="flex h-32 w-80 shadow border border-gray-200 pl-4 md:pl-0 items-center justify-start md:justify-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md  text-white">
                  <img src={"/assets/contact/contact-icons/call.png"} alt="" />
                </div>
              </div>
              <dl className="ml-4">
                <dt className="text-sm leading-6 font-light  text-gray-900">
                  Phone number
                </dt>
                <dd className="mt-2 text-base font-medium">
                  <a href={`tel:0741843358`} className="hover:underline">
                    +254115545173
                  </a>
                </dd>
              </dl>
            </div>
            <div className="flex h-32 w-80 shadow border border-gray-200 pl-4 md:pl-0 items-center justify-start md:justify-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md text-white">
                  <img src={"/assets/contact/contact-icons/email.png"} alt="" />
                </div>
              </div>
              <dl className="ml-4">
                <dt className="text-sm leading-6 font-light text-gray-900">
                  Email
                </dt>
                <dd className="mt-2 text-base font-medium">
                  <a
                    href="mailto:info@zidallie.co.ke"
                    className="hover:underline"
                  >
                    info@zidallie.co.ke
                  </a>
                </dd>
              </dl>
            </div>
            <div className="flex h-32 w-80 shadow pl-4 border border-gray-200 md:pl-0 items-center justify-start md:justify-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md  text-white">
                  <img src={"/assets/contact/contact-icons/location.png"} alt="" />
                </div>
              </div>
              <dl className="ml-4">
                <dt className="text-sm leading-6 font-light text-gray-900">
                  Visit Us At
                </dt>
                <dd className="mt-2 text-base font-medium">
                  <a
                    href="https://www.google.com/maps/place/'@iBizAfrica'/@-1.3101583,36.8106687,17z/data=!3m1!4b1!4m6!3m5!1s0x182f10f7e95364ed:0xde53f214e47a1069!8m2!3d-1.3101583!4d36.8132436!16s%2Fg%2F1yg4v7gh1?entry=ttu&g_ep=EgoyMDI0MDkyMy4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    iBiz Africa, Strathmore
                    <br />
                    University Keri Road,
                    <br />
                    Nairobi Kenya
                  </a>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactInfo;
