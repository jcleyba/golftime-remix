import { BetEntity } from "../entities/Bet";

export type Bet = {
  sk: string;
  result: number;
  players: {
    id: string;
    img: string;
    name?: string;
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
