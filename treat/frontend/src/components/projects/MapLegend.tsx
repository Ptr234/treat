export default function MapLegend() {
  const sectors = [
    { name: 'Agriculture', color: '#FBBF24' },
    { name: 'Tourism', color: '#F97316' },
    { name: 'Mining', color: '#EF4444' },
    { name: 'ICT', color: '#FDE047' },
    { name: 'Manufacturing', color: '#DC2626' },
    { name: 'Energy', color: '#FB923C' }
  ];

  const investmentSizes = [
    { label: 'Small (<$5M)', size: 5 },
    { label: 'Medium ($5M-$15M)', size: 10 },
    { label: 'Large (>$15M)', size: 15 }
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl p-4 max-w-xs">
      <h3 className="font-bold text-yellow-500 text-sm mb-3">Map Legend</h3>

      <div className="mb-4">
        <p className="text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Sector Colors</p>
        <div className="space-y-1.5">
          {sectors.map((sector) => (
            <div key={sector.name} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 ring-1 ring-black/30"
                style={{ backgroundColor: sector.color }}
              />
              <span className="text-xs text-neutral-300">{sector.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-700">
        <p className="text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Investment Size</p>
        <div className="space-y-2">
          {investmentSizes.map((size) => (
            <div key={size.label} className="flex items-center gap-2">
              <div
                className="rounded-full bg-yellow-500 flex-shrink-0"
                style={{ width: size.size, height: size.size }}
              />
              <span className="text-xs text-neutral-300">{size.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-700">
        <p className="text-xs text-neutral-500 italic">Click on any dot to view project details</p>
      </div>
    </div>
  );
}
