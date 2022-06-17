import type { Competitor, ScheduledEvent, Tournament } from "~/types";

import isThisWeek from "date-fns/isThisWeek";
import isSameWeek from "date-fns/isSameWeek";
import isAfter from "date-fns/isAfter";
import { sendTeeTimes } from "./email.server";
import { UserEntity } from "~/entities/User";
import { hasMailBeenSent } from "./imap.server";

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

  async getActiveEvent(): Promise<ScheduledEvent | undefined | null> {
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
    }
  }

  async getNextActiveEvent(): Promise<ScheduledEvent | undefined | null> {
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

    return {
      ...leaderboard,
      competitors: leaderboard.competitors.map((comp: Competitor) => ({
        ...comp,
        img: `${comp?.img?.replace(
          ".com",
          ".com/combiner/i?img="
        )}&w=224&scale=crop&cquality=40`,
      })),
    } as Tournament;
  };

  fetchCurrentEvent: () => Promise<Tournament> = async () => {
    const currentEvent = await this.getActiveEvent();

    if (!currentEvent?.id) {
      throw Error("Failed to fetch current tournament");
    }

    return await this.fetchEventById(currentEvent.id);
  };

  async verifyTeeTimes() {
    try {
      const mailSent = await hasMailBeenSent();
      const nextEvent = await this.getActiveEvent();
      console.debug("Mail sent: ", mailSent);

      if (!mailSent && nextEvent?.status === "pre") {
        const next = await this.fetchEventById(nextEvent.id);
        if (next?.competitors?.length) {
          const { Items: rows } = await UserEntity.query("User#Current");

          await sendTeeTimes(
            rows.map((row: { email: string }) => row.email),
            nextEvent.id,
            next.name
          );
        }
      }

      return true;
    } catch (e) {
      return e;
    }
  }
}

export default new EventManager();
