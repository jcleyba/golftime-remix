import type { Bet, Competitor, Tournament } from "./types";

export const mapPlayers = (competitors: Competitor[]) => {
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

export const calcPoints = (
  players: Bet["players"],
  map: { [key: string]: number }
) => {
  return players.reduce((acc: number, pl: { id: string }) => {
    acc += map[pl.id];
    return acc;
  }, 0);
};

export const calculateLiveBetPoints = (
  bets: Bet[],
  leaderboard: Tournament
) => {
  const playersMap = mapPlayers(leaderboard.competitors);

  let ret: Record<string, number> = {};

  bets.forEach((bet: Bet) => {
    const points = calcPoints(bet.players, playersMap);
    ret[bet.sk] = Math.round(points * 100) / 100
  });

  return ret;
};
