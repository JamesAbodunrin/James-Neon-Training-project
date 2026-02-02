import Link from 'next/link';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: 'completed' | 'in-progress' | 'planned';
    date: string;
    technologies: string[];
    results?: string;
    dataPoints?: number;
    visualizations?: number;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    planned: 'bg-yellow-100 text-yellow-800',
  };

  const statusLabels = {
    completed: 'Completed',
    'in-progress': 'In Progress',
    planned: 'Planned',
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 border border-gray-100 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h3>
          <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 mb-3">
            {project.category}
          </span>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[project.status]}`}>
          {statusLabels[project.status]}
        </span>
      </div>

      <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>

      {project.results && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-1">Key Results:</p>
          <p className="text-sm text-gray-600">{project.results}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {project.technologies.map((tech, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {project.date}
          </span>
          {project.dataPoints && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {project.dataPoints.toLocaleString()} data points
            </span>
          )}
          {project.visualizations && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              {project.visualizations} visualizations
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

