"use client";

import React, { useEffect, useState } from "react";
import { privacyPolicy } from "@/lib/data";

const topics = [
  { id: 1, name: "Information We Collect" },
  { id: 2, name: "How We Use Your Information" },
  { id: 3, name: "Sharing Your Information" },
  { id: 4, name: "Your Choices" },
  { id: 5, name: "Security" },
  { id: 6, name: "Third-Party Links" },
  { id: 7, name: "Changes to This Privacy Policy" },
  { id: 8, name: "Contact Us" },
];

const PrivacyPage = ({ title, sections }) => {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      let currentSection = "";

      topics.forEach((section) => {
        const element = document.getElementById(section.id.toString());
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentSection = section.id.toString();
          }
        }
      });

      setActiveSection(currentSection);
    };

    // window.addEventListener("scroll", handleScroll);
    // return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <div className="w-full py-10 leading-8">
      <div className="max-w-7xl mx-auto  md:flex">
        {/* Sidebar - Hidden on mobile */}
        <aside className="hidden md:block w-1/4 p-4 sticky top-4 h-[calc(100vh-1rem)] overflow-y-auto">
          <h2 className="font-semibold text-lg text-gray-700 mb-4">{title}</h2>

          <ul className="space-y-3 relative">
            <div className="absolute left-0 top-0 h-full w-1 bg-gray-200">
              <div
                className="bg-blue-600 transition-all duration-300 ease-in-out"
                style={{
                  height: `${
                    ((topics.findIndex((s) => s.id.toString() === activeSection) + 1) /
                      topics.length) *
                    100
                  }%`,
                }}
              ></div>
            </div>

            {topics.map((section) => (
              <li key={section.id} className="my-8">
                <a
                  href={`#${section.id}`}
                  className={`text-sm block pl-4 ${
                    activeSection === section.id.toString()
                      ? "text-blue-600 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {section.name}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="w-full md:w-3/4 p-6 ">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800">
              Introduction
            </h2>
            <p className="mt-2 space-y-2 text-gray-700 text-sm  leading-7">
              At Zidallie.co.ke, we are committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and share your
              personal information when you visit our website or use our
              services. By using zidallie.co.ke, you agree to the terms outlined
              in this Privacy Policy.
            </p>
          </section>
          {privacyPolicy.map((section) => (
            <section id={section.id.toString()} key={section.id} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800">
                {section.topic}
              </h2>
              <p className="text-sm my-3 leading-7">{section?.description}</p>
              {section?.list && (
                <ul className="list-disc ml-6 mt-2 space-y-2 text-gray-700">
                  {section.list.map((point, index) => (
                    <li key={index} className="text-sm leading-7">
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <p className="text-sm">
            By using Zidallie.co.ke, you agree to the terms outlined in this
            Privacy Policy.
          </p>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPage;
