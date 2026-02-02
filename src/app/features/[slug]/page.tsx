import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeatureContent from '@/components/FeatureContent';

interface FeaturePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function FeaturePage({ params }: FeaturePageProps) {
  const { slug } = await params;
  
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <FeatureContent slug={slug} />
      </main>
      <Footer />
    </div>
  );
}

