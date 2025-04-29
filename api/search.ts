import {
  VehicleRequest,
  Listing,
  SearchResult,
  PotentialSpot as PotentialListing,
} from "./types";
import listingsData from "./listings.json";

const listings: Listing[] = listingsData as Listing[];
const VEHICLE_WIDTH = 10;
const listingsByLocation: Record<string, Listing[]> = {};

function canFit(vehicle: VehicleRequest, listing: PotentialListing): boolean {
  return listing.remainingArea >= vehicle.length * VEHICLE_WIDTH;
}

export function initializeLocationListingsHashMap() {
  listings.forEach((listing) => {
    if (!listingsByLocation[listing.location_id]) {
      listingsByLocation[listing.location_id] = [];
    }
    listingsByLocation[listing.location_id].push(listing);
  });
}

export function search(vehicleRequests: VehicleRequest[]): SearchResult[] {
  if (Object.keys(listingsByLocation).length === 0) {
    initializeLocationListingsHashMap();
  }

  // FOR EVERY LOCATION, find the cheapest listing combination
  const results: SearchResult[] = [];
  for (const [locationId, locListings] of Object.entries(listingsByLocation)) {
    // Track available listings at current location with remaining space
    let availableListings = locListings.map(
      (listing) =>
        ({
          listing,
          remainingArea: listing.length * listing.width,
        } as PotentialListing)
    );

    let usedListings = new Map<string, Listing>(); // use Map to avoid duplicate IDs
    let totalPrice = 0;
    let success = true;

    for (const vehicleRequest of vehicleRequests) {
      for (let i = 0; i < vehicleRequest.quantity; i++) {
        // Find listings that can fit the current car request
        const fitting = availableListings.filter((listing) =>
          canFit(vehicleRequest, listing)
        );

        if (fitting.length === 0) {
          success = false;
          break;
        }

        // Pick the cheapest fitting listing
        const cheapest = fitting.reduce((a, b) =>
          a.listing.price_in_cents < b.listing.price_in_cents ? a : b
        );

        // Use this listing
        let vehicleRequestArea = VEHICLE_WIDTH * vehicleRequest.length;
        cheapest.remainingArea -= vehicleRequestArea;

        usedListings.set(cheapest.listing.id, cheapest.listing);

        // We add the price ONLY ONCE per listing (not per vehicle)
        // So if this is the first time using this listing, add its price
        if (
          cheapest.remainingArea + vehicleRequestArea ===
          cheapest.listing.length * cheapest.listing.width
        ) {
          totalPrice += cheapest.listing.price_in_cents;
        }
      }
      if (!success) break;
    }

    if (success) {
      results.push({
        location_id: locationId,
        listing_ids: Array.from(usedListings.keys()), // only listing ids, no repeats
        total_price_in_cents: totalPrice,
      });
    }
  }

  return results.sort(
    (a, b) => a.total_price_in_cents - b.total_price_in_cents
  );
}
