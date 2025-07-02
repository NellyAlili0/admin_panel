import Image from "next/image";
import React from "react";

function Success() {
  return (
    <section className="h-[85vh] w-full flex items-center justify-center ">
      <div className="h-[400px] sm:h-[350px] md:h-[400px] mx-3 sm:min-w-md max-w-lg sm:mx-auto my-10 py-12 px-8 bg-white shadow rounded-xl text-center flex flex-col justify-center gap-5 items-center border border-gray-100">
        <Image
          height="48"
          width="48"
          src="/check-circle.png"
          alt=""
          className="h-12 w-12 md:h-16 md:w-16"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-green-600 ">
          Booking Successful !
        </h1>
        <p className="text-gray-700 font-extralight leading-7 text-sm md:text-base">
          Thank you for booking transport with us. You will receive an email
          shortly with more details, and the invoice as well. We look forward
          to serving you!
        </p>
      </div>
    </section>
  );
}

export default Success;
