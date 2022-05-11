import { Entity } from "dynamodb-toolbox";
import { MonoTable } from "~/repositories/table";

export const BetEntity = new Entity({
  name: "User",
  attributes: {
    id: { partitionKey: true }, // flag as partitionKey
    sk: { sortKey: true }, // flag as sortKey and mark hidden
    result: { type: "number" },
    players: { type: "list" },
    season: { type: "number" },
    createdAt: { type: "string" },
  },

  // Assign it to our table
  table: MonoTable,
});
