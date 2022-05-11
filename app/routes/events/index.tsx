import { Box } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import EventCardItem from "~/components/EventCardItem";
import SimpleSidebar from "~/components/Sidebar";
import authenticator from "~/services/auth.server";
import EventsManager from "~/services/events.server";
import type { ScheduledEvent } from "~/types";

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return json<ScheduledEvent[]>(await EventsManager.getEvents());
};

export default function Events() {
  const events: ScheduledEvent[] = useLoaderData();

  return (
    <SimpleSidebar>
      <Box>
        {events.map((event) => (
          <EventCardItem
            id={event.link?.split("=")?.[1]}
            key={event.link?.split("=")?.[1] || event.name}
            event={event}
          ></EventCardItem>
        ))}
      </Box>
    </SimpleSidebar>
  );
}
