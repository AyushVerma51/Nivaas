import type { Experience } from "./types";
import { ss } from "./images";

export const experiences: Experience[] = [
  {
    slug: "mountains",
    name: "Mountains",
    tagline: "Where India meets the sky",
    description:
      "From Ladakh's moonscapes to Sikkim's Kanchenjunga views, the Himalaya runs the length of India's crown — snow, monasteries and roads that make you hold your breath.",
    heroImage: ss("India mountains Himalaya peaks snow"),
    destinations: ["leh", "srinagar", "manali", "darjeeling", "gangtok", "shimla", "tawang"],
  },
  {
    slug: "beaches",
    name: "Beaches",
    tagline: "Coastlines in every mood",
    description:
      "Goa's shacks, Kerala's palms, the Andamans' coral reefs and Lakshadweep's lagoons — 7,500 kilometres of coastline, endlessly varied.",
    heroImage: ss("India beach coast palm turquoise sea"),
    destinations: ["goa", "andaman", "lakshadweep", "kanyakumari", "puducherry", "diu"],
  },
  {
    slug: "heritage",
    name: "Heritage",
    tagline: "Stone that remembers",
    description:
      "The Taj, Hampi's ruins, Khajuraho's carvings, Rajasthan's forts — India's past is written in some of the greatest monuments ever raised.",
    heroImage: ss("India heritage Taj Mahal palace fort temple"),
    destinations: ["agra", "jaipur", "jodhpur", "udaipur", "hampi", "khajuraho", "konark", "hyderabad", "mahabalipuram", "ajanta-ellora"],
  },
  {
    slug: "wildlife",
    name: "Wildlife",
    tagline: "Tigers, rhinos and lions",
    description:
      "Bengal tigers in Kanha, one-horned rhinos in Kaziranga, Asiatic lions in Gir — India protects more big cats than anywhere else on earth.",
    heroImage: ss("India wildlife tiger jungle safari national park"),
    destinations: ["kanha", "kaziranga", "gir", "sundarbans", "mawsynram"],
  },
  {
    slug: "spiritual",
    name: "Spiritual",
    tagline: "The oldest pilgrimages on earth",
    description:
      "Varanasi's ghats, Bodh Gaya's Bodhi tree, Amritsar's Golden Temple, Rishikesh's ashrams — India has been a destination for seekers for millennia.",
    heroImage: ss("India spiritual temple prayer Varanasi Ganga"),
    destinations: ["varanasi", "bodh-gaya", "amritsar", "rishikesh", "haridwar", "madurai", "pushkar", "dwarka", "tirupati"],
  },
  {
    slug: "food",
    name: "Food",
    tagline: "India, one meal at a time",
    description:
      "Hyderabadi biryani, Amritsari kulcha, Kolkata rolls, Kerala sadya, Banarasi chaat — a country whose history is best eaten.",
    heroImage: ss("Indian food biryani thali spice cuisine"),
    destinations: ["hyderabad", "amritsar", "kolkata", "lucknow", "varanasi", "mumbai", "kochi", "delhi"],
  },
  {
    slug: "adventure",
    name: "Adventure",
    tagline: "Push the limits of the map",
    description:
      "Raft the Ganges at Rishikesh, ride Khardung La in Ladakh, trek Dzüko's flower valleys — India's playground is enormous.",
    heroImage: ss("India adventure rafting mountains trekking river"),
    destinations: ["rishikesh", "leh", "manali", "dzuko", "cherrapunji", "andaman", "gulmarg"],
  },
  {
    slug: "nature",
    name: "Nature",
    tagline: "Green, misty, wild",
    description:
      "Kerala's backwaters, Meghalaya's living bridges, Coorg's coffee hills — India's landscapes shift from rainforest to desert in a single day's drive.",
    heroImage: ss("India nature forest green waterfall Kerala backwaters"),
    destinations: ["alleppey", "munnar", "coorg", "cherrapunji", "mawsynram", "ooty", "chitrakote", "kutch"],
  },
  {
    slug: "culture",
    name: "Culture",
    tagline: "A civilization still performing",
    description:
      "Kathakali, Kuchipudi, Naga festivals, Kolkata's adda, Kochi's Chinese nets — India's cultures are not museum pieces; they are alive and loud.",
    heroImage: ss("India culture city street festival dance music"),
    destinations: ["kochi", "madurai", "kohima", "shillong", "kolkata", "puducherry", "mysuru", "bengaluru"],
  },
  {
    slug: "festivals",
    name: "Festivals",
    tagline: "Every month, a celebration",
    description:
      "Diwali's lamps, Holi's colours, Pushkar's camel fair, Khajuraho's dance festival, Hornbill's tribes — India celebrates more days than the calendar has.",
    heroImage: ss("India festival Diwali Holi celebration color light"),
    destinations: ["pushkar", "khajuraho", "kohima", "haridwar", "jaipur", "mysuru", "varanasi"],
  },
];

export const experiencesBySlug = new Map(
  experiences.map((e) => [e.slug, e]),
);
