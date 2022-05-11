import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MiniTable } from "~/components/MiniTable";
import SimpleSidebar from "~/components/Sidebar";
import authenticator from "~/services/auth.server";
import EventsManager from "~/services/events.server";
import type { User } from "~/services/session.server";
import { listUsers } from "~/services/user.server";
import type { Tournament } from "~/types";

export let loader: LoaderFunction = async ({ request }) => {
  const auth = authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const [, currentEvent, users] = await Promise.all([
    auth,
    EventsManager.fetchCurrentEvent(),
    listUsers(),
  ]);

  return json<{ currentEvent: Tournament | null; users: User[] }>({
    currentEvent,
    users,
  });
};

export const action: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/login" });
};

export default function DashboardPage() {
  const { currentEvent, users } = useLoaderData<{
    currentEvent: Tournament;
    users: User[];
  }>();

  return (
    <SimpleSidebar>
      <Flex justifyContent={"space-between"}>
        <Box>
          <MiniTable
            title="Leaderboard"
            columns={[
              { Header: "Pos", accessor: "pos" },
              {
                Header: "Player",
                Cell: (props) => (
                  <Flex alignItems={"center"}>
                    <Avatar src={props.row.original.img} size="sm" />
                    <Text fontWeight={"600"} marginLeft={2}>
                      {props.row.original.name}
                    </Text>
                  </Flex>
                ),
              },
              { Header: "Total", accessor: "toPar" },
              { Header: "Score", accessor: "thru" },
            ]}
            data={currentEvent?.competitors || []}
          />
        </Box>
        <Box>
          <MiniTable
            title="Posiciones"
            columns={[
              {
                Header: "Usuario",
                Cell: (props) => (
                  <Text fontWeight={"600"} marginLeft={2}>
                    {props.row.original.firstName} {props.row.original.lastName}
                  </Text>
                ),
              },
              { Header: "Puntos", accessor: "points" },
            ]}
            data={users}
          />
        </Box>
      </Flex>
    </SimpleSidebar>
  );
}
