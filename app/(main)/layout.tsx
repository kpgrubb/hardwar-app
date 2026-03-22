import Header from "@/components/layout/Header";
import GridOverlay from "@/components/shared/GridOverlay";
import DiceRoller from "@/components/shared/DiceRoller";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <GridOverlay />
      <Header />
      <main className="flex-1 relative z-10 p-6 lg:p-8 max-w-[1320px] mx-auto w-full">
        {children}
      </main>
      <DiceRoller />
    </div>
  );
}
