import Desktop from "./Navigation/Desktop";
import Mobile from "./Navigation/Mobile";

function Navbar() {
  return (
    <header className=" bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="block md:hidden">
          <Mobile />
        </div>
        <div className="hidden md:block">
          <Desktop />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
