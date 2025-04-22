"use client"

import Link from "next/link";

function Footer() {
  return (
    <footer className="bg-primary text-white py-5 mt-30">
      <div className="container px-4 sm:px-6 sm:grid md:grid-cols-4 sm:grid-cols-2 mx-auto">
        <div className="p-5">
          <Link href="/" className="mb-5">
            <img src={"/assets/Home/logo.png"} alt="logo image" height="60" width="110" />
          </Link>
        </div>
        <div className="p-5 text-[14px]">
          <div className="text-sm uppercase font-bold">Quick Links</div>

          <Link className="my-3 block" href="/">
            Home
          </Link>
          <Link className="my-3 block" href="/schools">
            Schools
          </Link>
          <Link className="my-3 block" href="/parents">
            Parents
          </Link>
          <Link className="my-3 block" href="/about">
            Who We Are
          </Link>
          <a
            className="my-3 flex items-center"
            target="__blank"
            href="https://docs.google.com/forms/d/e/1FAIpQLSeh2xXD5KIM8t9bIaY6IyVHV5ZW3LT1NkGxnTGO8mh7q8XO1A/viewform"
          >
            <span>Request Demo </span>
            <img src={"/assets/Home/footer-arrow.png"} alt="" />
          </a>
        </div>
        <div className="p-5 text-[14px]">
          <div className="text-sm uppercase font-bold">Resources</div>
          <Link className="my-3 block" href="/blog">
            Blogs & News
          </Link>
          <a className="my-3 block" href="/schools#school-FAQS">
            Schools' FAQS
          </a>
          <a className="my-3 block" href="/parents#parents-FAQS">
            Parents' FAQS
          </a>
          <Link className="my-3 block" href="/contact">
            Contact Info
          </Link>
        </div>
        <div className="p-5 text-[14px]">
          <div className="text-sm uppercase font-bold">Reach Us</div>
          <a className="my-3 block hover:underline" href={`tel:0741843358`}>
            <img src={"/assets/Home/social-icons/call.png"} alt="call" className="inline-block mr-2" />
            +254115545173
          </a>
          <a
            className="my-3 block hover:underline"
            href="mailto:info@zidallie.co.ke"
          >
            <img src={"/assets/Home/social-icons/email.png"} alt="call" className="inline-block mr-2" />
            info@zidallie.co.ke
          </a>
          <a
            href="https://www.google.com/maps/place/'@iBizAfrica'/@-1.3101583,36.8106687,17z/data=!3m1!4b1!4m6!3m5!1s0x182f10f7e95364ed:0xde53f214e47a1069!8m2!3d-1.3101583!4d36.8132436!16s%2Fg%2F1yg4v7gh1?entry=ttu&g_ep=EgoyMDI0MDkyMy4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline my-3 flex items-start"
          >
            <img src={"/assets/Home/social-icons/location.png"} alt="call" className="inline-block mr-2" />

            <span>
              iBiz Africa, Strathmore
              <br />
              University Keri Road,
              <br />
              Nairobi Kenya.
            </span>
          </a>
        </div>
      </div>
      <div className="mx-10  border-t">
        <section className="flex items-center justify-between text-[14px] py-8 flex-wrap gap-3">
          <div className="">
            © {new Date().getFullYear()} Zidallie Technologies. All Rights
            Reserved.
          </div>
          <section className="flex items-center gap-5 py-4 md:py-0">
            <Link href="/conditions">Terms and Conditions</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </section>
          <section className="flex items-center gap-8 md:gap-4">
            <a href="https://www.facebook.com/zidallie" target="__blank">
              <img src={"/assets/Home/social-icons/facebook.png"} alt="facebook" />
            </a>
            <a href="https://www.instagram.com/zidallie/" target="__blank">
              <img src={"/assets/Home/social-icons/instagram.png"} alt="instagram" />
            </a>
            <a href="https://www.tiktok.com/@zidallie" target="__blank">
              <img src={"/assets/Home/social-icons/tiktok.png"} alt="tiktok" />
            </a>
            <a
              href="https://www.linkedin.com/company/zidallie/"
              target="__blank"
            >
              <img src={"/assets/Home/social-icons/linkedin.png"} alt="linkedin" />
            </a>
            <a
              href={`https://wa.me/254115545173
`}
              target="__blank"
            >
              <img src={"/assets/Home/social-icons/whatsapp.png"} alt="whatsapp" />
            </a>
          </section>
        </section>
      </div>
    </footer>
  );
}

export default Footer;
