import { Entity } from "dynamodb-toolbox";
import { MonoTable } from "~/repositories/table";

export const BetEntity = new Entity({
  name: "Bet",
  attributes: {
    id: { partitionKey: true },
    sk: { sortKey: true },
    email: { type: "string" },
    result: { type: "number" },
    players: { type: "list" },
    season: { type: "number" },
    createdAt: { type: "string" },
  },

  // Assign it to our table
  table: MonoTable,
});
