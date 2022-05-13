import { Avatar, Flex, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import type { Competitor } from "~/types";

export type FoursomeType = Record<
  string,
  Pick<Competitor, "img" | "name" | "id"> & { pos?: string }
>;

export const Foursome = ({ foursome }: { foursome: FoursomeType }) => {
  return (
    <>
      <Heading fontSize={20}>Mi Foursome</Heading>
      {isEmpty(foursome) ? (
        <Flex
          flexDir="column"
          justifyContent="space-around"
          alignItems="center"
          minH={120}
        >
          <Avatar src={""} size="lg" />
          <Text ml="2" fontWeight={"bold"} textAlign="center">
            Elija jugador
          </Text>
        </Flex>
      ) : (
        <SimpleGrid spacing="40px" columns={4}>
          {Object.keys(foursome).map((id) => (
            <Flex
              flexDir="column"
              key={id}
              justifyContent="space-around"
              alignItems="center"
              minH={120}
            >
              <Avatar src={foursome[id].img} size="lg" />
              <Text ml="2" fontWeight={"bold"} textAlign="center">
                {foursome[id].name}
              </Text>
              <Text ml="2" fontWeight={"bold"} textAlign="center">
                {foursome[id].pos}
              </Text>
            </Flex>
          ))}
        </SimpleGrid>
      )}
    </>
  );
};

function isEmpty(
  obj: Record<string, Pick<Competitor, "img" | "name">>
): boolean {
  for (const _key in obj) {
    return false;
  }
  return true;
}
