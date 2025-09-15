import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import {getDay} from 'date-fns/getDay';
import {enUS} from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// Mock events data
const events = [
  {
    id: 1,
    title: 'Team Meeting',
    start: new Date(2025, 8, 15, 10, 0), // Note: Months are 0-indexed (8 = September)
    end: new Date(2025, 8, 15, 11, 30),
  },
  {
    id: 2,
    title: 'Lunch with Client',
    start: new Date(2025, 8, 16, 12, 0),
    end: new Date(2025, 8, 16, 13, 30),
  },
  {
    id: 3,
    title: 'Project Deadline',
    start: new Date(2025, 8, 17, 15, 0),
    end: new Date(2025, 8, 17, 17, 0),
  },
];

const Calendar = () => {
  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 64px - 48px)' }}>
      <Typography variant="h4" gutterBottom>
        Calendar
      </Typography>
      <Paper sx={{ p: 2, height: '100%' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          defaultView="week"
          views={['month', 'week', 'day', 'agenda']}
          popup
          selectable
        />
      </Paper>
    </Box>
  );
};

export default Calendar;
