import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";
import SimpleSidebar from "~/components/Sidebar";
import authenticator from "~/services/auth.server";
import { createGroup, getGroupsForMember } from "~/services/groups.server";
import type { User } from "~/types";

interface LoaderData {
  groups: { id: string; name: string }[];
  user: User | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  let groups = [];

  if (user?.email) {
    groups = await getGroupsForMember(user.email);
  }

  return json<LoaderData>({ groups, user });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const userId = (await formData.get("userId")) as string;

  const groupName = (await formData.get("groupName")) as string;

  await createGroup(groupName, userId);

  return null;
};

export default function MyGroups() {
  const { groups, user } = useLoaderData<LoaderData>();
  const transition = useTransition();

  return (
    <SimpleSidebar>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
        marginBottom="5"
      >
        <Heading fontSize={"2xl"} fontFamily={"body"} marginBottom="2">
          Crear Grupo
        </Heading>
        <Form method="post">
          <Flex>
            <Input
              placeholder="Nombre del Grupo"
              name="groupName"
              marginRight="2"
            />
            <Input hidden name="userId" defaultValue={user?.email} />
            <Button
              bg={"green.400"}
              color={"white"}
              _hover={{
                bg: "green.500",
              }}
              type="submit"
              isLoading={transition.state === "submitting"}
            >
              Guardar
            </Button>
          </Flex>
        </Form>
      </Box>
      <SimpleGrid columns={2} spacing={10}>
        {groups.map(({ name, id }) => (
          <Flex
            key={id}
            marginBottom="2"
            rounded={"lg"}
            bg={"white"}
            boxShadow={"lg"}
            p={8}
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading fontSize={"lg"}>{name}</Heading>
            <Button as={Link} to={`/groups/${id}`}>
              Ver Grupo
            </Button>
          </Flex>
        ))}
      </SimpleGrid>
    </SimpleSidebar>
  );
}
