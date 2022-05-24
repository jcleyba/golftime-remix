import { UserEntity } from "~/entities/User";
import type { Competitor } from "~/types";
import { BetEntity } from "../entities/Bet";
import EventManager from "./events.server";

export type Bet = {
  sk: string;
  result: number;
  players: {
    id: string;
    img: string;
    name?: string;
    position?: string;
  }[];
};

export const lastEventBets = async (eventId?: string) => {
  if (!eventId) return null;

  const { Items } = await BetEntity.query(eventId, {
    reverse: true,
  });

  return Items.map(({ sk: userId, result }: Bet) => ({
    userId,
    result,
  })).sort((a: Bet, b: Bet) => b.result - a.result);
};

export const currentBet = async (eventId?: string, userId?: string) => {
  if (!eventId || !userId) return null;

  const { Items } = await BetEntity.query(eventId, {
    eq: userId.toString(),
  });

  return Items[0] ?? null;
};

export const saveBet = async (
  eventId: string,
  userId: string,
  players: Bet["players"]
) => {
  if (!eventId || !userId) return null;

  const result = await BetEntity.put({
    id: eventId,
    sk: userId,
    season: process.env.CURRENT_SEASON,
    players,
  });

  return result;
};

export const bulkUpdateResults = async () => {
  const lastEvent = await EventManager.getLastActiveEvent();

  if (!lastEvent?.id) {
    return Error("Invalid request. Wrong eventId");
  }

  const [{ Items: bets }, leaderboard] = await Promise.all([
    BetEntity.query(lastEvent.id),
    EventManager.fetchEventById(lastEvent.id),
  ]);

  if (!bets?.length || !leaderboard?.competitors) {
    return Error("No bets found");
  }

  const playersMap = mapPlayers(leaderboard.competitors);

  let promiseArray: Promise<any>[] = [];

  bets.forEach((bet: Bet) => {
    const points = calcPoints(bet.players, playersMap);
    promiseArray.push(
      UserEntity.update(
        {
          id: bet.sk,
          sk: "User#Current",
          points: { $add: points },
          lastUpdatedEvent: lastEvent.id,
        },
        {
          conditions: {
            attr: "lastUpdatedEvent",
            ne: lastEvent.id,
          },
        }
      )
    );
  });

  await Promise.all(promiseArray).catch(() => {
    console.log("Already updated");
  });
};

const mapPlayers = (competitors: Competitor[]) => {
  return competitors.reduce(
    (acc: { [key: string]: number }, comp: Competitor) => {
      const result =
        comp.pos === "-" ? 0 : (1 / parseInt(comp.pos.replace("T", ""))) * 100;
      acc[comp.id] = result;

      return acc;
    },
    {}
  );
};

const calcPoints = (
  players: Bet["players"],
  map: { [key: string]: number }
) => {
  return players.reduce((acc: number, pl: { id: string }) => {
    acc += map[pl.id];
    return acc;
  }, 0);
};
