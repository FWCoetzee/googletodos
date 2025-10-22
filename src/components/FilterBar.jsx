import { motion } from 'framer-motion';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export const FilterBar = ({ currentFilter, onFilterChange, stats }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex gap-2 bg-secondary rounded-lg p-1">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className="relative px-4 py-2 text-sm font-medium rounded-md transition-colors"
          >
            {currentFilter === filter.id && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-card rounded-md shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">
              {filter.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{stats.total} total</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span>{stats.active} active</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span>{stats.completed} completed</span>
      </div>
    </div>
  );
};
