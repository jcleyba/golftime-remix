import { GroupEntity } from "~/entities/Group";
import crypto from "crypto";
import { MonoTable } from "~/repositories/table";

export const createGroup = async (groupName: string, userId: string) => {
  const groupId = crypto?.randomUUID();

  return MonoTable.transactWrite([
    GroupEntity.putTransaction({
      pk: `GROUP#${groupId}`,
      sk: `GROUP#${groupId}`,
      groupName,
    }),
    GroupEntity.putTransaction({
      pk: `GROUP#${groupId}`,
      sk: `USER#${userId}`,
      gsi2pk: `USER#${userId}`,
      groupName,
    }),
  ]);
};

export const addMember = async (
  groupId: string,
  memberId: string,
  groupName: string
) => {
  return await GroupEntity.put({
    pk: `GROUP#${groupId}`,
    sk: `USER#${memberId}`,
    groupName,
  });
};

export const removeMember = async (groupId: string, memberId: string) => {
  return await GroupEntity.delete({
    pk: `GROUP#${groupId}`,
    sk: `USER#${memberId}`,
  });
};

export const getGroupsForMember = async (memberId: string) => {
  const { Items } = await GroupEntity.query(`USER#${memberId}`, {
    index: "gsi2pk-pk-index",
  });

  return (Items || []).map((item: { pk: string; groupName: string }) => ({
    id: item.pk.split("#")?.[1],
    name: item.groupName,
  }));
};

export const getMembersForGroup = async (groupId: string) => {
  const { Items } = await GroupEntity.query(`GROUP#${groupId}`, {
    beginsWith: "USER",
  });

  return (Items || []).map(
    ({ sk, groupName }: { sk: string; groupName: string }) => ({
      email: sk.split("#")?.[1],
      groupName,
    })
  );
};
