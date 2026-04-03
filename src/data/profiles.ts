export interface SupabaseProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string;
  bio: string;
  interests: string[];
  created_at?: string;
}

export const allInterests = [
  "Film Photography", "Travel", "Minimalism", "Literature", "Tea Ceremony",
  "Architecture", "Vinyl Records", "Jazz", "Urban Photography", "Cooking",
  "Writing", "Coffee", "Art History", "Fashion", "Film",
  "Hiking", "Camping", "Woodworking", "Typography", "Graphic Design",
  "Museums", "Books", "Cold Brew", "Yoga", "Ceramics",
];

/* ------------------------------------------------------------------ */
/* Demo data — ONLY used by decorative homepage sections (Hero, etc)   */
/* Real pages (Explore, Profile, Messages) fetch from Supabase.       */
/* ------------------------------------------------------------------ */

export interface DemoProfile {
  id: string;
  name: string;
  location: string;
  bio: string;
  avatar: string;
  interests: string[];
}

export const demoProfiles: DemoProfile[] = [
  {
    id: "demo-maya",
    name: "Maya Chen",
    location: "Tokyo, Japan",
    bio: "Film photographer & tea enthusiast.",
    avatar: "https://images.unsplash.com/photo-1763385128836-053af3c6a91f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    interests: ["Film Photography", "Tea Ceremony", "Travel"],
  },
  {
    id: "demo-lucas",
    name: "Lucas Park",
    location: "Seoul, South Korea",
    bio: "Architect by day, record collector by night.",
    avatar: "https://images.unsplash.com/photo-1752649935868-dd9080445d18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    interests: ["Architecture", "Vinyl Records", "Jazz"],
  },
  {
    id: "demo-sofia",
    name: "Sofia Reyes",
    location: "Barcelona, Spain",
    bio: "Writer, wanderer. Collector of small moments.",
    avatar: "https://images.unsplash.com/photo-1739653778430-57ae79887c85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    interests: ["Writing", "Coffee", "Art History"],
  },
  {
    id: "demo-james",
    name: "James Webb",
    location: "Portland, Oregon",
    bio: "Outdoors, always. Hiking trails and cold brew.",
    avatar: "https://images.unsplash.com/photo-1601926299866-6a5c9bfa6be0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    interests: ["Hiking", "Camping", "Cold Brew"],
  },
  {
    id: "demo-akira",
    name: "Akira Tanaka",
    location: "Kyoto, Japan",
    bio: "Type designer and visual storyteller.",
    avatar: "https://images.unsplash.com/photo-1763224293772-6e9110df0650?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    interests: ["Typography", "Graphic Design", "Coffee"],
  },
];
