export { seedCities } from '@rep/types';

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

