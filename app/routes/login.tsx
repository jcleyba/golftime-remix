import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";
import authenticator from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
import Logo from "../assets/golftime.svg";

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
      <Stack
        spacing={8}
        mx={"auto"}
        minW={{ sm: "sm", md: "md" }}
        py={12}
        px={6}
      >
        <Stack align={"center"}>
          <Image src={Logo} maxW={275} marginX={5} alt="Golftime" />
        </Stack>

        <Stack align={"center"}>
          <Text fontSize={"lg"} color={"gray.600"}>
            Adelante y suerte! 🏌️‍♂️🏌️‍♀️
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
              <Alert status="error" marginY="5">
                <AlertIcon />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
            <Stack spacing={4}>
              <FormControl id="email">
                <FormLabel>Email</FormLabel>
                <Input type="email" name="email" />
              </FormControl>
              <FormControl id="password">
                <FormLabel>Contraseña</FormLabel>
                <Input type="password" name="password" />
              </FormControl>
              <Stack spacing={10}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                >
                  <Link to="/sign-up" color={"green.400"}>
                    Registrarme
                  </Link>
                  <Link to="/forgot-password" color={"green.400"}>
                    Olvidé mi contraseña
                  </Link>
                </Stack>
                <Button
                  bg={"green.400"}
                  color={"white"}
                  _hover={{
                    bg: "green.500",
                  }}
                  type="submit"
                  isLoading={!!transition.submission}
                >
                  Iniciar Sesión
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Form>
      </Stack>
    </Flex>
  );
}
