import type { Journey } from "./types";
import { img } from "./images";

export const journeys: Journey[] = [
  {
    slug: "golden-triangle",
    name: "The Golden Triangle",
    days: 7,
    theme: ["Heritage", "Culture", "Food"],
    tagline: "Delhi → Agra → Jaipur",
    description:
      "India's classic first loop: the Mughal monuments of Delhi, the Taj at sunrise, and the forts of the Pink City — three cities, a thousand years of empire.",
    heroImage: img("photo-1564507592333-c60657eea523"),
    stops: ["delhi", "agra", "jaipur"],
  },
  {
    slug: "southern-trail",
    name: "The Southern Trail",
    days: 10,
    theme: ["Nature", "Food", "Wellness"],
    tagline: "Bengaluru → Coorg → Kerala backwaters",
    description:
      "From Bengaluru's gardens to Coorg's coffee hills and a houseboat on the Kerala backwaters — the south at its greenest and most unhurried.",
    heroImage: img("photo-1602216056096-3b40cc0c9944"),
    stops: ["bengaluru", "coorg", "mysuru", "alleppey", "kochi"],
  },
  {
    slug: "himalayan-escape",
    name: "The Himalayan Escape",
    days: 9,
    theme: ["Mountains", "Adventure", "Spiritual"],
    tagline: "Delhi → Rishikesh → Manali",
    description:
      "Raft the Ganges at Rishikesh, then climb into the pine valleys of Himachal — mountain air, temple bells and the great Indian road trip.",
    heroImage: img("photo-1483728642387-6c3bdd6c93e5"),
    stops: ["delhi", "rishikesh", "haridwar", "manali", "shimla"],
  },
  {
    slug: "rajasthan-royal",
    name: "The Royal Rajasthan Road",
    days: 8,
    theme: ["Heritage", "Desert", "Culture"],
    tagline: "Jaipur → Jodhpur → Udaipur → Jaisalmer",
    description:
      "Fort after fort across the Thar — the Pink City, the Blue City, lake palaces and the golden fort of the desert, with camel trails in between.",
    heroImage: img("photo-1477587458883-47145ed94245"),
    stops: ["jaipur", "pushkar", "jodhpur", "jaisalmer", "udaipur"],
  },
  {
    slug: "spiritual-north",
    name: "The Spiritual North",
    days: 6,
    theme: ["Spiritual", "Culture", "Food"],
    tagline: "Amritsar → Haridwar → Varanasi",
    description:
      "The Golden Temple's radiance, the Ganges leaving the mountains, and the oldest living city on earth — a journey along India's holiest river.",
    heroImage: img("photo-1561361513-2d000a50f0dc"),
    stops: ["amritsar", "haridwar", "rishikesh", "allahabad", "varanasi"],
  },
  {
    slug: "northeast-odyssey",
    name: "The Northeast Odyssey",
    days: 12,
    theme: ["Nature", "Culture", "Wildlife"],
    tagline: "Guwahati → Kaziranga → Shillong → Cherrapunji",
    description:
      "Rhinos at Kaziranga, waterfalls in Meghalaya and the music of Shillong — the Northeast is India's best-kept secret, and this is the key.",
    heroImage: img("photo-1441974231531-c6227db76b6e"),
    stops: ["guwahati", "kaziranga", "shillong", "cherrapunji", "mawsynram", "gangtok"],
  },
];

export const journeysBySlug = new Map(journeys.map((j) => [j.slug, j]));
