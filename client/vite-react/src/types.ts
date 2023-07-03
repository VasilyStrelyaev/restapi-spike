import { ReactionType } from "../../../types";

export type UserStatsRow = {
  userId: string;
  publicName: string;
  postCountLastMonth: number;
  favoriteReaction: ReactionType;
};

export type ReactionStats = Record<ReactionType, number>;
