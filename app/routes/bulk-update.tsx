import type { ActionFunction } from "@remix-run/node";
import { bulkUpdateResults } from "~/services/bet.server";

export const action: ActionFunction = async ({ request }) => {
  const tokenWithBearer = request.headers.get("authorization") || "";
  const token = tokenWithBearer.split(" ")[1];
  if (token !== process.env.GITHUB_TOKEN) {
    throw Error("Unauth to bulk update");
  }

  await bulkUpdateResults();

  return null;
};
