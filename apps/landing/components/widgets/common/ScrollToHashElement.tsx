"use client"

import { useEffect } from "react";

function ScrollToHashElement() {
  const hash = window.location.hash.replace("#", "");

  useEffect(() => {
    console.log(hash);

    const scrollToElement = () => {
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    scrollToElement(); // Run on initial load (if there's a hash in URL)
    window.addEventListener("hashchange", scrollToElement); // Run when hash changes

    return () => {
      window.removeEventListener("hashchange", scrollToElement);
    };
  }, [hash]);

  return null; // This component only handles behavior, it doesn't render anything
}

export default ScrollToHashElement;
