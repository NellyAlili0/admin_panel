

function Services() {
  const services = [
    [
      {
        heading: "Real-Time Tracking:",
        text: "Parents can track their child’s bus in real time, knowing its exact location and estimated arrival time.",
      },
      {
        heading: "Safety Features:",
        text: "Zidallie prioritizes safety with features like driver monitoring, emergency alerts, and secure boarding processes.",
      },
      {
        heading: "Communication Tools:",
        text: "Parents receive notifications about bus delays, route changes, and other important updates.",
      },
      {
        heading: "Efficiency:",
        text: "Zidallie’s optimized routes and scheduling ensure timely and efficient transportation for students.",
      },
    ],
    [
      {
        heading: "Experienced Drivers:",
        text: "Our drivers are experienced professionals who undergo thorough training to ensure safe and efficient driving practices.",
      },
      {
        heading: "Attentive Attendants:",
        text: " Our attendants are trained to provide assistance to students with special needs, ensuring their safety and comfort during the journey.",
      },
      {
        heading: "Responsive Customer Service:",
        text: "Our customer service team is trained to provide prompt and helpful assistance, ensuring that parents and schools have a positive experience with our service.",
      },
    ],
  ];

  return (
    <div className="max-w-7xl mx-auto my-16">
      {/* Section 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
        {/* Background Image */}
        <div
          className="h-[400px] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("/assets/parents/apps.png")` }}
        ></div>

        {/* Text */}
        <div className="flex flex-col justify-center px-2 lg:px-12 min-h-[400px] ">
          <h3 className="font-bold text-xl sm:text-2xl text-primary text-center md:text-left">
            1. App for Peace of Mind
          </h3>
          <ul className="list-disc ml-6 mt-5 text-sm text-gray-700">
            {services[0].map((item, index) => (
              <li className="my-3 leading-6" key={index}>
                <span className="font-bold">{item.heading}</span> {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 mt-12 md:mt-20">
        {/* Background Image with `bg-top` - Comes first on mobile */}
        <div
          className="h-[400px] bg-cover bg-top bg-no-repeat md:order-last"
          style={{ backgroundImage: `url("/assets/parents/trainers.jpg")` }}
        ></div>

        {/* Text */}
        <div className="flex flex-col justify-center px-2 lg:px-12 min-h-[400px]">
          <h3 className="font-bold text-xl sm:text-2xl text-primary text-center md:text-left">
            2. Well Trained Personnel
          </h3>
          <ul className="list-disc ml-6 mt-5 text-sm text-gray-700">
            {services[1].map((item, index) => (
              <li className="my-3 leading-6" key={index}>
                <span className="font-bold">{item.heading}</span> {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Services;
