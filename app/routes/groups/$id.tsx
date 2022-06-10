import { Box, Heading, Text, useColorModeValue } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { MiniTable } from "~/components/MiniTable";
import SimpleSidebar from "~/components/Sidebar";
import authenticator from "~/services/auth.server";
import { getMembersForGroup } from "~/services/groups.server";
import { getUsersByEmail } from "~/services/user.server";
import type { Tournament, User } from "~/types";
import EventsManager from "~/services/events.server";

interface LoaderData {
  groupName: string;
  users: User[];
  currentEvent: Tournament | null;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { id } = params;

  if (!id) {
    return null;
  }

  const members = await getMembersForGroup(id);

  const [users, currentEvent] = await Promise.all([
    getUsersByEmail(members.map(({ email }: { email: string }) => email)),
    EventsManager.fetchCurrentEvent(),
  ]);

  return json<LoaderData>({
    users,
    currentEvent,
    groupName: members[0]?.groupName,
  });
};

export default function Group() {
  const { users, currentEvent, groupName } = useLoaderData<LoaderData>();

  return (
    <SimpleSidebar>
      <Heading>{groupName}</Heading>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
        marginBottom="5"
      >
        <Heading fontSize={"lg"}>Agregar Miembros</Heading>
      </Box>
      <MiniTable
        title="Posiciones"
        columns={[
          {
            Header: "Usuario",
            Cell: (props) => (
              <Text fontWeight={"600"} marginLeft={2}>
                {currentEvent?.status !== "in" ? (
                  `${props.row.original.firstName} ${props.row.original.lastName}`
                ) : (
                  <Link
                    to={`/events/${currentEvent?.id}/user/${props.row.original.legacyId}`}
                  >
                    {props.row.original.firstName} {props.row.original.lastName}
                  </Link>
                )}
              </Text>
            ),
          },
          { Header: "Puntos", accessor: "points" },
        ]}
        data={users}
      />
    </SimpleSidebar>
  );
}
