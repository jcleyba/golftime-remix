import { Box } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import EventCardItem from "~/components/EventCardItem";
import SimpleSidebar from "~/components/Sidebar";
import { useSearchBar } from "~/hooks";
import authenticator from "~/services/auth.server";
import EventsManager from "~/services/events.server";
import type { ScheduledEvent, User } from "~/types";

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
  const [SearchBar, filteredEvents] = useSearchBar(
    events,
    (e) => (event) =>
      event.name.toLowerCase().includes(e.target.value.toLowerCase()),
    true
  );

  return (
    <SimpleSidebar>
      <Box>
        <SearchBar />
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
