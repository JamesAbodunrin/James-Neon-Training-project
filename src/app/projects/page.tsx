import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProjectsList from '@/components/ProjectsList';

export default function ProjectsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Projects
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Explore our portfolio of thesis analysis projects. Each project showcases different analytical approaches and visualization techniques.
            </p>
          </div>
          <ProjectsList />
        </div>
      </main>
      <Footer />
    </div>
  );
}

