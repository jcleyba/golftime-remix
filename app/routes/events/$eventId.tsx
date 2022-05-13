import { Box, Heading, Text, useColorModeValue } from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { useCallback, useState } from "react";
import { Foursome } from "~/components/Foursome";
import { Leaderboard } from "~/components/Leaderboard";
import { PlayerSelection } from "~/components/PlayersSelection";
import SimpleSidebar from "~/components/Sidebar";
import authenticator from "~/services/auth.server";
import EventManager from "~/services/events.server";
import type { Competitor, Tournament } from "~/types";

export const loader: LoaderFunction = async ({ request, params }) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const tournamentId = params.eventId;
  if (!tournamentId) {
    return null;
  }
  const tournament = await EventManager.fetchEventById(tournamentId);

  return json<Tournament>({
    ...tournament,
    competitors: tournament.competitors?.sort(
      (a, b) =>
        parseInt(a.pos.replace("T", "")) - parseInt(b.pos.replace("T", ""))
    ),
  });
};

export const action: ActionFunction = async ({ request }) => {
  console.log("$$$", await request.formData());

  return null;
};

type FoursomeType = Record<string, Competitor>;

export default function SingleEvent() {
  const tournament: Tournament = useLoaderData();
  const [course] = Object.keys(tournament.courses);
  const [foursome, setFoursome] = useState<FoursomeType>({});
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
