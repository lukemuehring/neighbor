import express from "express";
import { search, initializeLocationListingsHashMap } from "./api/search";
import { VehicleRequest } from "./api/types";

const app = express();
const PORT = 3000;

initializeLocationListingsHashMap();

// This allows Express to parse JSON body
app.use(express.json());

app.post("/api/search", (req, res) => {
  const vehicles: VehicleRequest[] = req.body;
  const results = search(vehicles);
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
