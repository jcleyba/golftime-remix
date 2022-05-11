import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import authenticator from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const error = session.get("sessionErrorKey");

  return json<any>({ error });
};

export const action: ActionFunction = async ({ request, context }) => {
  // call my authenticator
  const resp = await authenticator.authenticate("form", request, {
    successRedirect: "/",
    failureRedirect: "/login",
    throwOnError: true,
    context,
  });

  return resp;
};

export default function LoginPage() {
  // if i got an error it will come back with the loader data
  const { error } = useLoaderData();
  const transition = useTransition();

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Sign in to your account</Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            to enjoy all of our cool <Link color={"blue.400"}>features</Link> ✌️
          </Text>
        </Stack>
        <Form method="post">
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            {error?.message && (
              <Alert status="error">
                <AlertIcon />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
            <Stack spacing={4}>
              <FormControl id="email">
                <FormLabel>Email address</FormLabel>
                <Input type="email" name="email" />
              </FormControl>
              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input type="password" name="password" />
              </FormControl>
              <Stack spacing={10}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                >
                  <Checkbox>Remember me</Checkbox>
                  <Link color={"blue.400"}>Forgot password?</Link>
                </Stack>
                <Button
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  type="submit"
                  isLoading={!!transition.submission}
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Form>
      </Stack>
    </Flex>
  );
}
