interface HowSectionProps {
  className?: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Upload Your Data',
    description: 'Import your thesis data in various formats including CSV, Excel, or JSON. Our platform supports multiple data sources.',
  },
  {
    number: '02',
    title: 'Choose Analysis Type',
    description: 'Select from a range of analysis tools including statistical analysis, data visualization, pivot tables, and more.',
  },
  {
    number: '03',
    title: 'Customize & Visualize',
    description: 'Customize your charts and graphs with our intuitive interface. Add filters, groupings, and interactive elements.',
  },
  {
    number: '04',
    title: 'Export & Share',
    description: 'Export your analysis results in multiple formats and share them with your research team or advisors.',
  },
];

export default function HowSection({ className = '' }: HowSectionProps) {
  return (
    <section id="how-to-use" className={`py-20 bg-gradient-to-br from-gray-50 to-blue-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How to Use ThesisAnalyzer
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started with your thesis analysis in just a few simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative"
            >
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

