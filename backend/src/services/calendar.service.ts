import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{ email: string; responseStatus?: string }>;
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: { type: string };
    };
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
    conferenceSolution?: {
      name: string;
      iconUri: string;
    };
    conferenceId?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
  status?: string;
  htmlLink?: string;
  hangoutLink?: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface FreeBusyResponse {
  timeMin: string;
  timeMax: string;
  calendars: {
    [key: string]: {
      busy: TimeRange[];
    };
  };
}

export class CalendarService {
  private calendar: calendar_v3.Calendar;
  private calendarId: string = 'primary';

  constructor(private oauth2Client: OAuth2Client) {
    this.calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    });
  }

  /**
   * Create a new calendar event
   */
  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        conferenceDataVersion: 1,
        requestBody: {
          ...event,
          reminders: event.reminders || {
            useDefault: true,
          },
          conferenceData: event.conferenceData || {
            createRequest: {
              requestId: this.generateUuid(),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
      });

      return response.data as CalendarEvent;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId,
        requestBody: updates,
      });

      return response.data as CalendarEvent;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Get user's availability for a time range
   */
  async getFreeBusy(
    timeMin: string,
    timeMax: string,
    calendarIds: string[] = ['primary']
  ): Promise<FreeBusyResponse> {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          timeZone: 'UTC',
          items: calendarIds.map((id) => ({ id })),
        },
      });

      return response.data as FreeBusyResponse;
    } catch (error) {
      console.error('Error checking free/busy:', error);
      throw new Error('Failed to check calendar availability');
    }
  }

  /**
   * Find available time slots for scheduling a meeting
   */
  async findAvailableSlots(
    duration: number, // in minutes
    timeMin: string,
    timeMax: string,
    attendees: string[] = [],
    bufferBefore = 0, // in minutes
    bufferAfter = 0 // in minutes
  ): Promise<{ start: string; end: string }[]> {
    try {
      // Get busy slots for all attendees
      const freeBusy = await this.getFreeBusy(timeMin, timeMax, [
        'primary',
        ...attendees,
      ]);

      // Find available slots
      const availableSlots: { start: string; end: string }[] = [];
      const busySlots: TimeRange[] = [];

      // Combine busy slots from all calendars
      Object.values(freeBusy.calendars).forEach((calendar) => {
        if (calendar.busy) {
          busySlots.push(...calendar.busy);
        }
      });

      // Sort busy slots by start time
      busySlots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      // Find gaps between busy slots
      let currentTime = new Date(timeMin);
      const endTime = new Date(timeMax);

      for (const busySlot of busySlots) {
        const busyStart = new Date(busySlot.start);
        const busyEnd = new Date(busySlot.end);

        // Add buffer before and after busy slots
        const slotStart = new Date(busyStart.getTime() - bufferBefore * 60000);
        const slotEnd = new Date(busyEnd.getTime() + bufferAfter * 60000);

        // Check if there's enough time between current time and the next busy slot
        if (slotStart > currentTime) {
          const availableDuration = (slotStart.getTime() - currentTime.getTime()) / 60000; // in minutes
          if (availableDuration >= duration) {
            availableSlots.push({
              start: currentTime.toISOString(),
              end: slotStart.toISOString(),
            });
          }
        }

        // Move current time to the end of the busy slot
        currentTime = new Date(Math.max(currentTime.getTime(), slotEnd.getTime()));
      }

      // Check the time after the last busy slot
      if (endTime > currentTime) {
        const availableDuration = (endTime.getTime() - currentTime.getTime()) / 60000; // in minutes
        if (availableDuration >= duration) {
          availableSlots.push({
            start: currentTime.toISOString(),
            end: endTime.toISOString(),
          });
        }
      }

      return availableSlots;
    } catch (error) {
      console.error('Error finding available slots:', error);
      throw new Error('Failed to find available time slots');
    }
  }

  /**
   * Schedule a meeting by finding the next available slot
   */
  async scheduleMeeting(
    summary: string,
    duration: number, // in minutes
    attendees: string[],
    options: {
      timeMin?: string;
      timeMax?: string;
      timeZone?: string;
      description?: string;
      location?: string;
      bufferBefore?: number;
      bufferAfter?: number;
    } = {}
  ): Promise<CalendarEvent> {
    try {
      const {
        timeMin = new Date().toISOString(),
        timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
        timeZone = 'UTC',
        description = '',
        location = '',
        bufferBefore = 15, // 15 minutes buffer before
        bufferAfter = 15, // 15 minutes buffer after
      } = options;

      // Find available slots
      const availableSlots = await this.findAvailableSlots(
        duration,
        timeMin,
        timeMax,
        attendees,
        bufferBefore,
        bufferAfter
      );

      if (availableSlots.length === 0) {
        throw new Error('No available time slots found');
      }

      // Use the first available slot
      const slot = availableSlots[0];
      const start = new Date(slot.start);
      const end = new Date(start.getTime() + duration * 60000);

      // Create the event
      const event: Omit<CalendarEvent, 'id'> = {
        summary,
        description,
        location,
        start: {
          dateTime: start.toISOString(),
          timeZone,
        },
        end: {
          dateTime: end.toISOString(),
          timeZone,
        },
        attendees: attendees.map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: this.generateUuid(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: true,
        },
      };

      return this.createEvent(event);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      throw new Error('Failed to schedule meeting');
    }
  }

  /**
   * Generate a unique ID for conference requests
   */
  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
