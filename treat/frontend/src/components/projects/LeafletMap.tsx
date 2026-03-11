'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon path issue in Next.js
import L from 'leaflet';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Project {
  id: string;
  name: string;
  company: string;
  sector: string;
  region: string;
  district: string;
  coordinates: { lat: number; lng: number };
  investmentValue: number;
  plannedEmployment: number;
  status: string;
  industrialPark?: string;
}

interface LeafletMapProps {
  projects: Project[];
  selectedProject: string | null;
  onSelectProject: (id: string) => void;
  getSectorColor: (sector: string) => string;
  formatCurrency: (value: number) => string;
}

function FitBounds({ projects }: { projects: Project[] }) {
  const map = useMap();
  useEffect(() => {
    if (projects.length > 0) {
      const bounds = L.latLngBounds(projects.map(p => [p.coordinates.lat, p.coordinates.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [projects, map]);
  return null;
}

export default function LeafletMap({ projects, selectedProject, onSelectProject, getSectorColor, formatCurrency }: LeafletMapProps) {
  // Uganda center coordinates
  const center: [number, number] = [1.3733, 32.2903];

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ width: '100%', background: '#0a0a0a' }}
      className="rounded-lg h-[400px] sm:h-[500px] lg:h-[700px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds projects={projects} />
      {projects.map((project) => {
        const isSelected = selectedProject === project.id;
        const radius = Math.max(6, Math.min(22, project.investmentValue / 5000000));
        const color = getSectorColor(project.sector);

        return (
          <CircleMarker
            key={project.id}
            center={[project.coordinates.lat, project.coordinates.lng]}
            radius={isSelected ? radius + 4 : radius}
            pathOptions={{
              fillColor: color,
              fillOpacity: isSelected ? 1 : 0.7,
              color: isSelected ? '#FBBF24' : '#000',
              weight: isSelected ? 3 : 1,
            }}
            eventHandlers={{
              click: () => onSelectProject(project.id),
            }}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <h3 className="font-bold text-gray-900 mb-1">{project.name}</h3>
                <p className="text-gray-600 text-xs mb-2">{project.company}</p>
                <div className="space-y-1">
                  <p><span className="text-gray-500">Sector:</span> <span className="font-medium">{project.sector}</span></p>
                  <p><span className="text-gray-500">Location:</span> {project.district}, {project.region}</p>
                  <p><span className="text-gray-500">Investment:</span> <span className="font-bold text-amber-600">{formatCurrency(project.investmentValue)}</span></p>
                  <p><span className="text-gray-500">Employment:</span> <span className="font-bold text-red-600">{project.plannedEmployment.toLocaleString()} jobs</span></p>
                  {project.industrialPark && (
                    <p><span className="text-gray-500">Park:</span> {project.industrialPark}</p>
                  )}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
