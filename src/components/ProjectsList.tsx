import ProjectCard from './ProjectCard';

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

interface ProjectsListProps {
  className?: string;
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

export default function ProjectsList({ className = '' }: ProjectsListProps) {
  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

