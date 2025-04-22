"use client"

import React, { useState, useRef, useEffect } from "react";

const Testimonials = ({ testimonialsData, isMobile }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const cardWidth = 300; // Adjust based on actual card width
  const gap = 16; // Space between cards

  // Set visible cards based on screen size
  const visibleCards = isMobile ? 1 : 3;

  const totalVisibleWidth = cardWidth * visibleCards + gap * (visibleCards - 1);
  const scrollAmount = cardWidth + gap; // each step scrolls one card's width

  // Scroll logic
  const handleNext = () => {
    if (currentIndex < testimonialsData.length - visibleCards) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const offset = currentIndex * scrollAmount;
      // containerRef.current.style.transform = `translateX(-${offset}px)`;
    }
  }, [currentIndex, scrollAmount]);

  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12 relative">
        <section className="flex items-center justify-center md:justify-between mb-8 flex-wrap">
          <h1 className=" text-xl md:text-2xl font-semibold text-gray-800 text-center ml-5">
            What Schools and Parents Are Saying About Us
          </h1>
          <section className="md:mr-20 mt-5 md:mt-0">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`text-white p-2 rounded-full ${
                currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <img src={"/assets/Home/left-arrow.png"} alt="left arrow" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= testimonialsData.length - visibleCards}
              className={`text-white p-2 rounded-full ${
                currentIndex >= testimonialsData.length - visibleCards
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <img src={"/assets/Home/right-arrow.png"} alt="right arrow" />
            </button>
          </section>
        </section>

        <div className="relative overflow-hidden">
          <div className="flex items-center">
            <div
              className="w-full"
              style={{
                maxWidth: `${totalVisibleWidth}px`,
              }}
            >
              <div
                ref={containerRef}
                className="flex space-x-4 transition-transform duration-500 ease-in-out"
                style={{ paddingLeft: currentIndex > 0 ? `${gap}px` : "0" }}
              >
                {testimonialsData.map((testimonial, index) => (
                  <div
                    key={index}
                    className="shrink-0 bg-gray-100 p-6 rounded-2xl"
                    style={{ width: `${cardWidth}px`, flex: "0 0 auto" }}
                  >
                    <h3 className="mb-3 text-sm text-text-muted font-semibold">
                      {testimonial.heading}
                    </h3>
                    <p className="text-gray-900 text-xs mb-4 leading-7">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {testimonial.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
