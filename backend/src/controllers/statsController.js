import * as statsRepository from "../repositories/statsRepository.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (req, res) => {
  res.json(await statsRepository.findStats());
});
