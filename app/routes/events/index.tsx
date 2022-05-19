import { Box } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useCallback, useState } from "react";
import EventCardItem from "~/components/EventCardItem";
import { SearchBar } from "~/components/SearchBar";
import SimpleSidebar from "~/components/Sidebar";
import authenticator from "~/services/auth.server";
import EventsManager from "~/services/events.server";
import type { User } from "~/services/session.server";
import type { ScheduledEvent } from "~/types";

interface LoaderData {
  events: ScheduledEvent[];
  user: User | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return json<LoaderData>({
    events: await EventsManager.getEvents(),
    user,
  });
};

export default function Events() {
  const { events, user } = useLoaderData<LoaderData>();
  const [filteredEvents, setFilteredEvents] = useState(events);

  const filter = useCallback(
    (e) => {
      setFilteredEvents(
        events.filter((event) =>
          event.name.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    },
    [setFilteredEvents, events]
  );

  return (
    <SimpleSidebar>
      <Box>
        <SearchBar filter={filter} />
        {filteredEvents.map((event) => (
          <EventCardItem
            id={event.link?.split("=")?.[1]}
            key={event.link?.split("=")?.[1] || event.name}
            event={event}
            userId={user?.id}
          ></EventCardItem>
        ))}
      </Box>
    </SimpleSidebar>
  );
}
