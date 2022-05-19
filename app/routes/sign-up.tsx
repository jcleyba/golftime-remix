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
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import authenticator from "~/services/auth.server";
import { createNewUser } from "~/services/user.server";
import Logo from "../assets/golftime.svg";

export const action: ActionFunction = async ({ request, context }) => {
  const clone = request.clone();
  const formData = await request.formData();
  const password = formData.get("password") as string;
  const repeatPass = formData.get("repeat-password");
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;

  if (!firstName || !lastName || !password || !email) {
    return json<any>({ error: "Complete todos los campos" });
  }

  if (password !== repeatPass) {
    return json<any>({ error: "Las contraseñas no coinciden" });
  }

  if (
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm.test(password) ===
    false
  ) {
    return json<any>({
      error:
        "La contraseña debe contener 8 caracteres, al menos una mayúscula, una minúscula",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const response = await createNewUser({
    id: crypto?.randomUUID(),
    firstName,
    lastName,
    email,
    password: hashedPassword,
    verified: true,
    points: 0,
  });

  if (!response) {
    return json<any>({
      error: "Ya existe una cuenta con ese email",
    });
  }
  // call my authenticator
  const resp = await authenticator.authenticate("form", clone, {
    successRedirect: "/",
    failureRedirect: "/login",
    throwOnError: true,
    context,
  });

  return resp;
};

export default function LoginPage() {
  // if i got an error it will come back with the loader data
  const transition = useTransition();
  const { error } = useActionData() || {};

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
          <Image src={Logo} maxW={275} marginX={5} />
        </Stack>

        <Stack align={"center"}>
          <Text fontSize={"lg"} color={"gray.600"}>
            Ingrese sus datos
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
            {error && (
              <Alert status="error" marginY="5">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Stack spacing={4}>
              <FormControl id="name" isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input type="text" name="firstName" />
              </FormControl>
              <FormControl id="lastname" isRequired>
                <FormLabel>Apellido</FormLabel>
                <Input type="text" name="lastName" />
              </FormControl>
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="email" />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Contraseña</FormLabel>
                <Input type="password" name="password" required />
              </FormControl>
              <FormControl id="repeat-password" isRequired>
                <FormLabel>Repita Contraseña</FormLabel>
                <Input type="password" name="repeat-password" />
              </FormControl>
              <Stack spacing={10}>
                <Button
                  bg={"green.400"}
                  color={"white"}
                  _hover={{
                    bg: "green.500",
                  }}
                  type="submit"
                  isLoading={!!transition.submission}
                >
                  Registrarme
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Form>
      </Stack>
    </Flex>
  );
}
