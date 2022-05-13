import { UserEntity } from "../entities/User";
import { BetEntity } from "../entities/Bet";
import { query as sql } from "db";
import chunk from "lodash.chunk";
import type { User } from "./session.server";

export const listUsers = async () => {
  const { Items } = await UserEntity.query("User#Current", {
    reverse: true,
    index: "sk-points-index",
  });

  return Items.map(({ firstName, lastName, points, id }: User) => ({
    id,
    firstName,
    lastName,
    points: points?.toFixed(2),
  }));
};

export const createUser = async () => {
  /* const { rows, rowCount } = await sql(`select * from bets`, []);

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
  /* const resp = await BetEntity.scan({
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
};
