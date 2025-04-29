import { VehicleRequest, Listing, SearchResult } from "./types";
import listingsData from "./listings.json";

const listings: Listing[] = listingsData as Listing[];
const VEHICLE_WIDTH = 10;

function canFit(vehicle: VehicleRequest, listing: Listing): boolean {
  // Todo: I don't think this takes intoi account the quantity
  return listing.length >= vehicle.length && listing.width >= VEHICLE_WIDTH;
}

export function search(vRequests: VehicleRequest[]): SearchResult[] {
  // Create hashmap of location ID : list of available listings
  const listingsByLocation: Record<string, Listing[]> = {};

  listings.forEach((listing) => {
    if (!listingsByLocation[listing.location_id]) {
      listingsByLocation[listing.location_id] = [];
    }
    listingsByLocation[listing.location_id].push(listing);
  });

  const results: SearchResult[] = [];

  // For every location...
  for (const [locationId, locListings] of Object.entries(listingsByLocation)) {
    let available = [...locListings];
    let usedListings: Listing[] = [];
    let totalPrice = 0;
    let success = true;

    for (const vRequest of vRequests) {
      for (let i = 0; i < vRequest.quantity; i++) {
        // Find all the listings that can fit a single vehicle from this request
        const fitting = available.filter((l) => canFit(vRequest, l));
        if (fitting.length === 0) {
          success = false;
          break;
        }

        // get listing with the cheapest price that fits the vehicle length (but there still could be multiple...)
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
