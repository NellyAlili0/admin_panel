import Image from "next/image";
import Form from "./login/form";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-[300px]">
        <Form />
      </div>
    </div>
  );
}
