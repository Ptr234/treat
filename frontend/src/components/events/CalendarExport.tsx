'use client';

import React from 'react';
import { CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { InvestmentEvent } from '@/types';

interface CalendarExportProps {
  event: InvestmentEvent;
}

export function CalendarExport({ event }: CalendarExportProps) {
  const formatDateForCalendar = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const getEventEndTime = () => {
    if (event.endDate) {
      return formatDateForCalendar(event.endDate, '17:00');
    }
    // Default to 2 hours after start time
    const startDate = new Date(`${event.date}T${event.time}`);
    startDate.setHours(startDate.getHours() + 2);
    return startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const handleGoogleCalendar = () => {
    const startTime = formatDateForCalendar(event.date, event.time);
    const endTime = getEventEndTime();

    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.set('action', 'TEMPLATE');
    googleUrl.searchParams.set('text', event.title);
    googleUrl.searchParams.set('dates', `${startTime}/${endTime}`);
    googleUrl.searchParams.set('details', event.description);
    googleUrl.searchParams.set('location', event.isVirtual && event.virtualLink ? event.virtualLink : event.location);

    window.open(googleUrl.toString(), '_blank');
  };

  const handleICalDownload = () => {
    const startTime = formatDateForCalendar(event.date, event.time);
    const endTime = getEventEndTime();

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Uganda Investment Authority//Events//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@oscdigitaltool.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.isVirtual && event.virtualLink ? event.virtualLink : event.location}`,
      `ORGANIZER:CN=${event.organizer}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleOutlookCalendar = () => {
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = event.endDate
      ? new Date(`${event.endDate}T17:00`)
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    outlookUrl.searchParams.set('subject', event.title);
    outlookUrl.searchParams.set('startdt', startDate.toISOString());
    outlookUrl.searchParams.set('enddt', endDate.toISOString());
    outlookUrl.searchParams.set('body', event.description);
    outlookUrl.searchParams.set('location', event.isVirtual && event.virtualLink ? event.virtualLink : event.location);

    window.open(outlookUrl.toString(), '_blank');
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleGoogleCalendar}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 hover:border-neutral-400 transition-colors duration-200"
      >
        <CalendarIcon className="w-4 h-4" />
        Add to Google Calendar
      </button>

      <button
        onClick={handleICalDownload}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 hover:border-neutral-400 transition-colors duration-200"
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        Download .ics
      </button>

      <button
        onClick={handleOutlookCalendar}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 hover:border-neutral-400 transition-colors duration-200"
      >
        <CalendarIcon className="w-4 h-4" />
        Add to Outlook
      </button>
    </div>
  );
}
