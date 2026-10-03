import type { Property } from '@/lib/types/property';
import { TRADELOCK_CONTRACT, BOT_CHAIN } from '@/lib/botchain';

export const DEMO_PROPERTIES: Property[] = [
  {
    id: 'prop-lagos-01',
    slug: 'modern-3-bedroom-residence-lagos',
    title: 'Modern 3 Bedroom Residence',
    tagline: 'Contemporary architectural design with smart security and verified freehold title deed',
    location: 'Lekki Phase 1, Lagos, Nigeria',
    neighborhood: 'Lekki Phase 1',
    city: 'Lagos',
    country: 'Nigeria',
    price: 180000,
    currency: 'USD',
    tokenSymbol: 'USDT',
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 240,
    propertyType: 'Residential',
    status: 'AVAILABLE',
    featuredImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80',
    ],
    description: [
      'A masterfully crafted 3-bedroom luxury residence situated in a gated, premium enclave in Lekki Phase 1. Designed with double-height ceilings, floor-to-ceiling UV-filtered architectural glazing, and imported Italian porcelain tiling throughout.',
      'The property features an open-concept chef kitchen with integrated German appliances, an en-suite staff quarter, a 15kVA automated inverter-solar array, and dedicated borehole water purification. Pre-inspected and audited by certified TradeLock structural engineers with verified title registers.',
    ],
    features: [
      '24/7 Gated Security & Biometric Access',
      'Dedicated Solar Inverter System (15kVA)',
      'Smart Home Lighting & Climate Automation',
      'Full En-Suite Bathrooms in Every Bedroom',
      'Fitted Gourmet Kitchen with Quartz Counters',
      'Industrial Water Filtration & Borehole',
      'Private 2-Car Covered Carport',
      'Comprehensive Structural Warranty (10 Years)',
    ],
    yearBuilt: 2024,
    parkingSpaces: 2,
    titleDeedRef: 'LAG/LKK/C-OF-O/2023/8841',
    seller: {
      id: 'sel-horizon-01',
      name: 'Horizon Prime Developments Ltd',
      role: 'Accredited Master Developer & Title Holder',
      address: '0x3a2164A626dD1F3dEBE2D2F2c9b4895C9cbe8c12',
      verified: true,
      dealsCompleted: 14,
      phone: '+234 1 295 4400',
      email: 'settlement@horizonprime.ng',
      kycTier: 'Tier 3 Corporate & Deeds Attested',
      companyName: 'Horizon Prime Urban Developments',
    },
    verification: {
      isPropertyVerified: true,
      isSellerVerified: true,
      isDocumentsReviewed: true,
      isInspectionAvailable: true,
      escrowAvailable: true,
      cadastralSurveyNumber: 'SURV/LAG/2023/1109-B',
      titleDeedType: "Governor's Consent & Certificate of Occupancy (C of O)",
      registryOffice: 'Lagos State Lands Bureau & Cadastral Registry (Alausa)',
      inspectionAgency: 'Bureau Veritas TradeLock Inspection Partner',
      lastInspectedDate: '2026-09-14',
      smartContractEscrowAddress: TRADELOCK_CONTRACT.address,
      network: `${BOT_CHAIN.name} (Chain ID ${BOT_CHAIN.chainId})`,
      items: [
        {
          id: 'v1',
          title: 'Property Cadastral Survey & Coordinates Verified',
          description: 'Official survey beacon numbers matched with state satellite cadastral mapping with 0 overlap disputes.',
          status: 'VERIFIED',
          detail: 'Beacon No. BK-4091 to BK-4094 verified on Alausa GIS database.',
          documentRef: 'SURV/LAG/2023/1109-B',
        },
        {
          id: 'v2',
          title: 'Seller Identity & Corporate Title Verified',
          description: 'Corporate registered entity KYC completed. Direct authorized signatories verified via onchain cryptographic attestation.',
          status: 'VERIFIED',
          detail: 'RC 1492041 active and in good standing with CAC Nigeria.',
          documentRef: 'KYC-TIER3-7741',
        },
        {
          id: 'v3',
          title: 'Title Deeds & Legal Encumbrance Audit',
          description: 'Certificate of Occupancy and Land Use Charge fully audited. Free of all mortgage liens, lis pendens, and court caveats.',
          status: 'AUDITED',
          detail: 'Deed search conducted at Alausa Registry on 2026-08-20.',
          documentRef: 'C-OF-O/LAG/2023/8841',
        },
        {
          id: 'v4',
          title: 'Physical Structural & MEP Inspection Completed',
          description: '142-point structural audit including foundation stress test, plumbing pressure test, and electrical safety certificate.',
          status: 'AVAILABLE',
          detail: 'Certified Structural Survey Report available for instant buyer review.',
          documentRef: 'BV-REPORT-2026-09',
        },
      ],
    },
    isDemo: true,
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'prop-lagos-02',
    slug: 'horizon-waterfront-penthouse-victoria-island',
    title: 'Horizon Waterfront Penthouse',
    tagline: 'Ultra-luxury duplex penthouse with panoramic ocean views and private marina slip',
    location: 'Victoria Island, Lagos, Nigeria',
    neighborhood: 'Victoria Island',
    city: 'Lagos',
    country: 'Nigeria',
    price: 450000,
    currency: 'USD',
    tokenSymbol: 'USDT',
    bedrooms: 4,
    bathrooms: 5,
    sizeSqm: 480,
    propertyType: 'Penthouse',
    status: 'AVAILABLE',
    featuredImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1400&q=80',
    ],
    description: [
      'Perched atop the premier residential tower in Victoria Island, this 480-sqm duplex penthouse offers unobstructed Atlantic waterfront panoramas and private rooftop infinity pool.',
      'Includes private express biometric elevator, bespoke Poggenpohl kitchen, floor-to-ceiling acoustic glass, home cinema, and three dedicated underground parking spaces.',
    ],
    features: [
      'Private Rooftop Infinity Pool & Sky Lounge',
      'Direct Waterfront Marina Access',
      'Keycard & Biometric Direct Lift Entry',
      'Custom Wine Cellar & Tasting Room',
      'Fully Acoustically Treated Private Cinema',
      'Triple Underground Parking Bays',
      'Triple Redundant Power with Gas Turbine Connection',
      'Dedicated 24/7 Concierge & Valet',
    ],
    yearBuilt: 2025,
    parkingSpaces: 3,
    titleDeedRef: 'LAG/VI/FED-GOV/C-OF-O/2024/091',
    seller: {
      id: 'sel-atlantic-02',
      name: 'Atlantic Maritime Estates',
      role: 'Institutional Real Estate Trust',
      address: '0x8b326B88B46f5787F63d63b2f2dCFFdF09C1A6E1',
      verified: true,
      dealsCompleted: 22,
      phone: '+234 1 880 1200',
      email: 'acquisitions@atlanticmaritime.com',
      kycTier: 'Tier 3 Corporate & Deeds Attested',
      companyName: 'Atlantic Maritime REIT',
    },
    verification: {
      isPropertyVerified: true,
      isSellerVerified: true,
      isDocumentsReviewed: true,
      isInspectionAvailable: true,
      escrowAvailable: true,
      cadastralSurveyNumber: 'SURV/LAG/VI/2024/991',
      titleDeedType: 'Federal Government Grant & Lagos State Governor Consent',
      registryOffice: 'Federal Lands & Lagos State Land Registry',
      inspectionAgency: 'SGS International Property Services',
      lastInspectedDate: '2026-09-02',
      smartContractEscrowAddress: TRADELOCK_CONTRACT.address,
      network: `${BOT_CHAIN.name} (Chain ID ${BOT_CHAIN.chainId})`,
      items: [
        {
          id: 'v1',
          title: 'Property Cadastral Survey & Coordinates Verified',
          description: 'Geodetic marine boundary survey authenticated with zero boundary overlap.',
          status: 'VERIFIED',
          detail: 'High-precision RTK GPS survey records filed with Surveyor General.',
          documentRef: 'SURV/LAG/VI/2024/991',
        },
        {
          id: 'v2',
          title: 'Seller Identity & Corporate Title Verified',
          description: 'Tier-3 institutional REIT verified with active onchain multisig governance.',
          status: 'VERIFIED',
          detail: 'Signatory verified via Gnosis Safe multisig wallet 0x8b3...A6E1.',
          documentRef: 'KYC-REIT-9901',
        },
        {
          id: 'v3',
          title: 'Title Deeds & Legal Encumbrance Audit',
          description: 'Audited Federal Grant and 99-year leasehold with 91 years unexpired.',
          status: 'AUDITED',
          detail: 'Clear title affirmed by international counsel audit.',
          documentRef: 'FED-GOV/C-OF-O/2024/091',
        },
        {
          id: 'v4',
          title: 'Physical Structural & MEP Inspection Completed',
          description: 'Wind-tunnel and marine atmospheric corrosion resistance certification pass.',
          status: 'AVAILABLE',
          detail: 'SGS engineering audit available for download in buyer portal.',
          documentRef: 'SGS-VI-ENG-2026',
        },
      ],
    },
    isDemo: true,
    createdAt: '2026-08-20T14:30:00Z',
  },
  {
    id: 'prop-abuja-03',
    slug: 'diplomatic-zone-luxury-villa-maitama',
    title: 'Diplomatic Zone Luxury Villa',
    tagline: 'Private 5-bedroom gated estate in Maitama diplomatic quarter with landscaped grounds',
    location: 'Maitama, Abuja, FCT, Nigeria',
    neighborhood: 'Maitama Diplomatic Zone',
    city: 'Abuja',
    country: 'Nigeria',
    price: 680000,
    currency: 'USD',
    tokenSymbol: 'USDT',
    bedrooms: 5,
    bathrooms: 6,
    sizeSqm: 620,
    propertyType: 'Villa',
    status: 'AVAILABLE',
    featuredImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1400&q=80',
    ],
    description: [
      'Nestled within Maitama’s highly secure diplomatic corridor, this expansive 620-sqm villa provides unparalleled privacy and classic Mediterranean architecture.',
      'Highlights include an olympic-sized swimming pool, lush manicured botanical gardens, bullet-resistant security glazing, and dual self-contained guest quarters.',
    ],
    features: [
      'Diplomatic Security Specification & CCTV Perimeter',
      'Heated Olympic-Sized Swimming Pool',
      'Landscaped Gardens & Automated Irrigation',
      'Detached 2-Bedroom Guest Cottage',
      'Double Chef Kitchen with Commercial Extraction',
      '4-Vehicle Enclosed Motor Court',
      'Dedicated High-Yield Solar Array with Tesla Powerwalls',
      'AGIS Certified Freehold Certificate of Occupancy',
    ],
    yearBuilt: 2023,
    parkingSpaces: 4,
    titleDeedRef: 'FCT/AGIS/C-OF-O/2022/19082',
    seller: {
      id: 'sel-capital-03',
      name: 'Capital Crest Properties Ltd',
      role: 'Accredited Abuja Estate Developer',
      address: '0x99A8c8bFd2F86745163D6B50Eb128B23485E31D9',
      verified: true,
      dealsCompleted: 19,
      phone: '+234 9 461 3320',
      email: 'deals@capitalcrest.ng',
      kycTier: 'Tier 3 Corporate & Deeds Attested',
      companyName: 'Capital Crest Properties',
    },
    verification: {
      isPropertyVerified: true,
      isSellerVerified: true,
      isDocumentsReviewed: true,
      isInspectionAvailable: true,
      escrowAvailable: true,
      cadastralSurveyNumber: 'AGIS/CAD/MTM/2022/441',
      titleDeedType: 'Abuja Geographic Information Systems (AGIS) C of O',
      registryOffice: 'Abuja Geographic Information Systems (AGIS), FCT',
      inspectionAgency: 'TradeLock Certified Surveyors Network',
      lastInspectedDate: '2026-08-28',
      smartContractEscrowAddress: TRADELOCK_CONTRACT.address,
      network: `${BOT_CHAIN.name} (Chain ID ${BOT_CHAIN.chainId})`,
      items: [
        {
          id: 'v1',
          title: 'Property Cadastral Survey & Coordinates Verified',
          description: 'AGIS Cadastral beacon plot coordinates cross-checked on Federal Capital Territory master plan.',
          status: 'VERIFIED',
          detail: 'Plot 1042 Cadastral Zone A05 Maitama confirmed in GIS master register.',
          documentRef: 'AGIS/CAD/MTM/2022/441',
        },
        {
          id: 'v2',
          title: 'Seller Identity & Corporate Title Verified',
          description: 'Verified Abuja developer with 12-year track record. Zero default history on record.',
          status: 'VERIFIED',
          detail: 'EVM wallet 0x99A8...31D9 verified with bound CAC registration.',
          documentRef: 'KYC-AGIS-3391',
        },
        {
          id: 'v3',
          title: 'Title Deeds & Legal Encumbrance Audit',
          description: 'AGIS Title search affirmed: No pending revocation, zero outstanding ground rents or caveats.',
          status: 'AUDITED',
          detail: 'AGIS Official Search Report dated 2026-08-12.',
          documentRef: 'AGIS/C-OF-O/2022/19082',
        },
        {
          id: 'v4',
          title: 'Physical Structural & MEP Inspection Completed',
          description: 'Structural integrity report rating 98/100. Foundation, roofing, and security systems certified.',
          status: 'AVAILABLE',
          detail: 'Inspection report signed by registered COREN engineer.',
          documentRef: 'COREN-ABJ-2026',
        },
      ],
    },
    isDemo: true,
    createdAt: '2026-08-10T09:00:00Z',
  },
  {
    id: 'prop-nairobi-04',
    slug: 'green-hills-modern-terrace-karen-nairobi',
    title: 'Green Hills Modern Terrace',
    tagline: 'Eco-conscious 3-bedroom luxury townhouse nestled in Karen with private landscaped garden',
    location: 'Karen, Nairobi, Kenya',
    neighborhood: 'Karen Hardy',
    city: 'Nairobi',
    country: 'Kenya',
    price: 240000,
    currency: 'USD',
    tokenSymbol: 'USDT',
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 290,
    propertyType: 'Terrace',
    status: 'AVAILABLE',
    featuredImage: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1400&q=80',
    ],
    description: [
      'Set against indigenous mature trees in Karen, this modern 290-sqm terrace balances sustainable architectural design with high-end African hardwood accents and natural stone.',
      'Features rainwater harvesting, greywater recycling, double glazing, solar thermal hot water, and tranquil woodland views.',
    ],
    features: [
      'EDGE-Certified Green Building Design',
      'Rainwater Harvesting & Advanced Greywater Recycling',
      'Solar Thermal Hot Water & Hybrid Battery Backup',
      'Solid Teak Flooring & Native Stone Walls',
      'Private 80-sqm Landscaped Garden',
      'Communal Clubhouse, Tennis Court & Swimming Pool',
      '24/7 Gated Community Security with Armed Response',
      'Sectional Properties Act Registered Title Deed',
    ],
    yearBuilt: 2024,
    parkingSpaces: 2,
    titleDeedRef: 'NBI/KRN/SECTIONAL/2024/310',
    seller: {
      id: 'sel-rift-04',
      name: 'Rift Valley Eco Homes Ltd',
      role: 'Certified Sustainable Developer',
      address: '0x14C78B964319F8a83427E2e7b8c7C34D66e35567',
      verified: true,
      dealsCompleted: 11,
      phone: '+254 20 491 5500',
      email: 'registry@riftecohomes.co.ke',
      kycTier: 'Tier 3 Corporate & Deeds Attested',
      companyName: 'Rift Valley Eco Homes',
    },
    verification: {
      isPropertyVerified: true,
      isSellerVerified: true,
      isDocumentsReviewed: true,
      isInspectionAvailable: true,
      escrowAvailable: true,
      cadastralSurveyNumber: 'LR-2849/55-KAREN',
      titleDeedType: 'Ministry of Lands & Physical Planning Sectional Title Deed',
      registryOffice: 'Nairobi Lands Registry (Ardhi House)',
      inspectionAgency: 'Knight Frank Kenya TradeLock Inspectorate',
      lastInspectedDate: '2026-09-08',
      smartContractEscrowAddress: TRADELOCK_CONTRACT.address,
      network: `${BOT_CHAIN.name} (Chain ID ${BOT_CHAIN.chainId})`,
      items: [
        {
          id: 'v1',
          title: 'Property Cadastral Survey & Coordinates Verified',
          description: 'Survey of Kenya boundary beacons verified with zero boundary dispute or encroachment.',
          status: 'VERIFIED',
          detail: 'Cadastral Deed Plan No. DP 44812 signed by Director of Surveys.',
          documentRef: 'LR-2849/55-KAREN',
        },
        {
          id: 'v2',
          title: 'Seller Identity & Corporate Title Verified',
          description: 'Kenya Companies Registry and KRA Tax Compliance certificate fully attested onchain.',
          status: 'VERIFIED',
          detail: 'Tax Compliance Pin P051882049A active and verified.',
          documentRef: 'KRA-TCC-2026',
        },
        {
          id: 'v3',
          title: 'Title Deeds & Legal Encumbrance Audit',
          description: 'Ardhi House official search results confirm clean title with sectional deed registration.',
          status: 'AUDITED',
          detail: 'Sectional title issued under Sectional Properties Act 2020.',
          documentRef: 'ARDHI-SEARCH-8812',
        },
        {
          id: 'v4',
          title: 'Physical Structural & MEP Inspection Completed',
          description: 'Structural inspection certificate completed by Board of Registration of Architects and Quantity Surveyors.',
          status: 'AVAILABLE',
          detail: 'BORAQS certified engineer audit report on file.',
          documentRef: 'BORAQS-KRN-2026',
        },
      ],
    },
    isDemo: true,
    createdAt: '2026-08-25T11:00:00Z',
  },
  {
    id: 'prop-kigali-05',
    slug: 'kigali-heights-architectural-estate-nyarutarama',
    title: 'Kigali Heights Architectural Estate',
    tagline: 'Modernist 4-bedroom hillside estate in Nyarutarama overlooking the golf course green',
    location: 'Nyarutarama, Kigali, Rwanda',
    neighborhood: 'Nyarutarama Golf View',
    city: 'Kigali',
    country: 'Rwanda',
    price: 310000,
    currency: 'USD',
    tokenSymbol: 'USDT',
    bedrooms: 4,
    bathrooms: 4,
    sizeSqm: 380,
    propertyType: 'Residential',
    status: 'AVAILABLE',
    featuredImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80',
    ],
    description: [
      'Positioned along Nyarutarama’s coveted hillside ridgeline, this 380-sqm architectural residence captures sweeping vistas of the 18-hole Kigali Golf Course.',
      'Constructed with volcanic stone accents, cantilevered terraces, floor-to-ceiling double argon-insulated glazing, and automated climate control.',
    ],
    features: [
      'Unobstructed Golf Course & Rolling Hills Panorama',
      'Cantilevered Sunset Entertaining Terrace',
      'Volcanic Rwandan Stone Feature Walls',
      'High-Efficiency Heat Pump & Radiant Flooring',
      'Automated Security Gates with ANPR Camera System',
      'Dedicated Studio / Work-From-Home Suite',
      'High-Speed Fiber Optic In-Building Conduit',
      'Freehold Electronic Title Registry (RLMUA) Verified',
    ],
    yearBuilt: 2024,
    parkingSpaces: 3,
    titleDeedRef: 'UPI-1/01/08/04/1892',
    seller: {
      id: 'sel-kigali-05',
      name: 'Thousand Hills Holdings SA',
      role: 'Licensed Real Estate Developer',
      address: '0x2D795eA8903c73f3Fa7A0823C837C3322E8a815F',
      verified: true,
      dealsCompleted: 16,
      phone: '+250 788 123 456',
      email: 'invest@thousandhills.rw',
      kycTier: 'Tier 3 Corporate & Deeds Attested',
      companyName: 'Thousand Hills Holdings',
    },
    verification: {
      isPropertyVerified: true,
      isSellerVerified: true,
      isDocumentsReviewed: true,
      isInspectionAvailable: true,
      escrowAvailable: true,
      cadastralSurveyNumber: 'RLMUA/UPI/1/01/08/04/1892',
      titleDeedType: 'Rwanda Land Management and Use Authority (RLMUA) Digital UPI',
      registryOffice: 'Rwanda Land Management and Use Authority (RLMUA)',
      inspectionAgency: 'Bureau Veritas East Africa',
      lastInspectedDate: '2026-09-18',
      smartContractEscrowAddress: TRADELOCK_CONTRACT.address,
      network: `${BOT_CHAIN.name} (Chain ID ${BOT_CHAIN.chainId})`,
      items: [
        {
          id: 'v1',
          title: 'Property Cadastral Survey & Coordinates Verified',
          description: 'Unique Parcel Identifier (UPI) authenticated on Rwanda National Land Registry system with 0 caveat.',
          status: 'VERIFIED',
          detail: 'UPI: 1/01/08/04/1892 digital cadastral deed registered.',
          documentRef: 'UPI-1/01/08/04/1892',
        },
        {
          id: 'v2',
          title: 'Seller Identity & Corporate Title Verified',
          description: 'Rwanda Development Board (RDB) company incorporation and tax clearance certificate certified.',
          status: 'VERIFIED',
          detail: 'RDB TIN 108492019 verified and active.',
          documentRef: 'RDB-CERT-2026',
        },
        {
          id: 'v3',
          title: 'Title Deeds & Legal Encumbrance Audit',
          description: 'Digital land tenure certificate shows clean ownership, fully clear of encumbrances or expropriation claims.',
          status: 'AUDITED',
          detail: 'RLMUA Title e-Certificate issued and attested.',
          documentRef: 'RLMUA-TITLE-1892',
        },
        {
          id: 'v4',
          title: 'Physical Structural & MEP Inspection Completed',
          description: 'City of Kigali One Stop Center compliance certificate and building permit compliance verified.',
          status: 'AVAILABLE',
          detail: 'Architectural as-built inspection certificate on file.',
          documentRef: 'OSC-KGL-2026',
        },
      ],
    },
    isDemo: true,
    createdAt: '2026-08-28T08:30:00Z',
  },
  {
    id: 'prop-accra-06',
    slug: 'cantonments-executive-townhouse-accra',
    title: 'Cantonments Executive Townhouse',
    tagline: 'Refined 4-bedroom gated residence in prime Cantonments with swimming pool and solar infrastructure',
    location: 'Cantonments, Accra, Ghana',
    neighborhood: 'Cantonments Embassy District',
    city: 'Accra',
    country: 'Ghana',
    price: 390000,
    currency: 'USD',
    tokenSymbol: 'USDT',
    bedrooms: 4,
    bathrooms: 4,
    sizeSqm: 340,
    propertyType: 'Terrace',
    status: 'AVAILABLE',
    featuredImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80',
    ],
    description: [
      'Located in Accra’s diplomatic haven of Cantonments, this 340-sqm executive townhouse provides secure, turnkey luxury within minutes of international embassies and Kotoka International Airport.',
      'Features a private courtyard plunge pool, bespoke walnut cabinetry, smart multi-zone climate control, and full solar backup.',
    ],
    features: [
      'Private Courtyard Plunge Pool & Sun Deck',
      'Solar Hybrid Energy System with Lithium Storage',
      'Custom Walnut Joinery & Imported Stone Countertops',
      'Staff Quarters & Service Entrance',
      '24/7 Monitored Security Perimeter with Rapid Response',
      '5 Minutes from Kotoka International Airport',
      'Lands Commission Registered Land Title Certificate',
      'Dedicated 2-Car Garage with EV Charger Outlet',
    ],
    yearBuilt: 2024,
    parkingSpaces: 2,
    titleDeedRef: 'GA/ACR/CAN/LTC/2023/4910',
    seller: {
      id: 'sel-gold-06',
      name: 'Gold Coast Prestige Properties',
      role: 'Accredited Accra Real Estate Group',
      address: '0x7129cB7F83236e7924F0eE70B0Bf253C4EcB3F90',
      verified: true,
      dealsCompleted: 15,
      phone: '+233 30 278 9900',
      email: 'contracts@goldcoastprestige.com.gh',
      kycTier: 'Tier 3 Corporate & Deeds Attested',
      companyName: 'Gold Coast Prestige Ltd',
    },
    verification: {
      isPropertyVerified: true,
      isSellerVerified: true,
      isDocumentsReviewed: true,
      isInspectionAvailable: true,
      escrowAvailable: true,
      cadastralSurveyNumber: 'LC/CAD/CAN/2023/118',
      titleDeedType: 'Lands Commission Land Title Registration Law (PNDCL 152)',
      registryOffice: 'Lands Commission of Ghana (Land Title Registry Division, Cantonments)',
      inspectionAgency: 'TradeLock Certified West Africa Surveyors',
      lastInspectedDate: '2026-09-12',
      smartContractEscrowAddress: TRADELOCK_CONTRACT.address,
      network: `${BOT_CHAIN.name} (Chain ID ${BOT_CHAIN.chainId})`,
      items: [
        {
          id: 'v1',
          title: 'Property Cadastral Survey & Coordinates Verified',
          description: 'Survey Department approved plan with coordinate beacons confirmed on Lands Commission cadastral map.',
          status: 'VERIFIED',
          detail: 'Cadastral Plan No. Y.1942 registered with Lands Commission.',
          documentRef: 'LC/CAD/CAN/2023/118',
        },
        {
          id: 'v2',
          title: 'Seller Identity & Corporate Title Verified',
          description: 'Registrar General’s Department certified company with verified board authority resolution.',
          status: 'VERIFIED',
          detail: 'GRA Tax Identification Number C0004910281 verified.',
          documentRef: 'GRA-TIN-4910',
        },
        {
          id: 'v3',
          title: 'Title Deeds & Legal Encumbrance Audit',
          description: 'Official search certificate from Land Title Registry confirms indefeasible title in seller’s name.',
          status: 'AUDITED',
          detail: 'Land Title Certificate Volume 104 Folio 290 verified.',
          documentRef: 'LTC/2023/4910',
        },
        {
          id: 'v4',
          title: 'Physical Structural & MEP Inspection Completed',
          description: 'Accra Metropolitan Assembly building occupancy certificate issued and structural audit passed.',
          status: 'AVAILABLE',
          detail: 'AMA Building Permit & Habitation Certificate attested.',
          documentRef: 'AMA-HAB-2024',
        },
      ],
    },
    isDemo: true,
    createdAt: '2026-09-01T12:00:00Z',
  },
];

