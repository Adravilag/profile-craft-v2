import React, { useState } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configura el localizador de fechas
const localizer = dayjsLocalizer(dayjs);

const MyCalendar = () => {
  // Estado para los eventos del calendario
  const [events, setEvents] = useState([
    {
      title: 'Reunión con el equipo',
      start: dayjs().toDate(),
      end: dayjs().add(1, 'hour').toDate(),
    },
    {
      title: 'Entrega de proyecto',
      start: dayjs().add(2, 'days').toDate(),
      end: dayjs().add(2, 'days').toDate(),
    },
  ]);

  return (
    <div style={{ height: '500px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default MyCalendar;
