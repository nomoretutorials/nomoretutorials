import Navbar from "./_components/Navbar";
import NewStackDialog from "./_components/NewStackDialog";
import ProjectsSection from "./_components/ProjectsSection";

export default function Home() {
  return (
    <div className="bg-sidebar min-h-lvh">
      <Navbar />
      <ProjectsSection />
      <NewStackDialog />
    </div>
  );
}
