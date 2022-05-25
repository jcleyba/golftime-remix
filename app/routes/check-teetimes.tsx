import type { ActionFunction } from "@remix-run/node";
import { hasMailBeenSent } from "~/services/imap.server";
import EventManager from "~/services/events.server";
import { sendTeeTimes } from "~/services/email.server";
import { listUsers } from "~/services/user.server";
import type { User } from "~/services/session.server";

export const action: ActionFunction = async ({ request }) => {
  const tokenWithBearer = request.headers.get("authorization") || "";
  const token = tokenWithBearer.split(" ")[1];
  if (token !== process.env.GITHUB_TOKEN) {
    throw Error("Unauth to bulk update");
  }

  try {
    const mailSent = await hasMailBeenSent();
    const nextEvent = await EventManager.getActiveEvent();
    console.debug("Mail sent: ", mailSent);

    if (!mailSent && nextEvent?.status === "pre") {
      const next = await EventManager.fetchEventById(nextEvent.id);
      if (next?.competitors?.length) {
        const rows: User[] = await listUsers();

        await sendTeeTimes(
          rows
            .filter((row: User) => row.verified)
            .map((row: User) => row.email),
          nextEvent.id,
          next.name
        );
      }
    }

    return true;
  } catch (e) {
    console.error("Error sending tee times: ", e);
    return null;
  }
};
