export type AccountType = "user" | "agency";
export type AgencyRole = "owner" | "admin" | "agent";
export type ListingStatus = "draft" | "active" | "sold" | "archived";
export type ListingTier = "free" | "standard" | "premium";
export type ImageCategory = "photo" | "floorplan" | "other";

export type Profile = {
  user_id: string;
  account_type: AccountType;
  full_name: string | null;
  email: string | null;
};

export type Agency = {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  blurb: string | null;
  logo_path: string | null;
};

export type ListingImage = {
  id: string;
  listing_id: string;
  category: ImageCategory;
  sort_order: number;
  storage_path: string;
  alt_text: string | null;
  public_url?: string;
};

export type Listing = {
  id: string;
  agency_id: string;
  status: ListingStatus;
  tier: ListingTier;
  title: string;
  address_line: string;
  suburb: string;
  state: string;
  postcode: string;
  price_display: string;
  price_min: number | null;
  price_max: number | null;
  property_type: string;
  beds: number;
  baths: number;
  parking: number;
  land_size_sqm: number | null;
  description: string;
  features: string[] | null;
  sold_date: string | null;
  sold_price: number | null;
  sold_price_display: string | null;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  agency?: Agency | null;
  listing_images?: ListingImage[] | null;
};

export type SavedSearch = {
  id: string;
  user_id: string;
  label: string;
  criteria: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Enquiry = {
  id: string;
  listing_id: string;
  agency_id: string;
  user_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  subject: string | null;
  is_archived: boolean;
  created_at: string;
  listing?: Pick<Listing, "id" | "title" | "address_line" | "suburb" | "state"> | null;
  enquiry_messages?: EnquiryMessage[] | null;
};

export type EnquiryMessage = {
  id: string;
  enquiry_id: string;
  sender_type: "buyer" | "agency";
  sender_user_id: string | null;
  message: string;
  created_at: string;
};

export function listingAddress(listing: Pick<Listing, "address_line" | "suburb" | "state" | "postcode">) {
  return `${listing.address_line}, ${listing.suburb} ${listing.state} ${listing.postcode}`.trim();
}
