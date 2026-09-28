import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import OpenForSection from "@/components/OpenForSection";
import ProjectsSection from "@/components/ProjectsSection";
import TechStackSection from "@/components/TechStackSection";
import EducationSection from "@/components/EducationSection";
import TeachingSection from "@/components/TeachingSection";
import PostsSection from "@/components/PostsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main>
        <HeroSection />
        <OpenForSection />
        <ProjectsSection />
        <TechStackSection />
        <EducationSection />
        <TeachingSection />
        <PostsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
