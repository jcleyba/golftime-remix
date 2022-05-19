import { Entity } from "dynamodb-toolbox";
import { MonoTable } from "~/repositories/table";

export const UserEntity = new Entity({
  name: "User",
  attributes: {
    id: { partitionKey: true },
    sk: { hidden: true, sortKey: true },
    firstName: { type: "string" },
    lastName: { type: "string" },
    email: { type: "string" },
    points: { type: "number" },
    lastUpdatedEvent: { type: "string" },
    password: { type: "string" },
    verified: { type: "boolean" },
    createdAt: { type: "string" },
    token: { type: "string" },
  },

  // Assign it to our table
  table: MonoTable,
});
