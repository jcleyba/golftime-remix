import { Entity } from "dynamodb-toolbox";
import { MonoTable } from "~/repositories/table";

export const UserEntity = new Entity({
  name: "User",
  attributes: {
    id: { partitionKey: true }, // flag as partitionKey
    sk: { sortKey: true }, // flag as sortKey and mark hidden
    firstName: { type: "string" }, // map 'name' to table attribute 'data'
    lastName: { type: "string" }, // alias table attribute 'co' to 'company'
    email: { type: "string" }, // set the attribute type
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
