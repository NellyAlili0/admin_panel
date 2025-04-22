"use client"

import ReactPlayer from "react-player";

function OurStory() {
  return (
    <section className="my-10 max-w-6xl mx-auto p-4 md:p-12">
      <h1 className="tracking-tight  font-semibold text-2xl md:text-3xl text-center">
        Our Story
      </h1>
      <p className="text-center my-5 text-sm">Why and How Zidallie Started</p>

      <div className="flex items-center justify-center mt-5 ">
        <div className="shadow-lg bg-white w-full md:w-3/4 rounded-2xl overflow-hidden">
          <ReactPlayer
            url={"/assets/videos/About-Zidallie-Video.mp4"}
            className="react-player"
            controls
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </section>
  );
}

export default OurStory;
