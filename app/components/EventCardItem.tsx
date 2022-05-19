import {
  Badge,
  Box,
  Button,
  Center,
  Heading,
  Image,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import type { ScheduledEvent } from "~/types";

export default function EventCardItem({
  event,
  id,
  userId = "",
}: {
  event: ScheduledEvent;
  id: string;
  userId?: string;
}) {
  const badgeBg = useColorModeValue("gray.50", "gray.800");

  return (
    <Center py={2} minH="100%">
      <Box
        maxW={"640px"}
        w={"full"}
        bg={useColorModeValue("white", "gray.900")}
        boxShadow={"2xl"}
        rounded={"lg"}
        p={6}
        textAlign={"center"}
      >
        <Heading fontSize={"2xl"} fontFamily={"body"}>
          {event.name}
        </Heading>
        <Text
          textAlign={"center"}
          color={useColorModeValue("gray.700", "gray.400")}
          px={3}
        >
          {event.locations[0]?.venue.fullName}
        </Text>

        <Stack align={"center"} justify={"center"} direction={"row"} mt={6}>
          <Image src={event.athlete.flag} maxW="10" />
          <Text>{event.athlete.name}</Text>
          {event.purse && (
            <Badge fontSize="md" px={4} py={1} bg={badgeBg} fontWeight={"400"}>
              {event.purse}
            </Badge>
          )}
        </Stack>

        <Stack mt={8} direction={"row"} spacing={4}>
          <Button
            flex={1}
            fontSize={"sm"}
            rounded={"full"}
            bg={"green.400"}
            color={"white"}
            boxShadow={
              "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
            }
            _hover={{
              bg: "green.500",
            }}
            _focus={{
              bg: "green.500",
            }}
            as={Link}
            to={`/events/${id}/user/${userId}`}
          >
            Leaderboard
          </Button>
        </Stack>
      </Box>
    </Center>
  );
}
