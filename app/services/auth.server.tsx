import { query as sql } from "db";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import type { User } from "./session.server";
import { sessionStorage } from "./session.server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Create an instance of the authenticator, pass a Type, User,  with what
// strategies will return and will store in the session
const authenticator = new Authenticator<User | null>(sessionStorage, {
  sessionKey: "sessionKey", // keep in sync
  sessionErrorKey: "sessionErrorKey", // keep in sync
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email") as string;
    let password = form.get("password") as string;

    if (!email || email?.length === 0)
      throw new AuthorizationError("Bad Credentials: Email is required");
    if (typeof email !== "string")
      throw new AuthorizationError("Bad Credentials: Email must be a string");

    if (!password || password?.length === 0)
      throw new AuthorizationError("Bad Credentials: Password is required");
    if (typeof password !== "string")
      throw new AuthorizationError(
        "Bad Credentials: Password must be a string"
      );

    const {
      rows: { 0: user },
    } = await sql(`select * from users where email = $1;`, [
      email.toLocaleLowerCase(),
    ]);

    if (user) {
      const passwordMatch = await bcrypt.compare(
        password.toLocaleLowerCase(),
        user.password
      );
      if (!passwordMatch) {
        throw new AuthorizationError("Usuario o contraseña incorrectos");
      }

      return {
        id: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
      };
    } else {
      throw new AuthorizationError("Usuario o contraseña incorrectos");
    }
  })
);

export default authenticator;
