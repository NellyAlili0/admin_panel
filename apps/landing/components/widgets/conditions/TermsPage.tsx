import React, { useEffect, useState } from "react";
import { termsAndConditions } from "@/lib/data";

const topics = [
  { id: 1, name: "Acceptance of Terms" },
  { id: 2, name: "Eligibility" },
  { id: 3, name: "Use of the Website" },
  { id: 4, name: "Intellectual Property Rights" },
  { id: 5, name: "User Accounts" },
  { id: 6, name: "Prohibited Activities" },
  { id: 7, name: "Privacy Policy" },
  { id: 8, name: "Third-Party Links and Services" },
  { id: 9, name: "Limitation of Liability" },
  { id: 10, name: "Indemnification" },
  { id: 11, name: "Termination" },
  { id: 12, name: "Changes to the Terms" },
  { id: 13, name: "Governing Law" },
  { id: 14, name: "Contact Information" },
];

const TermsPage = ({ title, sections }) => {
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <div className="w-full py-10">
      <div className="max-w-7xl mx-auto  md:flex relative">
        {/* Sidebar - Hidden on mobile */}
        <aside className="hidden md:block w-1/4 p-4 sticky top-4 h-[calc(100vh-1rem)] overflow-y-auto">
          <h2 className="font-semibold text-lg text-gray-700 mb-4">{title}</h2>

          <ul className="space-y-3 relative">
            <div className="absolute left-0 top-0 h-full w-1 bg-gray-200">
              <div
                className="bg-blue-600 transition-all duration-300 ease-in-out"
                style={{
                  height: `${((topics.findIndex((s) => s.id.toString() === activeSection) + 1) /
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
                  className={`text-sm block pl-4 ${activeSection === section.id.toString()
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
        <main className="w-full md:w-3/4 p-6">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800">
              Introduction
            </h2>
            <p className="mt-2 space-y-2 text-gray-700 text-sm leading-7">
              Welcome to Zidallie.co.ke! These Terms and Conditions govern your
              use of our website and any services provided by Zidallie. By
              accessing or using Zidallie.co.ke, you agree to comply with these
              Terms. If you disagree with any part of these Terms, please do not
              use our website.{" "}
            </p>
          </section>
          {termsAndConditions.map((section) => (
            <section id={section.id.toString()} key={section.id} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800">
                {section.topic}
              </h2>
              <p className="my-3 text-sm leading-7">{section?.description}</p>
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
        </main>
      </div>
    </div>
  );
};

export default TermsPage;
