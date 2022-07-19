import Imap from "imap";
import { inspect } from "util";
import isThisWeek from "date-fns/isThisWeek";

let imap = new Imap({
  user: process.env.MAIL_USERNAME || "",
  password: process.env.MAIL_PASSWORD || "",
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

function openInbox(cb: (error: Error, mailbox: Imap.Box) => void) {
  imap.openBox("[Gmail]/Importantes", true, cb);
}

async function getLastEmail(): Promise<{
  [index: string]: string[];
} | null> {
  try {
    return new Promise((resolve, reject) => {
      imap.once("ready", function () {
        openInbox(function (err, box) {
          if (err) {
            return reject(err);
          }
          const f = imap.seq.fetch(box.messages.total + ":*", {
            bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
            struct: true,
          });

          let buffer = "";

          f.on("message", function (msg, seqno) {
            const prefix = "(#" + seqno + ") ";
            msg.on("body", function (stream, info) {
              stream.on("data", function (chunk) {
                buffer += chunk.toString("utf8");
              });
              stream.once("end", function () {
                console.log(
                  prefix + "Parsed header: %s",
                  inspect(Imap.parseHeader(buffer))
                );
              });
            });

            msg.once("end", function () {
              console.log(prefix + "Finished");
            });
          });

          f.once("error", function (err) {
            console.log("Fetch error: " + err);
            reject(err);
          });

          f.once("end", function () {
            console.log("Done fetching all messages!");
            imap.end();
            resolve(Imap.parseHeader(buffer));
          });
        });
      });

      imap.once("error", function (err: Error) {
        console.log(err);
        reject(err);
      });

      imap.once("end", function () {
        console.log("Connection ended");
      });

      imap.connect();
    });
  } catch (e) {
    console.error("Something went wrong getting last email: ", e);
    return null;
  }
}

export async function hasMailBeenSent() {
  try {
    console.log("Connected to IMAP");

    const lastMessage = await getLastEmail();

    const [date] = lastMessage?.date || [];

    if (!date) return true;

    const hasBeenSent = isThisWeek(new Date(date), { weekStartsOn: 1 });
    console.log("Last Message: ", lastMessage);

    return hasBeenSent;
  } catch (e) {
    console.error("Something went wrong getting last email: ", e);
  }

  return true;
}
