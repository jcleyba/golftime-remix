import { Box, Heading, Text, useColorModeValue } from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useParams, useSubmit } from "@remix-run/react";
import keyBy from "lodash.keyby";
import { useCallback, useState } from "react";
import type { FoursomeType } from "~/components/Foursome";
import { Foursome } from "~/components/Foursome";
import { Leaderboard } from "~/components/Leaderboard";
import { PlayerSelection } from "~/components/PlayersSelection";
import { SearchBar } from "~/components/SearchBar";
import SimpleSidebar from "~/components/Sidebar";
import authenticator from "~/services/auth.server";
import { currentBet, saveBet } from "~/services/bet.server";
import EventManager from "~/services/events.server";
import type { Competitor, Tournament } from "~/types";

interface LoaderData {
  tournament: Tournament;
  liveBet: FoursomeType | null;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const tournamentId = params.eventId;
  const userId = params.userId;

  if (!tournamentId || !userId) {
    return null;
  }

  const [tournament, liveBet] = await Promise.all([
    EventManager.fetchEventById(tournamentId),
    currentBet(tournamentId, userId),
  ]);

  const positionsByPlayer = keyBy(tournament.competitors, "id");

  return json<LoaderData>({
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

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const players = (await data.get("players")) as string;
  const userId = (await data.get("userId")) as string;
  const eventId = (await data.get("eventId")) as string;

  await saveBet(eventId, userId, JSON.parse(players));

  return null;
};

export default function SingleEvent() {
  const { tournament, liveBet } = useLoaderData<LoaderData>();
  const [foursome, setFoursome] = useState<FoursomeType | {}>(liveBet || {});
  const [competitors, setCompetitors] = useState<Competitor[]>(
    tournament.competitors || []
  );
  const submit = useSubmit();
  const params = useParams();

  const [course] = Object.keys(tournament.courses);

  const saveDate = useCallback(
    (foursome: FoursomeType) => {
      const formData = new FormData();

      formData.append("players", JSON.stringify(Object.values(foursome)));
      formData.append("eventId", tournament.id);
      formData.append("userId", params.userId || "");

      setFoursome(foursome);
      setCompetitors(tournament.competitors);
      submit(formData, {
        method: "post",
        action: `/events/${tournament.id}/user/${params.userId}`,
      });
    },
    [setFoursome, submit, tournament, params.userId]
  );

  const filter = useCallback(
    (e) => {
      setCompetitors(
        tournament.competitors?.filter((comp) =>
          comp.name.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    },
    [setCompetitors, tournament]
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
            <Box marginY="5">
              <SearchBar filter={filter} variant="outline" />
            </Box>
            <PlayerSelection
              competitors={competitors}
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
