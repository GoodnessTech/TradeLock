export interface PropertySeller {
  id: string;
  name: string;
  role: string;
  address: string;
  verified: boolean;
  dealsCompleted: number;
  phone?: string;
  email?: string;
  kycTier: string;
  companyName?: string;
}

export interface VerificationItem {
  id: string;
  title: string;
  description: string;
  status: 'VERIFIED' | 'AVAILABLE' | 'AUDITED';
  detail: string;
  documentRef?: string;
}

export interface PropertyVerification {
  isPropertyVerified: boolean;
  isSellerVerified: boolean;
  isDocumentsReviewed: boolean;
  isInspectionAvailable: boolean;
  escrowAvailable: boolean;
  cadastralSurveyNumber: string;
  titleDeedType: string;
  registryOffice: string;
  inspectionAgency: string;
  lastInspectedDate: string;
  smartContractEscrowAddress: string;
  network: string;
  items: VerificationItem[];
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  location: string;
  neighborhood: string;
  city: string;
  country: string;
  price: number;
  currency: string;
  tokenSymbol: string;
  bedrooms: number;
  bathrooms: number;
  sizeSqm: number;
  propertyType: 'Residential' | 'Villa' | 'Penthouse' | 'Apartment' | 'Commercial' | 'Terrace';
  status: 'AVAILABLE' | 'UNDER_ESCROW' | 'SOLD';
  featuredImage: string;
  gallery: string[];
  description: string[];
  features: string[];
  seller: PropertySeller;
  verification: PropertyVerification;
  isDemo: boolean;
  yearBuilt?: number;
  parkingSpaces?: number;
  titleDeedRef?: string;
  createdAt: string;
}

export interface PropertyFilterState {
  search: string;
  location: string;
  propertyType: string;
  priceRange: string;
  bedrooms: string;
  bathrooms: string;
  verifiedPropertyOnly: boolean;
  verifiedSellerOnly: boolean;
  escrowAvailableOnly: boolean;
  inspectionAvailableOnly: boolean;
}
