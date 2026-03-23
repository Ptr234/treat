import { LicensedProject, ProjectStatus } from '@/types';

interface ProjectCardProps {
  project: LicensedProject;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function ProjectCard({ project, isSelected = false, onClick }: ProjectCardProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const badges = {
      active: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      under_construction: 'bg-red-500/20 text-red-400 border-red-500/40',
      planned: 'bg-yellow-300/20 text-yellow-300 border-yellow-300/40',
      completed: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/40'
    };
    const labels = {
      active: 'Active',
      under_construction: 'Construction',
      planned: 'Planned',
      completed: 'Completed'
    };
    return { className: badges[status], label: labels[status] };
  };

  const badge = getStatusBadge(project.status);

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md hover:shadow-yellow-500/5 ${
        isSelected
          ? 'border-yellow-500 bg-yellow-500/10 shadow-md shadow-yellow-500/10'
          : 'border-neutral-700 bg-neutral-800 hover:border-yellow-600'
      }`}
    >
      <div className="mb-2">
        <h4 className="font-semibold text-white text-sm line-clamp-2 mb-1">{project.company}</h4>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">
            {project.sector}
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>
      <div className="space-y-1 text-xs text-neutral-400">
        <p>
          <span className="text-neutral-500">Region:</span> {project.region}
        </p>
        <p>
          <span className="text-neutral-500">Investment:</span>{' '}
          <span className="font-semibold text-yellow-400">{formatCurrency(project.investmentValue)}</span>
        </p>
        <p>
          <span className="text-neutral-500">Jobs:</span>{' '}
          <span className="font-semibold text-red-400">{project.plannedEmployment.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}
