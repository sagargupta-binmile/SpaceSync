import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect } from 'react';
import { useUserContext } from '../context/context';
import './calendar-theme.css'; 

export default function GlobalCalendar() {
  const { getCalendar, calendar } = useUserContext();

  useEffect(() => {
    getCalendar();
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-[#5C4033]">
        🌍 Global Calendar
      </h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={calendar}
        height="80vh"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        eventDisplay="block"
        eventColor="#8B4513"       
        eventTextColor="#ffffff"
        nowIndicator={true}
        eventClassNames={() =>
          "rounded-lg shadow-sm border border-purple-300"
        }
      />
    </div>
  );
}
