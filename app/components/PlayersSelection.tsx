import { Avatar, Button, Flex, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { IoAddCircle, IoRemoveCircle } from "react-icons/io5";
import type { Competitor, Tournament } from "~/types";

export const PlayerSelection = ({
  onSelect,
  tournament,
  selection,
}: {
  onSelect: (player: Record<string, Competitor>) => void;
  tournament: Tournament;
  selection: Record<string, Competitor>;
}) => {
  const addPlayer = useCallback(
    (player: Competitor) => {
      onSelect({ ...selection, [player.id]: player });
    },
    [onSelect, selection]
  );

  const removePlayer = useCallback(
    (player: Competitor) => {
      const { [player.id]: removed, ...rest } = selection;
      onSelect(rest);
    },
    [onSelect, selection]
  );

  return (
    <SimpleGrid minChildWidth="120px" spacing="40px">
      {tournament.competitors.map((player: Competitor) => {
        return (
          <Flex
            flexDir="column"
            key={player.id}
            justifyContent="space-between"
            alignItems="center"
            minH={180}
          >
            <Avatar src={player.img} size="lg" />
            <Text ml="2" fontWeight={"bold"} textAlign="center">
              {player.name}
            </Text>
            {selection[player.id] ? (
              <Button
                onClick={() => removePlayer(player)}
                leftIcon={<Icon as={IoRemoveCircle} />}
                colorScheme="red"
              >
                Borrar
              </Button>
            ) : (
              <Button
                onClick={() => addPlayer(player)}
                leftIcon={<Icon as={IoAddCircle} />}
                colorScheme="green"
              >
                Agregar
              </Button>
            )}
          </Flex>
        );
      })}
    </SimpleGrid>
  );
};
