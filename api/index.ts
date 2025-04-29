import { VercelRequest, VercelResponse } from "@vercel/node";
import { search } from "./search";
import { VehicleRequest } from "./types";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const vehicles: VehicleRequest[] = req.body;
    const results = search(vehicles);
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