export function getPropertyById(id: string): Property | undefined {
  return DEMO_PROPERTIES.find((p) => p.id === id || p.slug === id);
}

export function filterProperties(
  properties: Property[],
  filters: {
    search?: string;
    location?: string;
    propertyType?: string;
    priceRange?: string;
    bedrooms?: string;
    bathrooms?: string;
    verifiedPropertyOnly?: boolean;
    verifiedSellerOnly?: boolean;
    escrowAvailableOnly?: boolean;
    inspectionAvailableOnly?: boolean;
  },
): Property[] {
  return properties.filter((prop) => {
    // Search query
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const match =
        prop.title.toLowerCase().includes(q) ||
        prop.location.toLowerCase().includes(q) ||
        prop.neighborhood.toLowerCase().includes(q) ||
        prop.city.toLowerCase().includes(q) ||
        prop.propertyType.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Location
    if (filters.location && filters.location !== 'ALL') {
      if (prop.city.toLowerCase() !== filters.location.toLowerCase()) return false;
    }

    // Property Type
    if (filters.propertyType && filters.propertyType !== 'ALL') {
      if (prop.propertyType.toLowerCase() !== filters.propertyType.toLowerCase()) return false;
    }

    // Bedrooms
    if (filters.bedrooms && filters.bedrooms !== 'ALL') {
      const minBeds = parseInt(filters.bedrooms, 10);
      if (!isNaN(minBeds) && prop.bedrooms < minBeds) return false;
    }

    // Bathrooms
    if (filters.bathrooms && filters.bathrooms !== 'ALL') {
      const minBaths = parseInt(filters.bathrooms, 10);
      if (!isNaN(minBaths) && prop.bathrooms < minBaths) return false;
    }

    // Price Range
    if (filters.priceRange && filters.priceRange !== 'ALL') {
      if (filters.priceRange === 'UNDER_200K' && prop.price >= 200000) return false;
      if (filters.priceRange === '200K_400K' && (prop.price < 200000 || prop.price > 400000)) return false;
      if (filters.priceRange === '400K_600K' && (prop.price < 400000 || prop.price > 600000)) return false;
      if (filters.priceRange === 'OVER_600K' && prop.price <= 600000) return false;
    }

    // TradeLock Specific Verification Filters
    if (filters.verifiedPropertyOnly && !prop.verification.isPropertyVerified) return false;
    if (filters.verifiedSellerOnly && !prop.verification.isSellerVerified) return false;
    if (filters.escrowAvailableOnly && !prop.verification.escrowAvailable) return false;
    if (filters.inspectionAvailableOnly && !prop.verification.isInspectionAvailable) return false;

    return true;
  });
}
