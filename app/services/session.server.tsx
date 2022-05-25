import { createCookieSessionStorage } from "@remix-run/node";

// export the whole sessionStorage object
export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: ["s3cr3t"], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
    expires: new Date(Date.now() + 3600000 * 24 * 14),
  },
});

// you can also export the methods individually for your own usage
export let { getSession, commitSession, destroySession } = sessionStorage;

// define the user model
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  points?: number;
  verified?: boolean;
};
