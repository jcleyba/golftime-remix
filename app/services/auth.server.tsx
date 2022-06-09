import bcrypt from "bcrypt";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { UserEntity } from "~/entities/User";
import type { User } from "~/types";
import { sessionStorage } from "./session.server";

// Create an instance of the authenticator, pass a Type, User,  with what
// strategies will return and will store in the session
const authenticator = new Authenticator<User | null>(sessionStorage, {
  sessionKey: "sessionKey", // keep in sync
  sessionErrorKey: "sessionErrorKey", // keep in sync
});

authenticator.use(
  new FormStrategy(async (req) => {
    let email = req.form.get("email") as string;
    let password = req.form.get("password") as string;

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

    const { Item: user } = await UserEntity.get({ id: email, sk: email });
    
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

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
