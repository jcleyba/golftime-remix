import { Table } from "dynamodb-toolbox";

import DynamoDB from "aws-sdk/clients/dynamodb";
const DocumentClient = new DynamoDB.DocumentClient();

// Instantiate a table
export const MonoTable = new Table({
  // Specify table name (used by DynamoDB)
  name: "golftime",

  // Define partition and sort keys
  partitionKey: "pk",
  sortKey: "sk",

  // Add the DocumentClient
  DocumentClient,
  indexes: {
    "gsi1pk-points-index": { partitionKey: "gsi1pk", sortKey: "points" },
  },
});
