import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import authenticator from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const tournamentId = params.eventId;

  if (!tournamentId || !user?.legacyId) {
    return null;
  }

  return redirect(`/events/${tournamentId}/user/${user.legacyId}`);
};
