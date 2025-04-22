"use client"
import Link from "next/link";
import { useState } from "react";

function Mobile() {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full fixed left-0 top-0 z-50 ">
      {/* Sidebar */}
      <div
        className={`absolute left-0 top-0 shadow bg-white w-72 min-h-screen  transition-transform transform  ease-in-out duration-300 ${
          open ? "" : "-translate-x-full"
        }`}
        id="sidebar"
      >
        {/* Your Sidebar Content */}
        <div className="flex flex-col items-center pt-5">
          <Link href="/" className="mb-5">
            <img src={"/assets/Home/logo.png"} alt="logo image" height="60" width="110" />
          </Link>
          <nav className="flex flex-col items-center mt-5">
            <Link href="/" className="mb-5 hover:text-primary focus:text-primary">
              Home
            </Link>
            <Link
              href="/schools"
              className="mb-5 hover:text-primary focus:text-primary"
            >
              Schools
            </Link>
            <Link
              href="/parents"
              className="mb-5 hover:text-primary focus:text-primary"
            >
              Parents
            </Link>
            <Link
              href="/about"
              className="mb-5 hover:text-primary focus:text-primary"
            >
              Who We Are
            </Link>
            <Link
              href="/blog"
              className="mb-5 hover:text-primary focus:text-primary"
            >
              Blog/News
            </Link>

            <button className="inline-flex items-center border-0 py-2 px-3 bg-primary text-white hover:bg-btnhover rounded text-base mt-4 md:mt-0">
              <Link href="/contact">Contact Us</Link>
            </button>
          </nav>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <div className="bg-white shadow w-full">
          <div className="container mx-auto">
            <div className="flex justify-between items-center py-4 px-2">
              <Link href="/" className="flex title-font font-medium items-center">
                <img src={"/assets/Home/logo.png"} alt="logo image" height="60" width="80" />
              </Link>
              <button
                className="text-content hover:text-muted"
                aria-label="Open Navigation Menu"
              >
                <svg
                  height="30"
                  width="30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mobile;
