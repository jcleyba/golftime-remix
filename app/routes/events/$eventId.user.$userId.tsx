import { Box, Heading, Text, useColorModeValue } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import keyBy from "lodash.keyby";
import { useCallback, useState } from "react";
import type { FoursomeType } from "~/components/Foursome";
import { Foursome } from "~/components/Foursome";
import { Leaderboard } from "~/components/Leaderboard";
import { PlayerSelection } from "~/components/PlayersSelection";
import SimpleSidebar from "~/components/Sidebar";
import authenticator from "~/services/auth.server";
import type { Bet } from "~/services/bet.server";
import { currentBet } from "~/services/bet.server";
import EventManager from "~/services/events.server";
import type { Tournament } from "~/types";

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { eventId: tournamentId, userId } = params;

  if (!tournamentId || !userId) {
    return null;
  }

  const [tournament, liveBet] = await Promise.all([
    EventManager.fetchEventById(tournamentId),
    currentBet(tournamentId, userId || user?.id),
  ]);

  const positionsByPlayer = keyBy(tournament.competitors, "id");

  return json<{ tournament: Tournament; liveBet: FoursomeType | null }>({
    tournament: {
      ...tournament,
      competitors: tournament.competitors?.sort(
        (a, b) =>
          parseInt(a.pos.replace("T", "")) - parseInt(b.pos.replace("T", ""))
      ),
    },
    liveBet: (liveBet?.players || []).reduce((acc: any, pl: any) => {
      //@ts-ignore
      acc[pl.id] = positionsByPlayer[pl.id];
      return acc;
    }, {}),
  });
};

export default function SingleEvent() {
  const { tournament, liveBet } = useLoaderData<{
    tournament: Tournament;
    liveBet: Bet | null;
  }>();
  const [course] = Object.keys(tournament.courses);
  const [foursome, setFoursome] = useState<FoursomeType | {}>(liveBet || {});
  const submit = useSubmit();

  const saveDate = useCallback(
    (foursome: FoursomeType) => {
      let data: Record<string, string> = Object.keys(foursome).reduce(
        (acc: Record<string, string>, item) => {
          acc[item] = JSON.stringify(foursome[item]);

          return acc;
        },
        {}
      );

      setFoursome(foursome);
      submit(data, { method: "post", action: `/events/${tournament.id}` });
    },
    [setFoursome, submit, tournament]
  );

  return (
    <SimpleSidebar>
      <Box
        w={"full"}
        bg={useColorModeValue("white", "gray.900")}
        boxShadow={"2xl"}
        rounded={"lg"}
        p={6}
        my={2}
      >
        <Foursome foursome={foursome} />
      </Box>

      <Box
        w={"full"}
        bg={useColorModeValue("white", "gray.900")}
        boxShadow={"2xl"}
        rounded={"lg"}
        p={6}
      >
        <Heading marginY={5}>{tournament.name}</Heading>
        {tournament?.courses[course].nm && (
          <Heading variant={"h3"} fontSize="md" marginY={5}>
            {tournament?.courses[course].nm}
          </Heading>
        )}
        {tournament.status !== "pre" && tournament.competitors ? (
          <Leaderboard tournament={tournament} />
        ) : tournament.competitors ? (
          <Form>
            <PlayerSelection
              tournament={tournament}
              onSelect={saveDate}
              selection={foursome}
            />
          </Form>
        ) : (
          <Text>Torneo sin jugadores</Text>
        )}
      </Box>
    </SimpleSidebar>
  );
}
