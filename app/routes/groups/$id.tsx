import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import keyBy from "lodash.keyby";
import { useEffect } from "react";
import { MiniTable } from "~/components/MiniTable";
import SimpleSidebar from "~/components/Sidebar";
import { useSearchBar } from "~/hooks";
import authenticator from "~/services/auth.server";
import EventsManager from "~/services/events.server";
import {
  addMember,
  getMembersForGroup,
  removeMember,
} from "~/services/groups.server";
import { getUsersByEmail, listUsers } from "~/services/user.server";
import type { Tournament, User } from "~/types";

interface LoaderData {
  allUsers: User[];
  groupName: string;
  users: User[];
  currentEvent: Tournament | null;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { id } = params;

  if (!id) {
    return null;
  }

  const members = await getMembersForGroup(id);

  const [users, currentEvent, allUsers] = await Promise.all([
    getUsersByEmail(members.map(({ email }: { email: string }) => email)),
    EventsManager.fetchCurrentEvent(),
    listUsers(),
  ]);

  return json<LoaderData>({
    users,
    currentEvent,
    groupName: members[0]?.groupName,
    allUsers,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;

  if (!id) {
    return null;
  }

  const formData = await request.formData();
  const email = (await formData.get("email")) as string;
  const groupName = (await formData.get("groupName")) as string;
  const isAdd = (await formData.get("add")) as string;

  if (isAdd) {
    await addMember(id, email, groupName);
  } else {
    await removeMember(id, email);
  }

  return "success";
};

export default function Group() {
  const { allUsers, users, currentEvent, groupName } =
    useLoaderData<LoaderData>();
  const transition = useTransition();
  const actionData = useActionData();
  const usersMap = keyBy(users, "email");

  const [SearchBar, foundUsers, reset] = useSearchBar<User>(
    allUsers,
    (e) => (user: User) =>
      (user.firstName.toLowerCase().includes(e.target.value.toLowerCase()) ||
        user.lastName.toLowerCase().includes(e.target.value.toLowerCase())) &&
      !usersMap[user.email]
  );

  useEffect(() => {
    if (actionData === "success") {
      reset();
    }
  }, [actionData, reset]);

  console.debug("$$$", foundUsers);

  return (
    <SimpleSidebar>
      <Heading>{groupName}</Heading>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
        marginBottom="5"
      >
        <Heading fontSize={"lg"} marginBottom="5">
          Agregar Miembros
        </Heading>
        <SearchBar variant="outline" />
        {foundUsers.map((user) => (
          <Form method="post" key={user.legacyId}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              marginY="5"
            >
              <Text>
                {user.firstName} {user.lastName}
                <Input name="email" hidden value={user.id} />
                <Input name="add" hidden value={"add"} />
                <Input name="groupName" hidden value={groupName} />
              </Text>
              <Button
                isLoading={transition.state === "submitting"}
                type="submit"
              >
                Agregar
              </Button>
            </Flex>
          </Form>
        ))}
      </Box>
      <MiniTable
        title={`Posiciones ${groupName}`}
        columns={[
          {
            Header: "Usuario",
            Cell: (props) => (
              <Text fontWeight={"600"} marginLeft={2}>
                {currentEvent?.status !== "in" ? (
                  `${props.row.original.firstName} ${props.row.original.lastName}`
                ) : (
                  <Link
                    to={`/events/${currentEvent?.id}/user/${props.row.original.legacyId}`}
                  >
                    {props.row.original.firstName} {props.row.original.lastName}
                  </Link>
                )}
              </Text>
            ),
          },
          { Header: "Puntos", accessor: "points" },
          {
            Header: "Acciones",
            Cell: (props) => (
              <Form method="post">
                <Input name="email" hidden value={props.row.original.email} />
                <Button
                  bg={"red.400"}
                  color={"white"}
                  _hover={{
                    bg: "red.500",
                  }}
                  type="submit"
                  isLoading={transition.state === "submitting"}
                >
                  Quitar
                </Button>
              </Form>
            ),
          },
        ]}
        data={users}
      />
    </SimpleSidebar>
  );
}
