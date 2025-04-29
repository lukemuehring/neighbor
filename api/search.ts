import { VehicleRequest, Listing, SearchResult } from "./types";
import listingsData from "./listings.json";

const listings: Listing[] = listingsData as Listing[];

function canFit(vehicle: VehicleRequest, listing: Listing): boolean {
  return listing.length >= vehicle.length && listing.width >= 10;
}

export function search(vehicles: VehicleRequest[]): SearchResult[] {
  const listingsByLocation: Record<string, Listing[]> = {};

  listings.forEach((listing) => {
    if (!listingsByLocation[listing.location_id]) {
      listingsByLocation[listing.location_id] = [];
    }
    listingsByLocation[listing.location_id].push(listing);
  });

  const results: SearchResult[] = [];

  for (const [locationId, locListings] of Object.entries(listingsByLocation)) {
    let available = [...locListings];
    let usedListings: Listing[] = [];
    let totalPrice = 0;
    let success = true;

    for (const vehicle of vehicles) {
      for (let i = 0; i < vehicle.quantity; i++) {
        const fitting = available.filter((l) => canFit(vehicle, l));
        if (fitting.length === 0) {
          success = false;
          break;
        }
        const cheapest = fitting.reduce((a, b) =>
          a.price_in_cents < b.price_in_cents ? a : b
        );
        usedListings.push(cheapest);
        available = available.filter((l) => l.id !== cheapest.id);
        totalPrice += cheapest.price_in_cents;
      }
      if (!success) break;
    }

    if (success) {
      results.push({
        location_id: locationId,
        listing_ids: usedListings.map((l) => l.id),
        total_price_in_cents: totalPrice,
      });
    }
  }

  return results.sort(
    (a, b) => a.total_price_in_cents - b.total_price_in_cents
  );
}
