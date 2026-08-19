/**
 * Seed content for the platform — 3 cities to start (spec section 9 recommends
 * 2–3 seed cities before scaling). City guide content is curated here and can
 * later be moved to an admin CMS.
 *
 * Images are Wikimedia Commons thumbnails (upload.wikimedia.org) — free to
 * hotlink, sized by the `NNNpx-` segment of the URL. Sourced via the
 * Wikipedia REST summary API; see `tmp-fetch-images.mjs` history for queries.
 */

export interface SeedCity {
  name: string;
  state: string;
  description: string;
  /** [longitude, latitude] of the approximate city center. */
  center: [number, number];
  cover_image_url: string | null;
  touristSpots: {
    name: string;
    description: string;
    category: "historical" | "nature" | "religious" | "adventure";
    image_url: string | null;
  }[];
  dishes: {
    name: string;
    description: string;
    where_to_try: string;
    image_url: string | null;
  }[];
}

export const seedCities: SeedCity[] = [
  {
    name: "Bengaluru",
    state: "Karnataka",
    description:
      "India's Silicon Valley — a garden city of tech parks, breweries, and year-round pleasant weather.",
    center: [77.5946, 12.9716],
    cover_image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/View_from_Visvesvaraya_Industrial_and_Technological_Museum_%282025%29_02.jpg/1280px-View_from_Visvesvaraya_Industrial_and_Technological_Museum_%282025%29_02.jpg",
    touristSpots: [
      {
        name: "Bangalore Palace",
        description: "A Tudor-style palace built in 1887, surrounded by 453 acres of gardens.",
        category: "historical",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Bangalore_Mysore_Maharaja_Palace.jpg/500px-Bangalore_Mysore_Maharaja_Palace.jpg",
      },
      {
        name: "Cubbon Park",
        description: "300-acre green heart of the city, perfect for morning walks and cycling.",
        category: "nature",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Cubbon_Park_W.jpg/500px-Cubbon_Park_W.jpg",
      },
      {
        name: "ISKCON Temple",
        description: "One of the largest ISKCON temples in the world, a striking cultural landmark.",
        category: "religious",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/ISKCON_Banglaore_Temple.jpg/500px-ISKCON_Banglaore_Temple.jpg",
      },
      {
        name: "Nandi Hills",
        description: "A 60 km morning drive to sunrise viewpoints and trekking trails.",
        category: "adventure",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Sunrise_at_Nandi_Hills.jpg/500px-Sunrise_at_Nandi_Hills.jpg",
      },
    ],
    dishes: [
      {
        name: "Bisi Bele Bath",
        description: "Spicy, savory rice-lentil hotchpotch with vegetables and ghee.",
        where_to_try: "MTR, Lalbagh Road",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Bisi_Bele_Bath_%28Bisibelebath%29.JPG/500px-Bisi_Bele_Bath_%28Bisibelebath%29.JPG",
      },
      {
        name: "Masala Dosa",
        description: "Crisp fermented crepe stuffed with spiced potato, served with chutneys.",
        where_to_try: "Vidyarthi Bhavan, Basavanagudi",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Masala_Dosa_2023.jpg/500px-Masala_Dosa_2023.jpg",
      },
      {
        name: "Ragi Mudde",
        description: "Finger-millet dumplings served with sambar or soppu saaru.",
        where_to_try: "Hallimane, Jayanagar",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/RAGI_MUDDE.JPG/500px-RAGI_MUDDE.JPG",
      },
    ],
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    description:
      "The city of dreams — maximum city, home to Bollywood, the Marine Drive arc, and the best vada pav in India.",
    center: [72.8777, 19.076],
    cover_image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Mumbai_Bandra-Worli_Sea_Link.jpg/1280px-Mumbai_Bandra-Worli_Sea_Link.jpg",
    touristSpots: [
      {
        name: "Gateway of India",
        description: "Iconic basalt arch on the waterfront, built to commemorate King George V's visit.",
        category: "historical",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/500px-Mumbai_03-2016_30_Gateway_of_India.jpg",
      },
      {
        name: "Marine Drive",
        description: "The 3.6 km 'Queen's Necklace' promenade curving along Back Bay.",
        category: "nature",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Mumbai_03-2016_27_skyline_at_Marine_Drive.jpg/500px-Mumbai_03-2016_27_skyline_at_Marine_Drive.jpg",
      },
      {
        name: "Siddhivinayak Temple",
        description: "Mumbai's most beloved Ganesha temple, visited by devotees and celebrities alike.",
        category: "religious",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Shree_Siddhivinayak_Temple_Mumbai.jpg/500px-Shree_Siddhivinayak_Temple_Mumbai.jpg",
      },
      {
        name: "Elephanta Caves",
        description: "UNESCO-listed rock-cut cave temples on an island a short ferry away.",
        category: "adventure",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Elephanta_Caves_Trimurti.jpg/500px-Elephanta_Caves_Trimurti.jpg",
      },
    ],
    dishes: [
      {
        name: "Vada Pav",
        description: "Spiced potato fritter in a soft pav bun with garlic chutney — Mumbai's burger.",
        where_to_try: "Ashok Vada Pav, Dadar",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Vada_Pav-Indian_street_food.JPG/500px-Vada_Pav-Indian_street_food.JPG",
      },
      {
        name: "Pav Bhaji",
        description: "Buttery mashed-vegetable curry scooped up with toasted pav.",
        where_to_try: "Sardar Refreshments, Tardeo",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Bambayya_Pav_bhaji.jpg/500px-Bambayya_Pav_bhaji.jpg",
      },
      {
        name: "Bombay Frankie",
        description: "Kati-roll style wrap of spiced filling in a flaky roti.",
        where_to_try: "Frankie shops on Linking Road, Bandra",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Kolkata_Rolls.jpg/500px-Kolkata_Rolls.jpg",
      },
    ],
  },
  {
    name: "Delhi",
    state: "Delhi",
    description:
      "The capital — 1,000 years of history layered across Mughal forts, spice bazaars, and modern boulevards.",
    center: [77.209, 28.6139],
    cover_image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Jama_Masjid_2011.jpg/1280px-Jama_Masjid_2011.jpg",
    touristSpots: [
      {
        name: "Red Fort",
        description: "Mughal emperor Shah Jahan's sandstone fort, a UNESCO World Heritage site.",
        category: "historical",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Delhi_fort.jpg/500px-Delhi_fort.jpg",
      },
      {
        name: "Lodhi Gardens",
        description: "Beautiful park dotted with 15th-century tombs and ancient trees.",
        category: "nature",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Lodhi_Gardens_on_a_sunny_day.jpg/500px-Lodhi_Gardens_on_a_sunny_day.jpg",
      },
      {
        name: "Akshardham Temple",
        description: "Modern Hindu cultural complex with intricate carvings and a light-and-water show.",
        category: "religious",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/New_Delhi_Temple.jpg/500px-New_Delhi_Temple.jpg",
      },
      {
        name: "Qutub Minar",
        description: "The world's tallest brick minaret, standing since the 12th century.",
        category: "adventure",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Qutb_Minar_2022.jpg/500px-Qutb_Minar_2022.jpg",
      },
    ],
    dishes: [
      {
        name: "Chole Bhature",
        description: "Puffy fried bread with spicy chickpea curry and pickled onions.",
        where_to_try: "Sita Ram Diwan Chand, Paharganj",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Chole_Bhature_from_Nagpur.JPG/500px-Chole_Bhature_from_Nagpur.JPG",
      },
      {
        name: "Paranthe Wali Gali",
        description: "Stuffed parathas — from potato to rabri — fried in desi ghee.",
        where_to_try: "Paranthe Wali Gali, Chandni Chowk",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Triangle_paratha_%28cropped%29.JPG/500px-Triangle_paratha_%28cropped%29.JPG",
      },
      {
        name: "Daulat Ki Chaat",
        description: "A fleeting winter-only dessert of milk foam and sugar — eat it before noon.",
        where_to_try: "Chandni Chowk winter mornings",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Malaiyo_Pehalwaan_lassi_in_front_of_ravidas_gate_LANKA._Varanasi_Uttar_Pradesh.jpg/500px-Malaiyo_Pehalwaan_lassi_in_front_of_ravidas_gate_LANKA._Varanasi_Uttar_Pradesh.jpg",
      },
    ],
  },
  {
    name: "Gurugram",
    state: "Haryana",
    description:
      "Delhi's corporate satellite — glass towers, malls, and the Cyber Hub food scene, 30 km southwest of the capital.",
    center: [77.0266, 28.4595],
    cover_image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Cyber_City_View.jpg/1280px-Cyber_City_View.jpg",
    touristSpots: [
      {
        name: "Kingdom of Dreams",
        description: "India's live-entertainment district with theater, art, and cultural shows.",
        category: "adventure",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Culture_Gully_and_Nautanki_Mahal_auditorium%2C_Kingdom_of_Dreams%2C_Gurgaon.jpg/500px-Culture_Gully_and_Nautanki_Mahal_auditorium%2C_Kingdom_of_Dreams%2C_Gurgaon.jpg",
      },
      {
        name: "Sultanpur National Park",
        description: "A bird sanctuary with resident and migratory species, an easy morning drive away.",
        category: "nature",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Sultanpur_Bird_Sanctuary%2C_Gurgaon.jpg/500px-Sultanpur_Bird_Sanctuary%2C_Gurgaon.jpg",
      },
      {
        name: "Sheetala Mata Temple",
        description: "A centuries-old hillside temple and Gurugram's most visited place of worship.",
        category: "religious",
        image_url: null,
      },
    ],
    dishes: [
      {
        name: "Cyber Hub food crawl",
        description: "Dozens of restaurants and breweries in one open-air plaza — from kebabs to ramen.",
        where_to_try: "Cyber Hub, DLF Phase 2",
        image_url: null,
      },
      {
        name: "Dhaba-style kadhai chicken",
        description: "Rustic roadside-style curry cooked in a heavy iron kadhai with freshly ground spices.",
        where_to_try: "Dhaba Estd. 1986, Sector 29",
        image_url: null,
      },
    ],
  },
  {
    name: "Pune",
    state: "Maharashtra",
    description:
      "The cultural capital of Maharashtra — forts, colleges, and the misal pav capital of India, 120 km from Mumbai.",
    center: [73.8567, 18.5204],
    cover_image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Pune_West_skyline_-_March_2017.jpg/1280px-Pune_West_skyline_-_March_2017.jpg",
    touristSpots: [
      {
        name: "Shaniwar Wada",
        description: "The 18th-century seat of the Peshwas, with nightly sound-and-light shows.",
        category: "historical",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Front_view_of_Shaniwar_Wada_illuminated.jpg/500px-Front_view_of_Shaniwar_Wada_illuminated.jpg",
      },
      {
        name: "Aga Khan Palace",
        description: "A grand palace that served as a prison for Gandhi — now a memorial museum.",
        category: "historical",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Pune_Palace.jpg/500px-Pune_Palace.jpg",
      },
      {
        name: "Sinhagad Fort",
        description: "A dramatic hill fort with trekking trails and sweeping views of the Sahyadris.",
        category: "adventure",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Sinhagad.jpg/500px-Sinhagad.jpg",
      },
    ],
    dishes: [
      {
        name: "Misal Pav",
        description: "Spicy sprouted-bean curry topped with farsan, served with soft pav — Pune's signature.",
        where_to_try: "Shree Krishna Misal, Narayan Peth",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Kolhapuri_Misal_Pav.jpg/500px-Kolhapuri_Misal_Pav.jpg",
      },
      {
        name: "Puran Poli",
        description: "Sweet flatbread stuffed with chana dal and jaggery, finished with ghee.",
        where_to_try: "Rupali's on FC Road",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Puran_Poli.jpg/500px-Puran_Poli.jpg",
      },
      {
        name: "Bakarwadi",
        description: "Crisp spiral savoury snack of gram flour and spices — the classic Pune mithai.",
        where_to_try: "Chitale Bandhu Mithaiwale",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Bhakarwadi.JPG/500px-Bhakarwadi.JPG",
      },
    ],
  },
  {
    name: "Mysuru",
    state: "Karnataka",
    description:
      "The sandalwood city — the dazzling Mysore Palace, 135 km southwest of Bengaluru, and the birthplace of Mysore Pak.",
    center: [76.6394, 12.2958],
    cover_image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Mysuru_Montage.jpg/1280px-Mysuru_Montage.jpg",
    touristSpots: [
      {
        name: "Mysore Palace",
        description: "One of India's most magnificent palaces — 100,000+ bulbs light it up on Sundays.",
        category: "historical",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mysore_Palace_Morning.jpg/500px-Mysore_Palace_Morning.jpg",
      },
      {
        name: "Chamundi Hill",
        description: "Temple-topped hill with a colossal Nandi statue and panoramic city views.",
        category: "religious",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Chamundeshwari_Temple_Mysore.jpg/500px-Chamundeshwari_Temple_Mysore.jpg",
      },
      {
        name: "Brindavan Gardens",
        description: "Terraced gardens with musical fountains at the Krishnaraja Sagar dam.",
        category: "nature",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Brindavan_Gardens.JPG/500px-Brindavan_Gardens.JPG",
      },
    ],
    dishes: [
      {
        name: "Mysore Pak",
        description: "Melt-in-the-mouth ghee, gram-flour and sugar confection — invented in Mysuru.",
        where_to_try: "Guru Sweet Mart, near the palace",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Mysore_pak.jpg/500px-Mysore_pak.jpg",
      },
      {
        name: "Mysore Masala Dosa",
        description: "Dosa smeared with a spicy red chutney before the potato filling — Mysuru's twist.",
        where_to_try: "Hotel RRR, city centre",
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Masala_Dosa_2023.jpg/500px-Masala_Dosa_2023.jpg",
      },
    ],
  },
];

export interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: "admin" | "owner" | "buyer";
}

export const seedUsers: SeedUser[] = [
  { name: "Admin", email: "admin@example.com", password: "admin12345", role: "admin" },
  { name: "Demo Owner", email: "owner@example.com", password: "password123", role: "owner" },
  { name: "Demo Buyer", email: "buyer@example.com", password: "password123", role: "buyer" },
];
