"use client"

import React, { useState } from "react";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);

    const url =
      "https://script.google.com/macros/s/AKfycbyzFZqHeAIdLlO9YGcVYQfWjIFPNdNeaPP7WfyYmIgaXq1wkU-kQoRNy4OSYpI597k_/exec";

    try {
      const date = new Date();
      const dateString = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`;

      const data = {
        date: dateString,
        email: email,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Specify content type
        },
        body: new URLSearchParams(data),
      });

      if (response.status === 200) {
        setEmail("");
        setPending(false);
        setMessage("Successfully subscribed!");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Failed to subscribe. Try again.");
    }
  };

  return (
    <div
      className="mx-auto max-w-5xl px-6 my-10 lg:px-8 bg-cover bg-center bg-no-repeat relative overflow-hidden md:overflow-visible"
      style={{ backgroundImage: `url("/assets/Home/stay-bg.png")` }}
    >
      <div className="py-20">
        <h2 className="mx-auto max-w-2xl text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Stay Informed with Zidallie!
        </h2>
        <p className="mx-auto mt-4 max-w-4xl text-center text-sm leading-8 text-text-muted">
          Sign up for our newsletter to receive important updates,
          transportation tips, and exclusive Zidallie insights.
        </p>

        <form
          className="mx-auto mt-10 flex max-w-xl gap-x-4 items-center justify-center flex-wrap md:flex-nowrap"
          onSubmit={handleSubmit}
        >
          <input
            id="email-address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-3/4 flex-auto shadow-lg border border-gray-200 rounded-md px-5 py-4 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
            placeholder="Enter your email"
          />
          <button
            type="submit"
            disabled={pending ? true : false}
            className="flex-none rounded-md bg-primary px-10 py-3 md:py-4 mt-5 md:mt-0 text-sm font-semibold text-white shadow-sm hover:bg-btnhover focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {pending ? "Submitting..." : "Subscribe"}
          </button>
        </form>

        {message && (
          <p className="text-center mt-6 text-primary text-xs">{message}</p>
        )}
      </div>

      <section className="hidden md:block md:absolute md:-right-6 md:-top-6">
        <img src={"/assets/Home/stay-arrow.png"} alt="" />
      </section>
      <section className="hidden md:block md:absolute md:-right-[90px] md:-bottom-16">
        <img src={"/assets/Home/stay-pluses.png"} alt="" />
      </section>
    </div>
  );
}

export default Newsletter;
