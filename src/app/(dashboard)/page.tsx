import Navbar from "./_components/navbar/Navbar";
import ProjectsSection from "./_components/project/ProjectsSection";

export default async function Home() {
  return (
    <div className="bg-sidebar min-h-lvh">
      <Navbar />
      <ProjectsSection />
    </div>
  );
}
