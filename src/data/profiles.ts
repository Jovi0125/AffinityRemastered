export interface Profile {
  id: string;
  name: string;
  location: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  interests: string[];
  mutuals?: number;
  posts: Post[];
}

export interface Post {
  id: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export const profiles: Profile[] = [
  {
    id: "maya-chen",
    name: "Maya Chen",
    location: "Tokyo, Japan",
    bio: "Film photographer & tea enthusiast. Finding beauty in the quiet, the considered, and the overlooked.",
    avatar: "https://images.unsplash.com/photo-1763385128836-053af3c6a91f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    coverImage: "https://images.unsplash.com/photo-1557735567-d1b80e463789?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200",
    interests: ["Film Photography", "Tea Ceremony", "Travel", "Minimalism", "Literature"],
    mutuals: 12,
    posts: [
      {
        id: "p1",
        image: "https://images.unsplash.com/photo-1557735567-d1b80e463789?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        caption: "Morning ritual. There is something meditative about the pour.",
        likes: 284, comments: 18, timestamp: "2 days ago",
      },
      {
        id: "p2",
        image: "https://images.unsplash.com/photo-1628703601609-40524e7c986a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        caption: "Concrete and light. The architecture of silence.",
        likes: 412, comments: 31, timestamp: "5 days ago",
      },
      {
        id: "p3",
        image: "https://images.unsplash.com/photo-1544788643-f385285b3275?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        caption: "Side A. Always Side A first.",
        likes: 197, comments: 9, timestamp: "1 week ago",
      },
    ],
  },
  {
    id: "lucas-park",
    name: "Lucas Park",
    location: "Seoul, South Korea",
    bio: "Architect by day, record collector by night. I design spaces that breathe.",
    avatar: "https://images.unsplash.com/photo-1752649935868-dd9080445d18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    coverImage: "https://images.unsplash.com/photo-1764922168474-8048361bc764?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200",
    interests: ["Architecture", "Vinyl Records", "Jazz", "Urban Photography", "Cooking"],
    mutuals: 8,
    posts: [
      {
        id: "p4",
        image: "https://images.unsplash.com/photo-1764922168474-8048361bc764?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        caption: "Empty rooms hold the most weight.",
        likes: 531, comments: 44, timestamp: "1 day ago",
      },
      {
        id: "p5",
        image: "https://images.unsplash.com/photo-1769103638505-7efc41b3b1d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        caption: "The city at 6am belongs to no one.",
        likes: 389, comments: 22, timestamp: "3 days ago",
      },
    ],
  },
  {
    id: "sofia-reyes",
    name: "Sofia Reyes",
    location: "Barcelona, Spain",
    bio: "Writer, wanderer. Collector of small moments and strong coffee.",
    avatar: "https://images.unsplash.com/photo-1739653778430-57ae79887c85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    interests: ["Writing", "Coffee", "Art History", "Fashion", "Film"],
    mutuals: 5,
    posts: [
      {
        id: "p6",
        image: "https://images.unsplash.com/photo-1563819697786-d1840b802726?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        caption: "A Saturday well spent.",
        likes: 623, comments: 57, timestamp: "4 hours ago",
      },
    ],
  },
  {
    id: "james-webb",
    name: "James Webb",
    location: "Portland, Oregon",
    bio: "Outdoors, always. Hiking trails and cold brew. Quiet over loud.",
    avatar: "https://images.unsplash.com/photo-1601926299866-6a5c9bfa6be0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    interests: ["Hiking", "Camping", "Cold Brew", "Minimalism", "Woodworking"],
    mutuals: 3,
    posts: [
      {
        id: "p7",
        image: "https://images.unsplash.com/photo-1728413704912-55beeee843ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        caption: "3,200m. Still going.",
        likes: 744, comments: 63, timestamp: "6 hours ago",
      },
    ],
  },
  {
    id: "akira-tanaka",
    name: "Akira Tanaka",
    location: "Kyoto, Japan",
    bio: "Type designer and visual storyteller. Every character has a soul.",
    avatar: "https://images.unsplash.com/photo-1763224293772-6e9110df0650?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    interests: ["Typography", "Graphic Design", "Coffee", "Architecture", "Books"],
    mutuals: 19,
    posts: [],
  },
  {
    id: "elara-stone",
    name: "Elara Stone",
    location: "London, UK",
    bio: "Museum curator. Jazz lover. I believe the analog will outlast the digital.",
    avatar: "https://images.unsplash.com/photo-1563819697786-d1840b802726?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    interests: ["Jazz", "Museums", "Vinyl Records", "Literature", "Photography"],
    mutuals: 7,
    posts: [],
  },
];

export const allInterests = [
  "Film Photography", "Travel", "Minimalism", "Literature", "Tea Ceremony",
  "Architecture", "Vinyl Records", "Jazz", "Urban Photography", "Cooking",
  "Writing", "Coffee", "Art History", "Fashion", "Film",
  "Hiking", "Camping", "Woodworking", "Typography", "Graphic Design",
  "Museums", "Books", "Cold Brew", "Yoga", "Ceramics",
];

export const conversations = [
  {
    id: "c1",
    profile: profiles[0],
    lastMessage: "I was actually thinking the same thing about film vs digital…",
    timestamp: "2m ago",
    unread: 2,
    messages: [
      { id: "m1", from: "them", text: "Your last photo series was incredible. What film stock were you using?", time: "10:12" },
      { id: "m2", from: "me",   text: "Thank you so much! It was Kodak Portra 400, shot in a bit of overexposure.", time: "10:15" },
      { id: "m3", from: "them", text: "That explains the softness in the highlights. Do you ever shoot Ilford?", time: "10:18" },
      { id: "m4", from: "me",   text: "All the time — HP5 is basically a part of my personality at this point.", time: "10:19" },
      { id: "m5", from: "them", text: "I was actually thinking the same thing about film vs digital…", time: "10:21" },
    ],
  },
  {
    id: "c2",
    profile: profiles[1],
    lastMessage: "The Barragan show at the Tate is not to be missed.",
    timestamp: "1h ago",
    unread: 0,
    messages: [
      { id: "m6", from: "them", text: "Did you catch the Barragan exhibition?", time: "09:03" },
      { id: "m7", from: "me",   text: "Not yet — is it worth the trip to London?", time: "09:10" },
      { id: "m8", from: "them", text: "The Barragan show at the Tate is not to be missed.", time: "09:12" },
    ],
  },
  {
    id: "c3",
    profile: profiles[2],
    lastMessage: "Let me know when you're in Barcelona — I know all the good spots.",
    timestamp: "Yesterday",
    unread: 0,
    messages: [
      { id: "m9",  from: "me",   text: "Your writing on solitude was something I needed to read today.", time: "18:44" },
      { id: "m10", from: "them", text: "That means everything, genuinely.", time: "19:02" },
      { id: "m11", from: "them", text: "Let me know when you're in Barcelona — I know all the good spots.", time: "19:03" },
    ],
  },
  {
    id: "c4",
    profile: profiles[3],
    lastMessage: "The trail starts at dawn. Bring layers.",
    timestamp: "2 days ago",
    unread: 0,
    messages: [
      { id: "m12", from: "them", text: "The trail starts at dawn. Bring layers.", time: "20:55" },
    ],
  },
];
