import type { ProjectCategory } from "./types";

export interface Suburb {
  slug: string;
  name: string;
  postcode: string;
  intro: string;
  /** What we want this chapter of the chain to focus on, locally. */
  focus: string[];
  /** Projected categories most relevant to this suburb. */
  priorityCategories: ProjectCategory[];
  memberCount: number;
  projectsFunded: number;
  amountDeployedCents: number;
}

export const SUBURBS: Suburb[] = [
  {
    slug: "palm-beach",
    name: "Palm Beach",
    postcode: "4221",
    intro: "Where The Dollar Chain started. Our home base on the southern Gold Coast.",
    focus: [
      "Restoring the Palm Beach foreshore and dunes",
      "Supporting elderly residents through bills and yard work",
      "Crisis shelter funding for families escaping unsafe homes",
    ],
    priorityCategories: ["Shelter", "Beach Cleanup", "Utilities", "Mowing"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "burleigh-heads",
    name: "Burleigh Heads",
    postcode: "4220",
    intro: "Headland, beach, hinterland. Restoring all three.",
    focus: ["Burleigh community pantry top-ups", "Heritage building paint and repair", "Mick Schamburg Park clean-ups"],
    priorityCategories: ["Food", "Painting", "Beach Cleanup", "Repairs"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "burleigh-waters",
    name: "Burleigh Waters",
    postcode: "4220",
    intro: "Quiet suburban streets, ageing population, gaps the council can't reach.",
    focus: ["Yard maintenance for elderly residents", "Street tree replanting", "Pothole patches"],
    priorityCategories: ["Mowing", "Repairs", "Potholes"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "miami",
    name: "Miami",
    postcode: "4220",
    intro: "Pizzo Park to Nobby Beach. Local schools, surf clubs, single-parent households.",
    focus: ["Primary school breakfast programs", "Surf club uniforms for kids in care", "Nobby Beach gutter clean-outs"],
    priorityCategories: ["Education", "Food", "Beach Cleanup"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "mermaid-beach",
    name: "Mermaid Beach",
    postcode: "4218",
    intro: "Million-dollar postcodes next to people doing it tough. Closing the gap quietly.",
    focus: ["Discreet rent bridging", "Medical bill cover for renters", "Mowing for elderly homeowners"],
    priorityCategories: ["Rent", "Medical", "Mowing"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "currumbin",
    name: "Currumbin",
    postcode: "4223",
    intro: "Creek mouth to sanctuary. Wildlife, waterway, and the people who live alongside them.",
    focus: ["Currumbin Creek mouth clean-ups", "Lawn care in Currumbin Hill estates", "Bridging rent for older renters"],
    priorityCategories: ["Beach Cleanup", "Mowing", "Rent"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "currumbin-waters",
    name: "Currumbin Waters",
    postcode: "4223",
    intro: "Family suburb, school catchments, the steady middle. Small lifts that go a long way.",
    focus: ["School supplies for kids on the bursary", "Transport top-ups for tradies", "Grocery vouchers for solo parents"],
    priorityCategories: ["Education", "Transport", "Food"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "currumbin-valley",
    name: "Currumbin Valley",
    postcode: "4223",
    intro: "Hinterland properties, long driveways, isolation when things go wrong.",
    focus: ["Solar repairs and battery top-ups off-grid", "Bushfire-prep yard clearing", "Welfare check-ins for solo elderly"],
    priorityCategories: ["Utilities", "Mowing", "Social Work"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "elanora",
    name: "Elanora",
    postcode: "4221",
    intro: "Schools, shops, churches. The everyday infrastructure of the south coast.",
    focus: ["Breakfast club staples", "After-school program top-ups", "Pothole patches near school zones"],
    priorityCategories: ["Education", "Food", "Potholes"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "tugun",
    name: "Tugun",
    postcode: "4224",
    intro: "Tucked between Currumbin and the airport. Quiet, ageing, often overlooked.",
    focus: ["Pharmacy bill cover", "Reading Park accessibility upgrades", "Mowing for pensioners"],
    priorityCategories: ["Medical", "Mowing", "Repairs"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "bilinga",
    name: "Bilinga",
    postcode: "4225",
    intro: "Beachside strip on the southern fringe. Small, tight community.",
    focus: ["Beach pavilion repaints", "Sand-dune restoration", "Senior groceries delivery"],
    priorityCategories: ["Painting", "Beach Cleanup", "Food"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "kirra",
    name: "Kirra",
    postcode: "4225",
    intro: "World-class point break, working-class housing right next to it.",
    focus: ["Kirra Beach litter sweeps", "Surfboard repairs for youth program", "Crisis bed nights"],
    priorityCategories: ["Beach Cleanup", "Repairs", "Shelter"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "coolangatta",
    name: "Coolangatta",
    postcode: "4225",
    intro: "Border town. Hospitality workers, casual shifts, tight margins.",
    focus: ["Bridging rent for shift workers", "Mental health outreach with Headspace", "Power-bill cover in summer"],
    priorityCategories: ["Rent", "Social Work", "Utilities"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "tallebudgera",
    name: "Tallebudgera",
    postcode: "4228",
    intro: "Creek, sports fields, family homes spread out over a wide valley.",
    focus: ["Sports kit for kids who can't afford it", "Creek bank weed pulls", "Repairs at the community hall"],
    priorityCategories: ["Education", "Beach Cleanup", "Repairs"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
  {
    slug: "tallebudgera-valley",
    name: "Tallebudgera Valley",
    postcode: "4228",
    intro: "Acreage, rural roads, neighbours far apart. Helping each other across the distance.",
    focus: ["Rural transport vouchers", "Veterinary bills for working dogs", "Yard clearing before fire season"],
    priorityCategories: ["Transport", "Medical", "Mowing"],
    memberCount: 0, projectsFunded: 0, amountDeployedCents: 0,
  },
];

export const SUBURB_SLUGS = SUBURBS.map((s) => s.slug);
export const getSuburb = (slug: string) => SUBURBS.find((s) => s.slug === slug) || null;
