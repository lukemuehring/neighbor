import { Listing } from "./types";
import listingsData from "./listings.json";

const listingsByLocation: Record<string, Listing[]> = {}; // or your actual type
let isInitialized = false;
const listings: Listing[] = listingsData as Listing[];

export function getListingsByLocation(): Record<string, Listing[]> {
  if (!isInitialized) {
    initializeLocationListingsHashMap();
    isInitialized = true;
    console.log("init hashmap");
  }
  return listingsByLocation;
}

export function initializeLocationListingsHashMap() {
  listings.forEach((listing) => {
    if (!listingsByLocation[listing.location_id]) {
      listingsByLocation[listing.location_id] = [];
    }
    listingsByLocation[listing.location_id].push(listing);
  });
}
