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
    "sk-points-index": { partitionKey: "sk", sortKey: "points" },
    "email-sk-index": { partitionKey: "email", sortKey: "sk" },
  },
});
