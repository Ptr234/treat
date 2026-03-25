'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, FunnelIcon, CalendarIcon, ClockIcon, MapPinIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';

interface Appointment {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  agency: string;
  subject: string;
  message: string;
  date: string;
  time: string;
  duration: number;
  meetingType: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  completed: 'bg-neutral-700 text-neutral-400',
};

export default function AppointmentsPage() {
  const { isAuthenticated, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyFilter, setAgencyFilter] = useState('');
  const [total, setTotal] = useState(0);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const query = agencyFilter ? `?from=0&to=100&agencyCode=${agencyFilter}` : '?from=0&to=100';
    const res = await apiFetch<{ items: Appointment[]; total: number }>(`/api/contact/appointments${query}`);
    if (res.success && res.data) {
      setAppointments(res.data.items || []);
      setTotal(res.data.total || 0);
    }
    setLoading(false);
  }, [agencyFilter]);

  useEffect(() => {
    if (isAuthenticated) fetchAppointments();
  }, [isAuthenticated, fetchAppointments]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400">Admin access required.</p>
      </div>
    );
  }

  const agencies = ['UIA', 'URA', 'URSB', 'DCIC', 'NEMA', 'UNBS', 'KCCA'];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-neutral-800 rounded-lg" aria-label="Back">
              <ArrowLeftIcon className="w-5 h-5 text-neutral-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Appointments</h1>
              <p className="text-sm text-neutral-400">{total} total appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-neutral-500" />
            <select
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Agencies</option>
              {agencies.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">No appointments found.</div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-neutral-500">{apt.referenceNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[apt.status] || statusColors.pending}`}>
                        {apt.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 flex items-center gap-1">
                        {apt.meetingType === 'virtual' ? (
                          <><VideoCameraIcon className="w-3 h-3" /> Virtual</>
                        ) : (
                          <><MapPinIcon className="w-3 h-3" /> In-Person</>
                        )}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white">{apt.subject}</h3>
                  </div>
                  <span className="text-xs text-neutral-500 whitespace-nowrap ml-4">{apt.agency}</span>
                </div>
                {apt.message && <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{apt.message}</p>}
                <div className="flex items-center gap-4 text-xs text-neutral-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {new Date(apt.date).toLocaleDateString('en-UG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {apt.time} ({apt.duration} min)
                  </span>
                  <span>{apt.fullName} ({apt.email})</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
