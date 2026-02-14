'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface ProjectDetailProps {
  projectId: string;
}

interface Project {
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
}

interface DataPoint {
  id: number;
  label: string;
  value: number;
  category?: string;
  timestamp?: string;
}

const projects: Project[] = [
  {
    id: '1',
    title: 'Machine Learning Model Performance Analysis',
    description: 'Comprehensive analysis of multiple ML models including neural networks, random forests, and support vector machines. Evaluated performance metrics across different datasets and identified optimal hyperparameters.',
    category: 'Machine Learning',
    status: 'completed',
    date: 'March 2024',
    technologies: ['Python', 'TensorFlow', 'Scikit-learn', 'Pandas', 'Matplotlib'],
    results: 'Achieved 94.2% accuracy with optimized Random Forest model, reducing training time by 35% through hyperparameter tuning.',
    dataPoints: 125000,
    visualizations: 12,
  },
  {
    id: '2',
    title: 'Climate Change Data Visualization Dashboard',
    description: 'Interactive dashboard analyzing global temperature trends, CO2 emissions, and sea level rise over the past 50 years. Includes predictive modeling for future climate scenarios.',
    category: 'Environmental Science',
    status: 'in-progress',
    date: 'April 2024',
    technologies: ['JavaScript', 'D3.js', 'React', 'Node.js', 'MongoDB'],
    results: 'Identified 3 key correlation patterns between industrial activity and regional temperature changes.',
    dataPoints: 850000,
    visualizations: 8,
  },
  {
    id: '3',
    title: 'Social Media Sentiment Analysis',
    description: 'Real-time sentiment analysis of social media posts across multiple platforms. Analyzed over 1 million posts to understand public opinion trends on various topics.',
    category: 'Data Science',
    status: 'completed',
    date: 'February 2024',
    technologies: ['Python', 'NLTK', 'VADER', 'Twitter API', 'PostgreSQL'],
    results: 'Developed sentiment classifier with 87% accuracy, processing 10,000+ posts per hour in real-time.',
    dataPoints: 1200000,
    visualizations: 15,
  },
  {
    id: '4',
    title: 'Genomic Data Processing Pipeline',
    description: 'High-performance pipeline for processing and analyzing genomic sequences. Includes variant calling, annotation, and population genetics analysis.',
    category: 'Bioinformatics',
    status: 'in-progress',
    date: 'May 2024',
    technologies: ['Python', 'Biopython', 'GATK', 'R', 'AWS'],
    results: 'Reduced processing time from 48 hours to 6 hours for whole-genome analysis through parallelization.',
    dataPoints: 2500000,
    visualizations: 20,
  },
];

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const project = projects.find((p) => p.id === projectId);
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState<DataPoint[]>([]);

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch real data from JSONPlaceholder or a public API
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const posts = await response.json();
        
        // Transform API data to our format
        const transformedData: DataPoint[] = posts.slice(0, 20).map((post: { id: number; title: string }, index: number) => ({
          id: post.id,
          label: post.title.substring(0, 30),
          value: post.id * 10 + Math.random() * 50,
          category: `Category ${(index % 5) + 1}`,
          timestamp: new Date(Date.now() - index * 86400000).toISOString(),
        }));
        
        setData(transformedData);
        setEditedData(transformedData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data
        const mockData: DataPoint[] = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          label: `Data Point ${i + 1}`,
          value: Math.random() * 100,
          category: `Category ${(i % 5) + 1}`,
          timestamp: new Date(Date.now() - i * 86400000).toISOString(),
        }));
        setData(mockData);
        setEditedData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleEdit = (id: number, field: 'label' | 'value', newValue: string | number) => {
    setEditedData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: newValue } : item
      )
    );
  };

  const handleSave = () => {
    setData(editedData);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditedData(data);
    setEditing(false);
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const currentData = editing ? editedData : data;
    if (currentData.length === 0) return null;

    const values = currentData.map((d) => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, median, min, max, stdDev, count: currentData.length };
  }, [data, editedData, editing]);

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-8">The project you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/projects"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const displayData = editing ? editedData : data;
  const maxValue = Math.max(...displayData.map((d) => d.value), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link href="/" className="hover:text-blue-600">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/projects" className="hover:text-blue-600">Projects</Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{project.title}</li>
        </ol>
      </nav>

      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700">
                {project.category}
              </span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  project.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : project.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {project.status === 'completed'
                  ? 'Completed'
                  : project.status === 'in-progress'
                  ? 'In Progress'
                  : 'Planned'}
              </span>
            </div>
          </div>
          {project.status === 'in-progress' && (
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Data
                </button>
              )}
            </div>
          )}
        </div>
        <p className="text-lg text-gray-600 mb-4">{project.description}</p>
        {project.results && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-1">Key Results:</p>
            <p className="text-sm text-blue-800">{project.results}</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600 mb-1">Mean</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.mean.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600 mb-1">Median</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.median.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600 mb-1">Min</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.min.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600 mb-1">Max</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.max.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600 mb-1">Std Dev</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.stdDev.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Chart Visualization */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Visualization</h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bar Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bar Chart</h3>
                <div className="flex items-end justify-between gap-2 h-64 border-b-2 border-gray-200">
                  {displayData.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t hover:from-blue-700 hover:to-purple-700 transition-all duration-300 cursor-pointer"
                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                        title={`${item.label}: ${item.value.toFixed(2)}`}
                      ></div>
                      <p className="text-xs text-gray-600 mt-2 text-center truncate w-full" title={item.label}>
                        {item.label.substring(0, 10)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Line Chart */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Line</h3>
                <div className="relative h-64 border-2 border-gray-200 rounded-lg p-4">
                  <svg className="w-full h-full">
                    <polyline
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                      points={displayData
                        .slice(0, 15)
                        .map(
                          (item, index) =>
                            `${(index / 14) * 100}%,${100 - (item.value / maxValue) * 100}%`
                        )
                        .join(' ')}
                    />
                    {displayData.slice(0, 15).map((item, index) => (
                      <circle
                        key={item.id}
                        cx={`${(index / 14) * 100}%`}
                        cy={`${100 - (item.value / maxValue) * 100}%`}
                        r="4"
                        fill="#6366f1"
                        className="hover:r-6 transition-all"
                      />
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Points</h2>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Label
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayData.slice(0, 15).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editing && project.status === 'in-progress' ? (
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleEdit(item.id, 'label', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        />
                      ) : (
                        item.label
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editing && project.status === 'in-progress' ? (
                        <input
                          type="number"
                          value={item.value.toFixed(2)}
                          onChange={(e) => handleEdit(item.id, 'value', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          step="0.01"
                        />
                      ) : (
                        item.value.toFixed(2)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Technologies */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Technologies Used</h2>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <Link
          href="/projects"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Projects</span>
        </Link>
      </div>
    </div>
  );
}

