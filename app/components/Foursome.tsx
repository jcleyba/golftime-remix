import {
  Avatar,
  Badge,
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import type { Competitor } from "~/types";

export type FoursomeType = Record<
  string,
  Pick<Competitor, "img" | "name" | "id"> & { pos?: string }
>;

export const Foursome = ({ foursome }: { foursome: FoursomeType }) => {
  const badgeBg = useColorModeValue("gray.50", "gray.800");

  const points = Object.keys(foursome).reduce((acc, key) => {
    const pos =
      (foursome[key].pos || "").replace("T", "").replace("-", "0") || "0";

    acc += parseInt(pos) ? 100 / parseInt(pos) : 0;
    return acc;
  }, 0);

  return (
    <>
      <Heading fontSize={20} marginBottom="10">
        Mi Foursome
      </Heading>
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
              <Avatar
                src={foursome[id].img}
                size="lg"
                name={foursome[id].name}
              />
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
      <Box textAlign="center">
        <Badge
          fontSize="md"
          px={4}
          py={1}
          bg={badgeBg}
          fontWeight={"600"}
          marginY="4"
          alignSelf={"center"}
        >
          Puntos: {points.toFixed(2)}
        </Badge>
      </Box>
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
