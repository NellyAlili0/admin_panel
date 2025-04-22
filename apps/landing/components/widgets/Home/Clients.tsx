

function Clients() {
  const clients = [
    { image: "/assets/Home/top-clients/stepping-stone.jpeg", link: "https://steppingstones.sc.ke/" },
    { image: "/assets/Home/top-clients/center-for-inclusive-practice.png", link: "https://centreforinclusivepractice.com/" },
    {
      image: "/assets/Home/top-clients/victoria-kids.jpg",
      link: "https://goshule.com/school?name=Victoria%20Kids%20Care,Thome",
    },
    { image: "/assets/Home/top-clients/noble-gate.jpg", link: "https://noblegate.org/" },
    { image: "/assets/Home/top-clients/high-ridge.jpg", link: "https://highridgeschool.sc.ke/" },
  ];
  return (
    <div className="bg-white w-full px-4 pt-16 pb-16 my-2 md:my-10">
      <h2 className="text-4xl font-semibold text-center mb-10">
        Our Top Clients
      </h2>

      <div className="mx-auto w-full max-w-4xl bg-white flex justify-center items-center gap-10 flex-wrap md:flex-nowrap">
        {clients.map((client, index) => (
          <section
            className="shadow-md p-2 border border-gray-200 "
            key={index}
          >
            <a target="_blank" href={client.link}>
              <img alt="" className="h-28 mx-auto" src={client.image} />
            </a>
          </section>
        ))}
      </div>
    </div>
  );
}

export default Clients;
