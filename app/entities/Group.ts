import { Entity } from "dynamodb-toolbox";
import { MonoTable } from "~/repositories/table";

export const GroupEntity = new Entity({
  name: "Group",
  attributes: {
    pk: { partitionKey: true },
    sk: { sortKey: true },
    gsi2pk: { type: "string" },
    groupName: { type: "string" },
    createdAt: { type: "string" },
  },

  // Assign it to our table
  table: MonoTable,
});
