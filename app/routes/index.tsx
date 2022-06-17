import {
  Avatar,
  Button,
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
import { currentBet, betsByEventId } from "~/services/bet.server";
import EventsManager from "~/services/events.server";
import type { User, Bet } from "~/types";
import { listUsers } from "~/services/user.server";
import type { Competitor, ScheduledEvent, Tournament } from "~/types";
import type { MetaFunction } from "@remix-run/node"; // or "@remix-run/cloudflare"
import { calculateLiveBetPoints } from "~/utils";

interface LoaderData {
  currentUser: User | null;
  currentEvent: Tournament;
  users: User[];
  nextEvent: ScheduledEvent | null | undefined;
  lastWinner: { points: number; user: User };
  liveBet: Bet | null;
  liveResultsByUser: Record<string, number> | null;
}

export const meta: MetaFunction = () => {
  return {
    title: "Golftime",
    description: "El prode/fantasy del PGA Tour",
  };
};

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

  const [liveBet, lastEventResults, currentBets] = await Promise.all([
    currentBet(currentEvent?.id, currentUser?.legacyId),
    betsByEventId(lastEvent?.id),
    betsByEventId(currentEvent?.id),
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
    user: users.find((u: User) => lastEventResults[0]?.userId === u.legacyId),
  };

  return json<LoaderData>({
    currentUser,
    currentEvent,
    users,
    nextEvent,
    lastWinner,
    liveBet,
    liveResultsByUser:
      currentEvent.status === "in"
        ? calculateLiveBetPoints(currentBets, currentEvent)
        : null,
  });
};

export const action: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/login" });
};

export default function DashboardPage() {
  const {
    currentUser,
    currentEvent,
    users,
    nextEvent,
    liveBet,
    lastWinner,
    liveResultsByUser,
  } = useLoaderData<LoaderData>();
  const colorValue = useColorModeValue("white", "gray.900");
  const { id: currentEventId, status, name, competitors } = currentEvent;

  const positionsByPlayer = keyBy(competitors, "id");
  const foursome = (liveBet?.players || []).reduce(
    (acc: Record<string, Competitor>, pl) => {
      acc[pl.id] = positionsByPlayer[pl.id];
      return acc;
    },
    {}
  );

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
            <EventCardItem id={nextEvent.id} event={nextEvent} />
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
            <Flex alignItems="center" justifyContent="space-between">
              <Text>{name}</Text>
              <Button
                bg={"green.400"}
                color={"white"}
                _hover={{
                  bg: "green.500",
                }}
                as={Link}
                to={`/events/${currentEventId}/user/${currentUser?.legacyId}`}
              >
                {status === "pre" && competitors.length
                  ? "Elegir jugadores"
                  : "Ver Torneo"}
              </Button>
            </Flex>
          }
          columns={[
            { Header: "Pos", accessor: "pos" },
            {
              Header: "Player",
              Cell: ({ row }) => (
                <Flex alignItems={"center"}>
                  <Avatar
                    src={row.original.img}
                    size="sm"
                    name={row.original.name}
                  />
                  <Text fontWeight={"600"} marginLeft={2}>
                    {row.original.name}
                  </Text>
                </Flex>
              ),
            },
            { Header: "Total", accessor: "toPar" },
            { Header: "Score", accessor: "today" },
          ]}
          data={competitors || []}
        />

        <MiniTable
          title="Posiciones"
          columns={[
            {
              Header: "Usuario",
              Cell: ({ row }) => (
                <Text fontWeight={"600"} marginLeft={2}>
                  {status !== "in" ? (
                    `${row.original.firstName} ${row.original.lastName}`
                  ) : (
                    <Link
                      to={`/events/${currentEventId}/user/${row.original.legacyId}`}
                    >
                      {row.original.firstName} {row.original.lastName}
                    </Link>
                  )}
                </Text>
              ),
            },
            ...(liveResultsByUser
              ? [
                  {
                    Header: "Live",
                    Cell: ({ row }: { row: { original: User } }) => (
                      <Text fontWeight={"600"}>
                        {liveResultsByUser[row.original.legacyId || ""]}
                      </Text>
                    ),
                  },
                ]
              : []),

            { Header: "Puntos", accessor: "points" },
          ]}
          data={users}
        />
      </SimpleGrid>
      <Text textAlign="center">Copyright @{new Date().getFullYear()}</Text>
    </SimpleSidebar>
  );
}
