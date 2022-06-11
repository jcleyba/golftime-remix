import { UserEntity } from "../entities/User";
import { BetEntity } from "../entities/Bet";
import { query as sql } from "db";
import chunk from "lodash.chunk";
import crypto from "crypto";
import type { User } from "~/types";
import { MonoTable } from "~/repositories/table";

export const createNewUser = async (
  user: User & { password: string; verified: boolean }
) => {
  return await UserEntity.put({
    ...user,
    id: user.email,
    sk: user.email,
    legacyId: crypto?.randomUUID(),
    gsi1pk: "User#Current",
    verified: true,
  });
};

export const listUsers = async () => {
  const { Items } = await UserEntity.query("User#Current", {
    reverse: true,
    index: "gsi1pk-points-index",
  });

  return Items.map(
    ({ firstName, lastName, points, id, email, verified, legacyId }: User) => ({
      id,
      firstName,
      lastName,
      points: points?.toFixed(2),
      email,
      verified,
      legacyId,
    })
  );
};

export const updateUserToken = async (email: string, token: string) => {
  return await UserEntity.update({ id: email, sk: email, token });
};

export const updateUserPassword = async (email: string, password: string) => {
  return await UserEntity.update({
    id: email,
    sk: email,
    password,
    token: null,
  });
};

export const getUsersByEmail = async (emails: string[]) => {
  const { Responses } = await MonoTable.batchGet(
    emails.map((email) => UserEntity.getBatch({ id: email, sk: email }))
  );

  return (Responses?.golftime || [])
    .map(({ email, firstName, lastName, points }: User) => ({
      email,
      firstName,
      lastName,
      points: points?.toFixed(2),
    }))
    .sort((a: User, b: User) => (b.points || 0) - (a.points || 0));
};

/*  const { rows, rowCount } = await sql(`select * from bets`, []);

  const chunks = chunk(rows, 20);

  for (let chunkIndex in chunks) {
    const block = chunks[chunkIndex];

    console.log(
      `Block Number: ${chunkIndex} of ${chunks.length}. Block size: ${block.length}`
    );
    let promiseArray: Promise<any>[] = [];

    for (const blockIndex in block) {
      const item = block[blockIndex];

      promiseArray.push(
        BetEntity.put({
          id: item.eventid,
          sk: item.userid,
          result: parseFloat(item.result),
          season: item.season,
          createdAt: item.created_on.toString(),
          players: item.players.map((pl: any) => ({
            id: pl,
            img:
              "https://a.espncdn.com/i/headshots/golf/players/full/" +
              pl +
              ".png",
            name: "",
          })),
        })
      );
    }
    await Promise.all(promiseArray);
  } */
/* const { rows, rowCount } = await sql(`select * from users`, []);

  const chunks = chunk(rows, 20);

  for (let chunkIndex in chunks) {
    const block = chunks[chunkIndex];

    console.log(
      `Block Number: ${chunkIndex} of ${chunks.length}. Block size: ${block.length}`
    );
    let promiseArray: Promise<any>[] = [];

    const resp = await BetEntity.scan({
      filters: [
        {
          attr: "season",
          eq: 2022,
        },
      ],
    });

    let map: Record<string, number> = {};
    resp.Items.forEach((bet: any) => {
      map[bet.sk] = (map[bet.sk] || 0) + parseFloat(bet?.result || 0);
    });

    for (const blockIndex in block) {
      const item = block[blockIndex];
      const {
        firstname: firstName,
        lastname: lastName,
        email,
        password,
        verified,
        token,
        createdAt,
        id,
      } = item;

      await promiseArray.push(
        UserEntity.put({
          id: email,
          sk: email,
          gsi1pk: "User#Current",
          password,
          firstName,
          lastName,
          email,
          verified,
          token,
          createdAt,
          legacyId: id
           oints: map[id],
        })
      );
    }

    await Promise.all(promiseArray);
  } */
/*   const resp = await BetEntity.scan({
    filters: [
      {
        attr: "season",
        eq: 2022,
      },
    ],
  });

  let map: Record<string, number> = {};
  resp.Items.forEach((bet: any) => {
    map[bet.sk] = (map[bet.sk] || 0) + parseFloat(bet?.result || 0);
  });

  let promiseArray: Promise<any>[] = [];

  Object.keys(map).forEach((key) => {
    promiseArray.push(
      UserEntity.update({ pk: key, sk: "User#Current", points: map[key] })
    );
  });

  await Promise.all(promiseArray);

  console.debug("$$$", map); */
