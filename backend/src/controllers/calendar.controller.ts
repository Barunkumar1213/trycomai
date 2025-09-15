import { Request, Response } from 'express';
import { CalendarService, CalendarEvent, TimeRange } from '../services/calendar.service';
import { OAuth2Client } from 'google-auth-library';

export class CalendarController {
  private calendarService: CalendarService;

  constructor(oauth2Client: OAuth2Client) {
    this.calendarService = new CalendarService(oauth2Client);
  }

  /**
   * Get user's calendar events within a time range
   */
  public getEvents = async (req: Request, res: Response) => {
    try {
      const { timeMin, timeMax, maxResults = 50, singleEvents = true, orderBy = 'startTime' } = req.query;
      
      if (!timeMin || !timeMax) {
        return res.status(400).json({ error: 'timeMin and timeMax are required query parameters' });
      }

      const events = await this.calendarService.getEvents(
        timeMin as string,
        timeMax as string,
        {
          maxResults: Number(maxResults),
          singleEvents: singleEvents === 'true',
          orderBy: orderBy as 'startTime' | 'updated'
        }
      );
      
      res.json(events);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
  };

  /**
   * Create a new calendar event
   */
  public createEvent = async (req: Request, res: Response) => {
    try {
      const eventData: Omit<CalendarEvent, 'id'> = req.body;
      
      if (!eventData.summary || !eventData.start || !eventData.end) {
        return res.status(400).json({ error: 'Missing required fields: summary, start, end' });
      }

      const event = await this.calendarService.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      res.status(500).json({ error: 'Failed to create calendar event' });
    }
  };

  /**
   * Update an existing calendar event
   */
  public updateEvent = async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const updates: Partial<CalendarEvent> = req.body;
      
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      const event = await this.calendarService.updateEvent(eventId, updates);
      res.json(event);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      res.status(500).json({ error: 'Failed to update calendar event' });
    }
  };

  /**
   * Delete a calendar event
   */
  public deleteEvent = async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      await this.calendarService.deleteEvent(eventId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      res.status(500).json({ error: 'Failed to delete calendar event' });
    }
  };

  /**
   * Get user's availability for scheduling
   */
  public getAvailability = async (req: Request, res: Response) => {
    try {
      const { timeMin, timeMax, duration, attendees } = req.query;
      
      if (!timeMin || !timeMax || !duration) {
        return res.status(400).json({ 
          error: 'timeMin, timeMax, and duration are required query parameters' 
        });
      }

      const attendeeList = typeof attendees === 'string' ? attendees.split(',') : [];
      const durationMinutes = parseInt(duration as string, 10);

      const availableSlots = await this.calendarService.findAvailableSlots(
        durationMinutes,
        timeMin as string,
        timeMax as string,
        attendeeList,
        15, // 15 minutes buffer before
        15  // 15 minutes buffer after
      );
      
      res.json({ availableSlots });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({ error: 'Failed to check availability' });
    }
  };

  /**
   * Schedule a meeting at the next available time
   */
  public scheduleMeeting = async (req: Request, res: Response) => {
    try {
      const { 
        summary, 
        duration, 
        attendees = [],
        timeMin,
        timeMax,
        timeZone = 'UTC',
        description = '',
        location = ''
      } = req.body;
      
      if (!summary || !duration) {
        return res.status(400).json({ 
          error: 'summary and duration are required fields' 
        });
      }

      const event = await this.calendarService.scheduleMeeting(
        summary,
        parseInt(duration, 10),
        attendees,
        {
          timeMin,
          timeMax,
          timeZone,
          description,
          location
        }
      );
      
      res.status(201).json(event);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to schedule meeting' 
      });
    }
  };

  /**
   * Get free/busy information for the user's calendar
   */
  public getFreeBusy = async (req: Request, res: Response) => {
    try {
      const { timeMin, timeMax, calendarIds } = req.query;
      
      if (!timeMin || !timeMax) {
        return res.status(400).json({ 
          error: 'timeMin and timeMax are required query parameters' 
        });
      }

      const calendarIdList = typeof calendarIds === 'string' 
        ? calendarIds.split(',')
        : ['primary'];

      const freeBusy = await this.calendarService.getFreeBusy(
        timeMin as string,
        timeMax as string,
        calendarIdList
      );
      
      res.json(freeBusy);
    } catch (error) {
      console.error('Error getting free/busy information:', error);
      res.status(500).json({ error: 'Failed to get free/busy information' });
    }
  };

  /**
   * Get a specific calendar event by ID
   */
  public getEvent = async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      const event = await this.calendarService.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json(event);
    } catch (error) {
      console.error('Error getting calendar event:', error);
      res.status(500).json({ error: 'Failed to get calendar event' });
    }
  };

  /**
   * Get the user's primary calendar timezone
   */
  public getCalendarTimezone = async (req: Request, res: Response) => {
    try {
      const timezone = await this.calendarService.getCalendarTimezone();
      res.json({ timezone });
    } catch (error) {
      console.error('Error getting calendar timezone:', error);
      res.status(500).json({ error: 'Failed to get calendar timezone' });
    }
  };
}
