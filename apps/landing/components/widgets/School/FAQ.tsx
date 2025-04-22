"use client";
import { useState } from "react";
import { schools_faq } from "@/lib/data";

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="pt-10 pb-20  sm:pt-16 bg-gray-100 md:pb-28 -mb-32"
      id="school-FAQS"
    >
      <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col items-center">
          <h2 className="mt-5 text-center text-xl font-semibold tracking-tight md:text-4xl text-primary">
            Frequently asked questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto mt-8 space-y-4 md:mt-16">
          {schools_faq.map((item, index) => (
            <div
              key={item.question}
              className="rounded-lg transition-all duration-200 bg-white border border-gray-200 shadow-lg cursor-pointer hover:bg-gray-50"
            >
              <button
                type="button"
                onClick={() => handleOpen(index)}
                className="flex items-start md:items-center justify-between w-full px-4 py-5 sm:p-6"
              >
                <span className="flex text-xs md:text-sm font-semibold text-black text-left">
                  {item.question}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                style={{ display: openIndex === index ? "block" : "none" }}
                className="px-4 pb-5 sm:px-6 sm:pb-6"
              >
                <p className="text-xs md:text-sm leading-7">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
