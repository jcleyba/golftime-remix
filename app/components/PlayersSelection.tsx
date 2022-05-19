import { Avatar, Button, Flex, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { IoAddCircle, IoRemoveCircle } from "react-icons/io5";
import type { Competitor } from "~/types";
import type { FoursomeType } from "./Foursome";

export const PlayerSelection = ({
  onSelect,
  competitors,
  selection,
}: {
  onSelect: (player: FoursomeType) => void;
  competitors: Competitor[];
  selection: FoursomeType;
}) => {
  const addPlayer = useCallback(
    (player: Competitor) => {
      onSelect({
        ...selection,
        [player.id]: {
          img: player.img,
          id: player.id,
          name: player.name,
          pos: player.pos,
        },
      });
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
      {competitors.map((player: Competitor) => {
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
                disabled={Object.keys(selection).length === 4}
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
