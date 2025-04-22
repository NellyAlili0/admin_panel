import React from "react";
import { team } from "@/lib/data";
import { FaLinkedin, FaFacebook } from "react-icons/fa"; // Import icons for LinkedIn and Twitter

function Team() {
  return (
    <section id="our-team" className="my-20 py-8  px-5 bg-about-bg">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <div className="w-16  h-[2px] bg-black my-5"></div>

        <h2 className="text-3xl font-bold text-center py-10">Meet The Team</h2>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {team.map((person, index) => (
            <div
              key={index}
              className=" text-center w-60 h-60 flex flex-col items-center justify-center"
            >
              {/* Circular Image */}
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                <img
                  src={person.image}
                  alt={`Team Member ${index + 1}`}
                  className="rounded-full w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-1">{person.name}</h3>
                <p className="text-gray-700 text-sm my-3">{person.title}</p>
              </div>

              {/* Social Icons */}
              <div className="flex justify-center gap-4 mt-2">
                {person.social?.linkedin && (
                  <a
                    href={person.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin className="text-icon " size={20} />
                  </a>
                )}
                {person.social?.facebook && (
                  <a
                    href={person.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook className="text-icon" size={20} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Team;
