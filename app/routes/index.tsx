import {
  Avatar,
  Flex,
  GridItem,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import keyBy from "lodash.keyby";
import EventCardItem from "~/components/EventCardItem";
import { Foursome } from "~/components/Foursome";
import { MiniTable } from "~/components/MiniTable";
import SimpleSidebar from "~/components/Sidebar";
import authenticator from "~/services/auth.server";
import type { Bet } from "~/services/bet.server";
import { currentBet, lastEventBets } from "~/services/bet.server";
import EventsManager from "~/services/events.server";
import type { User } from "~/services/session.server";
import { listUsers } from "~/services/user.server";
import type { ScheduledEvent, Tournament } from "~/types";

export let loader: LoaderFunction = async ({ request }) => {
  const auth = authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  let [currentUser, users, currentEvent, nextEvent, lastEvent] =
    await Promise.all([
      auth,
      listUsers(),
      EventsManager.fetchCurrentEvent(),
      EventsManager.getNextActiveEvent(),
      EventsManager.getLastActiveEvent(),
    ]);

  const [liveBet, lastEventResults] = await Promise.all([
    currentBet(currentEvent?.id, currentUser?.id),
    lastEventBets(lastEvent?.id),
  ]);

  currentEvent = {
    ...currentEvent,
    competitors: currentEvent.competitors?.sort(
      (a, b) =>
        parseInt(a.pos.replace("T", "")) - parseInt(b.pos.replace("T", ""))
    ),
  };

  const lastWinner = {
    points: lastEventResults?.[0]?.result,
    user: users.find((u: User) => lastEventResults[0].userId === u.id),
  };

  return json<{
    currentUser: User | null;
    currentEvent: Tournament | null;
    users: User[];
    nextEvent: ScheduledEvent | null | undefined;
    lastWinner: { points: number; user: User };
    liveBet: Bet | null;
  }>({
    currentUser,
    currentEvent,
    users,
    nextEvent,
    lastWinner,
    liveBet,
  });
};

export const action: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/login" });
};

export default function DashboardPage() {
  const { currentUser, currentEvent, users, nextEvent, liveBet, lastWinner } =
    useLoaderData<{
      currentUser: User | null;
      currentEvent: Tournament;
      users: User[];
      nextEvent: ScheduledEvent | null | undefined;
      lastWinner: { points: number; user: User };
      liveBet: Bet | null;
    }>();
  const colorValue = useColorModeValue("white", "gray.900");
  const positionsByPlayer = keyBy(currentEvent.competitors, "id");
  const foursome = (liveBet?.players || []).reduce((acc, pl) => {
    //@ts-ignore
    acc[pl.id] = positionsByPlayer[pl.id];
    return acc;
  }, {});

  return (
    <SimpleSidebar>
      <SimpleGrid
        columnGap={{ sm: 0, md: 10 }}
        templateColumns={{
          base: "1fr",
          md: liveBet ? "1fr 2fr 1fr" : "1fr 1fr",
        }}
      >
        {lastWinner && (
          <Flex
            w={"full"}
            bg={colorValue}
            boxShadow={"2xl"}
            rounded={"lg"}
            p={6}
            my={2}
            flexDirection="column"
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading fontSize={24}>Último Ganador</Heading>
            <Heading variant={"h1"} fontSize={50}>
              ⛳
            </Heading>
            <Text fontSize={20} fontWeight="bold">
              {lastWinner.user?.firstName} {lastWinner.user?.lastName}
            </Text>
            <Text fontSize={15} fontWeight="bold">
              {lastWinner.points} Puntos
            </Text>
          </Flex>
        )}
        {liveBet && (
          <GridItem
            w={"full"}
            bg={colorValue}
            boxShadow={"2xl"}
            rounded={"lg"}
            p={6}
            my={2}
            display="flex"
            flexDir="column"
            justifyContent="space-around"
            alignItems="center"
          >
            <Foursome foursome={foursome} />
          </GridItem>
        )}
        {nextEvent && (
          <GridItem colSpan={1} minH="100%">
            <EventCardItem
              id={nextEvent.id}
              event={nextEvent}
              userId={currentUser?.id}
            />
          </GridItem>
        )}
      </SimpleGrid>
      <SimpleGrid
        columns={{ sm: 1, md: 2 }}
        columnGap={{ sm: 0, md: 30 }}
        marginY="10"
      >
        <MiniTable
          title={
            <Link
              style={{ textDecoration: "underline" }}
              to={`/events/${currentEvent.id}/user/${currentUser?.id}`}
            >
              {currentEvent.name}
            </Link>
          }
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
            { Header: "Score", accessor: "today" },
          ]}
          data={currentEvent?.competitors || []}
        />

        <MiniTable
          title="Posiciones"
          columns={[
            {
              Header: "Usuario",
              Cell: (props) => (
                <Text fontWeight={"600"} marginLeft={2}>
                  {currentEvent.status !== "in" ? (
                    `${props.row.original.firstName} ${props.row.original.lastName}`
                  ) : (
                    <Link
                      to={`/events/${currentEvent.id}/user/${props.row.original.id}`}
                    >
                      {props.row.original.firstName}{" "}
                      {props.row.original.lastName}
                    </Link>
                  )}
                </Text>
              ),
            },
            { Header: "Puntos", accessor: "points" },
          ]}
          data={users}
        />
      </SimpleGrid>
      <Text textAlign="center">Copyright @{new Date().getFullYear()}</Text>
    </SimpleSidebar>
  );
}
