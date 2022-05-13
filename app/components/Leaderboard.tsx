import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Flex,
  Avatar,
  Text,
} from "@chakra-ui/react";
import type { Tournament } from "~/types";

export const Leaderboard = ({ tournament }: { tournament: Tournament }) => {
  return (
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
          {tournament.competitors.map((competitor) => (
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
  );
};
