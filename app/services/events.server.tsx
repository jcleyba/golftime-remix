import type { ScheduledEvent, Tournament } from "~/types";

import isThisWeek from "date-fns/isThisWeek";
import isSameWeek from "date-fns/isSameWeek";
import isAfter from "date-fns/isAfter";

// Singleton to access events
class EventManager {
  events: ScheduledEvent[];
  constructor() {
    this.events = [];
  }

  async getEvents(): Promise<ScheduledEvent[]> {
    try {
      if (this.events.length) return this.events;

      const data = await fetch(`${process.env.EVENTS_ENDPOINT}`);
      console.debug("$$$ fetching");
      if (!data.ok) {
        throw Error("Failed to fetch current tournament");
      }

      const { events }: { events: ScheduledEvent[] } = await data.json();

      this.events = events.reduce((memo: any[], event: any) => {
        if (event?.link) {
          const id = event?.link?.split("=")[1];
          const flag = event?.athlete?.flag?.replace(
            ".com",
            ".com/combiner/i?img="
          );

          memo.push({
            id,
            ...event,
            athlete: {
              ...event.athlete,
              flag,
            },
            location: event?.locations?.[0]?.venue?.fullName,
          });
        }

        return memo;
      }, []);
    } catch (e) {
      console.error(e);
    }

    return this.events;
  }

  async getActiveEvent() {
    try {
      const eventList = await this.getEvents();
      if (!eventList?.length) return null;

      return eventList?.find(
        (item: any) =>
          isThisWeek(new Date(item.startDate), { weekStartsOn: 2 }) &&
          item.description !== "Canceled"
      );
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  async getNextActiveEvent() {
    try {
      const eventList = await this.getEvents();
      if (!eventList?.length) return null;

      const event = eventList?.find(
        (item: any) =>
          item.status === "pre" &&
          !isThisWeek(new Date(item.startDate), { weekStartsOn: 1 }) &&
          isAfter(new Date(item.startDate), new Date()) &&
          item.description !== "Canceled"
      );
      return event;
    } catch (e) {
      console.error(e);
    }
  }

  async getLastActiveEvent() {
    try {
      const eventList = await this.getEvents();
      if (!eventList?.length) return null;

      const index = eventList?.findIndex((item: any) => item.status !== "post");
      const current = eventList[index - 1];
      const secondary = eventList[index - 2];
      let match = false;
      if (current && secondary) {
        match = isSameWeek(
          new Date(current.startDate),
          new Date(secondary.startDate)
        );
      }

      if (match) {
        return current.isMaj ? current : secondary;
      }

      return current;
    } catch (e) {
      console.error(e);
    }
  }

  fetchEventById: (id: string) => Promise<Tournament> = async (id) => {
    const data = await fetch(`${process.env.LEADERBOARD_ENDPOINT}${id}`);

    if (!data.ok) {
      throw Error("Failed to fetch tournament");
    }

    const { leaderboard } = await data.json();

    return leaderboard as Tournament;
  };

  fetchCurrentEvent: () => Promise<Tournament> = async () => {
    const data = await fetch(`${process.env.LEADERBOARD_ENDPOINT}`);

    if (!data.ok) {
      throw Error("Failed to fetch current tournament");
    }

    const { leaderboard } = await data.json();

    return leaderboard as Tournament;
  };
}

export default new EventManager();
