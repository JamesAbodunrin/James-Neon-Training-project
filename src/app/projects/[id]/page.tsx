import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProjectDetail from '@/components/ProjectDetail';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <ProjectDetail projectId={id} />
      </main>
      <Footer />
    </div>
  );
}

