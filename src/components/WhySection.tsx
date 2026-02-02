import Link from 'next/link';

interface WhySectionProps {
  className?: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
  slug: string;
}

const features: Feature[] = [
  {
    icon: '📊',
    title: 'Advanced Data Visualization',
    description: 'Create stunning charts and graphs that bring your thesis data to life with interactive elements.',
    slug: 'advanced-data-visualization',
  },
  {
    icon: '🔍',
    title: 'Deep Analysis Tools',
    description: 'Uncover hidden patterns and insights in your research data with powerful analytical tools.',
    slug: 'deep-analysis-tools',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast Processing',
    description: 'Process large datasets in seconds with our optimized algorithms and cloud infrastructure.',
    slug: 'lightning-fast-processing',
  },
  {
    icon: '🎯',
    title: 'Precision & Accuracy',
    description: 'Ensure your thesis conclusions are backed by accurate statistical analysis and validation.',
    slug: 'precision-accuracy',
  },
  {
    icon: '🤝',
    title: 'Collaborative Workspace',
    description: 'Work together with your research team in real-time on shared projects and analyses.',
    slug: 'collaborative-workspace',
  },
  {
    icon: '📱',
    title: 'Access Anywhere',
    description: 'Access your thesis analysis from any device, anywhere, with cloud synchronization.',
    slug: 'access-anywhere',
  },
];

export default function WhySection({ className = '' }: WhySectionProps) {
  return (
    <section id="why-use" className={`py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Use ThesisAnalyzer for Your Next Data Analysis?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empower your research with cutting-edge tools designed specifically for academic excellence
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={`/features/${feature.slug}`}
              className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer block"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              <div className="mt-4 text-blue-600 font-medium text-sm flex items-center gap-1">
                Learn more
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

