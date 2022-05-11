import {
  Avatar,
  Box,
  Flex,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import SimpleSidebar from "~/components/Sidebar";
import authenticator from "~/services/auth.server";
import EventManager from "~/services/events.server";
import { createUser } from "~/services/user.server";
import type { Tournament } from "~/types";

export const loader: LoaderFunction = async ({ request, params }) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  await createUser();
  const tournamentId = params.eventId;
  if (!tournamentId) {
    return null;
  }
  return json<Tournament>(await EventManager.fetchEventById(tournamentId));
};

export default function SingleEvent() {
  const tournament: Tournament = useLoaderData();
  const [course] = Object.keys(tournament.courses);
  console.debug("$$$", tournament);
  return (
    <SimpleSidebar>
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
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Posición</Th>
                <Th>Jugador</Th>
                <Th>Total</Th>
                <Th>Score</Th>
                <Th>Hoyo</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tournament.competitors
                ?.sort((a, b) => {
                  return (
                    parseInt(a.pos.replace("T", "")) -
                    parseInt(b.pos.replace("T", ""))
                  );
                })
                .map((competitor) => (
                  <Tr key={competitor.id}>
                    <Td>{competitor.pos}</Td>
                    <Td>
                      <Flex alignItems={"center"}>
                        <Avatar src={competitor.img} />
                        <Text ml="2" fontWeight={"bold"}>
                          {competitor.name}
                        </Text>
                      </Flex>
                    </Td>
                    <Td>{competitor.toPar}</Td>
                    <Td>{competitor.today}</Td>
                    <Td>{competitor.thru}</Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </SimpleSidebar>
  );
}
