import Link from "next/link";

function Desktop() {
  return (
    <div className="fixed top-0 left-0  w-full  z-50">
      <div className="max-w-[1600px] mx-auto px-3 py-2 flex flex-col md:flex-row items-center justify-between shadow-md bg-white">
        <Link href="/" className="flex title-font font-medium items-center">
          <img src={"/assets/Home/logo.png"} alt="logo image" height="60" width="110" />
        </Link>
        <nav className="flex flex-wrap items-center text-base justify-center gap-y-4 md:gap-y-0">
          <Link href="/" className="mr-5 hover:text-primary focus:text-primary">
            Home
          </Link>
          <Link
            href="/schools"
            className="mr-5 hover:text-primary focus:text-primary"
          >
            Schools
          </Link>
          <Link
            href="/parents"
            className="mr-5 hover:text-primary focus:text-primary"
          >
            Parents
          </Link>
          <section className="group relative">
            <p className="mr-5 hover:text-primary focus:text-primary flex items-center">
              Company
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-chevron-down ml-1"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
                />
              </svg>
            </p>
            <div className="absolute left-0 w-40 z-50 origin-top-left bg-white divide-y divide-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-300">
              <div className="py-1">
                <Link
                  href="/about"
                  className="hover:text-primary focus:text-primary block px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Who We Are
                </Link>
                <Link
                  href="/blog"
                  className="hover:text-primary focus:text-primary block px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Blog & News
                </Link>
              </div>
            </div>
          </section>
          <button className="inline-flex items-center border-0 py-2 px-4 ml-1 bg-primary focus:outline-none rounded text-base mt-4 md:mt-0 text-white hover:bg-btnhover">
            <Link href="/contact">Contact Us</Link>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default Desktop;
