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
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { updateUserPassword } from "~/services/user.server";
import Logo from "../assets/golftime.svg";

export const loader: LoaderFunction = async ({ request, context = {} }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") as string;

  if (!token) {
    return null;
  }

  const user = await jwt.verify(
    token,
    process.env.PRIVATE_KEY || "someprivatekey"
  );

  if (!user) {
    return redirect("/");
  }

  return json(user);
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const repeatPass = formData.get("repeat-password") as string;

  if (!password || !repeatPass) {
    return "Complete todos los campos";
  }

  if (password !== repeatPass) {
    return "Las contraseñas no coinciden";
  }

  if (
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm.test(password) ===
    false
  ) {
    return "La contraseña debe contener 8 caracteres, al menos una mayúscula, una minúscula";
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const response = await updateUserPassword(email, hashedPassword);

  if (response) {
    return redirect("/");
  }

  return "Algo salió mal";
};

export default function ResetPassword() {
  const transition = useTransition();
  const user = useLoaderData();
  const error = useActionData();

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
              <FormControl id="password" isRequired>
                <FormLabel>Contraseña</FormLabel>
                <Input type="password" name="password" required />
              </FormControl>
              <FormControl id="repeat-password" isRequired>
                <FormLabel>Repita Contraseña</FormLabel>

                <Input type="password" name="repeat-password" />
              </FormControl>
              <input
                type="email"
                name="email"
                hidden
                value={user?.email}
                readOnly
              />
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
                  Enviar
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Form>
      </Stack>
    </Flex>
  );
}
