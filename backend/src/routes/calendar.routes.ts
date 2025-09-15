import { Router } from 'express';
import { CalendarController } from '../controllers/calendar.controller';
import { OAuth2Client } from 'google-auth-library';

export const createCalendarRouter = (oauth2Client: OAuth2Client) => {
  const router = Router();
  const calendarController = new CalendarController(oauth2Client);

  // Middleware to check if user is authenticated
  const authenticate = (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // Apply authentication middleware to all routes
  router.use(authenticate);

  // Calendar Events
  router.get('/events', calendarController.getEvents);
  router.post('/events', calendarController.createEvent);
  router.get('/events/:eventId', calendarController.getEvent);
  router.put('/events/:eventId', calendarController.updateEvent);
  router.delete('/events/:eventId', calendarController.deleteEvent);

  // Availability
  router.get('/availability', calendarController.getAvailability);
  router.post('/schedule-meeting', calendarController.scheduleMeeting);
  router.get('/free-busy', calendarController.getFreeBusy);

  // Calendar Settings
  router.get('/timezone', calendarController.getCalendarTimezone);

  return router;
};
