import Navbar from "./_components/Navbar";
import NewUserOnboarding from "./_components/NewUserOnboarding";
import ProjectsSection from "./_components/ProjectsSection";

export default function Home() {
  return (
    <div className="bg-sidebar min-h-lvh">
      <Navbar />
      <ProjectsSection />
      <NewUserOnboarding />
    </div>
  );
}
