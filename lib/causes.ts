import type { ProjectCategory } from "./types";
import { listSuggestions } from "./suggestions";

/** A cause currently open for funding — something a member can put their $1 toward.
 *  Two sources: curated (picked by the team) and member (came in via suggestions). */
export interface Cause {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  suburb?: string;        // slug, if tied to a suburb
  source: "curated" | "member";
  suggestedBy?: number;   // member number, for member-submitted
  targetCents?: number;
  raisedCents?: number;
  votes?: number;
  /** Up to 3 uploaded images (member-submitted causes). */
  images?: string[];
  createdAt?: string;
  /** Geotag (OpenStreetMap). */
  lat?: number;
  lng?: number;
  locationLabel?: string;
}

/** Team-curated active causes. These are the "ones we feel are relevant". */
export const CURATED_CAUSES: Cause[] = [
  {
    id: "c-shelter-pool",
    title: "Emergency shelter fund",
    description: "A standing pot for same-night motel and crisis-bed stays across the southern Gold Coast. These are the standing causes we think the chain will care about most.",
    category: "Shelter",
    source: "curated",
    targetCents: 200000, raisedCents: 0,
  },
  {
    id: "c-food-relief",
    title: "Weekly food relief",
    description: "Tops up partner community pantries in Burleigh, Palm Beach and Coolangatta. Predictable, every week, no drama.",
    category: "Food",
    source: "curated",
    targetCents: 150000, raisedCents: 0,
  },
  {
    id: "c-rent-bridge",
    title: "Rent bridging",
    description: "One-off payments that stop an eviction during a short gap — between jobs, waiting on Centrelink, a bad fortnight.",
    category: "Rent",
    source: "curated",
    targetCents: 180000, raisedCents: 0,
  },
  {
    id: "c-beach-care",
    title: "Beach & foreshore care",
    description: "Gloves, bags, sharps bins and a coffee run for the volunteer crews keeping our beaches and dunes clean.",
    category: "Beach Cleanup",
    source: "curated",
    targetCents: 60000, raisedCents: 0,
  },
  {
    id: "c-elderly-yards",
    title: "Yard care for elderly neighbours",
    description: "Mowing and clean-ups for residents who physically can't manage it and can't afford a contractor.",
    category: "Mowing",
    source: "curated",
    targetCents: 50000, raisedCents: 0,
  },
  {
    id: "c-youth-sport",
    title: "Get a kid to the comp",
    description: "Travel, entry fees and kit so local kids who qualify don't miss out for the cost of a flight or a jersey.",
    category: "Youth Sport",
    source: "curated",
    targetCents: 120000, raisedCents: 0,
  },
  // ── Palm Beach improvement causes — raised by locals on the community board ──
  {
    id: "c-pb-waterways",
    title: "Clean up Tallebudgera Creek & Pirate Park water",
    description: "Surfrider testing has shown enterococci (faecal contamination) running tens of times over the safe limit at Tallebudgera Creek and Palm Beach Parklands — families report gastro after swimming at the 'Pirate Park' estuary. Fund independent, regular water testing and the work to trace and stop the sources: stormwater drains, possible sewage cross-connections (smoke testing), and dog/runoff pollution, so it's safe to swim again.",
    category: "Environment", suburb: "palm-beach", source: "member",
    targetCents: 600000, raisedCents: 0,
      lat: -28.11, lng: 153.456, locationLabel: "Tallebudgera Creek · Palm Beach Parklands",
},
  {
    id: "c-pb-fishing-line-bins",
    title: "Fishing-line & hook bins along the creeks",
    description: "Discarded nylon line, hooks and weights along Tallebudgera and Currumbin creeks are a major hazard — birds end up at Currumbin Wildlife Hospital, and people walk barefoot over hooks. Install monofilament recycling bins at the bridges and popular fishing spots, and run regular pick-ups.",
    category: "Wildlife", suburb: "palm-beach", source: "member",
    targetCents: 150000, raisedCents: 0,
  },
  {
    id: "c-pb-foreshore",
    title: "Revegetate the foreshore & creek banks",
    description: "Replant the Palm Beach foreshore and dunes, and put living riparian plantings along the waterways instead of bare bluestone. Better habitat, less erosion, a nicer beachfront.",
    category: "Environment", suburb: "palm-beach", source: "member",
    targetCents: 400000, raisedCents: 0,
  },
  {
    id: "c-pb-laguna-park",
    title: "Upgrade Laguna Lake park & playground",
    description: "Laguna Park is hugely popular but tired — the playground is dated next to the newer ones up the coast, and the lake area needs a clean-out. This first-stage fund pays for the quick wins (shade, seating, a tidy-up and new bits of equipment) and builds the case for council to fund the rest.",
    category: "Parks", suburb: "palm-beach", source: "member",
    targetCents: 600000, raisedCents: 0,
      lat: -28.1175, lng: 153.4615, locationLabel: "Laguna Park, Palm Beach",
},
  {
    id: "c-pb-crossings",
    title: "Pedestrian crossings in the shop precinct",
    description: "Crossing the road in the Palm Beach shops (roughly 4th to 8th Avenue) is hard and unsafe for kids, families and older residents. This fund pays for what gets it over the line — independent pedestrian counts, a proper proposal to council and the campaign behind it — to win marked crossings like Coolangatta's.",
    category: "Transport", suburb: "palm-beach", source: "member",
    targetCents: 350000, raisedCents: 0,
      lat: -28.1185, lng: 153.466, locationLabel: "Palm Beach shops, Gold Coast Hwy (4th–8th Ave)",
},
  {
    id: "c-pb-footpaths",
    title: "Fix the footpaths (7th Ave & beyond)",
    description: "Several Palm Beach footpaths are cracked, uneven or missing — 7th Avenue is a standout. Repair the worst stretches so prams, wheelchairs and walkers can get around safely.",
    category: "Repairs", suburb: "palm-beach", source: "member",
    targetCents: 450000, raisedCents: 0,
      lat: -28.1175, lng: 153.467, locationLabel: "7th Avenue, Palm Beach",
},
  {
    id: "c-pb-potholes",
    title: "Pothole & road-repair fund",
    description: "Potholes and rough patches keep getting worse — like the deepening hole at the corner of Bergamont and Agave Streets, Elanora. Fund quick patch-ups on the worst hazards while we push for permanent fixes.",
    category: "Potholes", suburb: "elanora", source: "member",
    targetCents: 300000, raisedCents: 0,
      lat: -28.129, lng: 153.448, locationLabel: "Bergamont St & Agave St, Elanora",
},
  {
    id: "c-pb-night-safety",
    title: "Night-time safety: cameras & lighting",
    description: "Residents want better security after dark — sensible camera coverage at known trouble spots and better lighting along paths and parks. Done openly and lawfully, with the community, not vigilante.",
    category: "Security", suburb: "palm-beach", source: "member",
    targetCents: 400000, raisedCents: 0,
  },
  {
    id: "c-pb-tidy-crew",
    title: "Graffiti, overgrowth & dumped-junk tidy-up",
    description: "Paint over tagging, clear overgrown vegetation blocking sightlines, repaint faded signs and remove dumped items (like the stripped moped at Townson & 14th). A standing kitty to keep Palmy looking cared-for.",
    category: "Painting", suburb: "palm-beach", source: "member",
    targetCents: 250000, raisedCents: 0,
  },
  {
    id: "c-pb-cleanups",
    title: "Beach & park clean-up days",
    description: "Regular community clean-ups of the beach, parks and the walkway by the pirate ship — gloves, bags, bins and a coffee for volunteers, with local schools invited to join as service learning.",
    category: "Beach Cleanup", suburb: "palm-beach", source: "member",
    targetCents: 150000, raisedCents: 0,
  },
  {
    id: "c-pb-rough-sleepers",
    title: "Support for rough sleepers",
    description: "There's a growing camp under the M1 bridge at the end of Tallebudgera Drive. Rather than just move people on, fund dignified outreach — basics, a connection to services and housing support — working with the groups already doing this.",
    category: "Social Work", suburb: "palm-beach", source: "member",
    targetCents: 300000, raisedCents: 0,
      lat: -28.106, lng: 153.438, locationLabel: "M1 underpass, Tallebudgera Drive",
},
  {
    id: "c-pb-bins-dogwaste",
    title: "More bins & dog-waste stations on the creek walks",
    description: "The Currumbin Creek walk to the alley needs more dog-poo bag stations, and the waterways need more general bins. Small spend, big difference to how clean the place stays.",
    category: "Environment", suburb: "currumbin", source: "member",
    targetCents: 100000, raisedCents: 0,
      lat: -28.138, lng: 153.486, locationLabel: "Currumbin Creek walk",
},
  {
    id: "c-pb-dark-sky",
    title: "Turtle-friendly beachfront lighting",
    description: "Reduce light pollution spilling onto the beach at night — shielded, warm, turtle-friendly lighting that's better for wildlife and still keeps paths safe.",
    category: "Environment", suburb: "palm-beach", source: "member",
    targetCents: 300000, raisedCents: 0,
  },
  {
    id: "c-pb-art-wall",
    title: "A legal street-art wall for young artists",
    description: "Give kids somewhere to practise street art properly — a dedicated graffiti/art wall — which also takes tagging off fences and underpasses.",
    category: "Arts & Culture", suburb: "palm-beach", source: "member",
    targetCents: 200000, raisedCents: 0,
  },
  {
    id: "c-where-needed",
    title: "Where it's needed most",
    description: "Don't want to choose? This goes into the general pot and follows the weekly vote. The default for auto-allocate.",
    category: "Other",
    source: "curated",
  },
];

export const AUTO_ALLOCATE_CAUSE_ID = "c-where-needed";

/** All causes available for allocation: curated + member-submitted (from suggestions). */
export async function listActiveCauses(): Promise<Cause[]> {
  const suggestions = await listSuggestions();
  const memberCauses: Cause[] = suggestions.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    category: s.category,
    suburb: s.suburb,
    source: "member",
    suggestedBy: s.suggestedBy,
    votes: s.votes,
    images: s.images,
    targetCents: s.targetCents,
    createdAt: s.createdAt,
    lat: s.lat,
    lng: s.lng,
    locationLabel: s.locationLabel,
  }));
  return [...CURATED_CAUSES, ...memberCauses];
}

export async function getCause(id: string): Promise<Cause | null> {
  const all = await listActiveCauses();
  return all.find((c) => c.id === id) ?? null;
}
