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
      active: 'bg-yellow-50 text-red-600 border-yellow-400',
      under_construction: 'bg-red-50 text-red-400 border-red-500/40',
      planned: 'bg-yellow-300/20 text-red-600 border-yellow-400',
      completed: 'bg-neutral-500/20 text-neutral-700 border-neutral-400/40'
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
      className={`p-3 border-l-4 cursor-pointer transition-colors hover:bg-neutral-50 ${
        isSelected
          ? 'border-yellow-400 bg-yellow-50'
          : 'border-neutral-200 hover:border-black'
      }`}
    >
      <div className="mb-2">
        <h4 className="font-semibold text-black text-sm line-clamp-2 mb-1">{project.company}</h4>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 bg-yellow-50 text-red-600 text-xs font-medium rounded">
            {project.sector}
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>
      <div className="space-y-1 text-xs text-neutral-700">
        <p>
          <span className="text-neutral-600">Region:</span> {project.region}
        </p>
        <p>
          <span className="text-neutral-600">Investment:</span>{' '}
          <span className="font-semibold text-red-600">{formatCurrency(project.investmentValue)}</span>
        </p>
        <p>
          <span className="text-neutral-600">Jobs:</span>{' '}
          <span className="font-semibold text-red-400">{project.plannedEmployment.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}
