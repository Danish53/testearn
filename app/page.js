import Navbar from "@/components/Navbar";
import SolarLanding from "@/components/SolarLanding";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <SolarLanding />
      </main>
    </>
  );
}
