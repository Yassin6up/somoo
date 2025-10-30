import { 
  type User, 
  type InsertUser,
  type Freelancer,
  type InsertFreelancer,
  type ProductOwner,
  type InsertProductOwner
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Legacy user methods (for compatibility)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Freelancer methods
  getFreelancer(id: string): Promise<Freelancer | undefined>;
  getFreelancerByEmail(email: string): Promise<Freelancer | undefined>;
  getFreelancerByUsername(username: string): Promise<Freelancer | undefined>;
  createFreelancer(freelancer: InsertFreelancer): Promise<Freelancer>;
  updateFreelancer(id: string, updates: Partial<Freelancer>): Promise<Freelancer | undefined>;
  getAllFreelancers(): Promise<Freelancer[]>;

  // Product Owner methods
  getProductOwner(id: string): Promise<ProductOwner | undefined>;
  getProductOwnerByEmail(email: string): Promise<ProductOwner | undefined>;
  createProductOwner(owner: InsertProductOwner): Promise<ProductOwner>;
  updateProductOwner(id: string, updates: Partial<ProductOwner>): Promise<ProductOwner | undefined>;
  getAllProductOwners(): Promise<ProductOwner[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private freelancers: Map<string, Freelancer>;
  private productOwners: Map<string, ProductOwner>;

  constructor() {
    this.users = new Map();
    this.freelancers = new Map();
    this.productOwners = new Map();
  }

  // Legacy user methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Freelancer methods
  async getFreelancer(id: string): Promise<Freelancer | undefined> {
    return this.freelancers.get(id);
  }

  async getFreelancerByEmail(email: string): Promise<Freelancer | undefined> {
    return Array.from(this.freelancers.values()).find(
      (freelancer) => freelancer.email === email
    );
  }

  async getFreelancerByUsername(username: string): Promise<Freelancer | undefined> {
    return Array.from(this.freelancers.values()).find(
      (freelancer) => freelancer.username === username
    );
  }

  async createFreelancer(insertFreelancer: InsertFreelancer): Promise<Freelancer> {
    const id = randomUUID();
    const freelancer: Freelancer = { 
      ...insertFreelancer, 
      id,
      services: insertFreelancer.services || [],
    };
    this.freelancers.set(id, freelancer);
    return freelancer;
  }

  async updateFreelancer(id: string, updates: Partial<Freelancer>): Promise<Freelancer | undefined> {
    const existing = this.freelancers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.freelancers.set(id, updated);
    return updated;
  }

  async getAllFreelancers(): Promise<Freelancer[]> {
    return Array.from(this.freelancers.values());
  }

  // Product Owner methods
  async getProductOwner(id: string): Promise<ProductOwner | undefined> {
    return this.productOwners.get(id);
  }

  async getProductOwnerByEmail(email: string): Promise<ProductOwner | undefined> {
    return Array.from(this.productOwners.values()).find(
      (owner) => owner.email === email
    );
  }

  async createProductOwner(insertOwner: InsertProductOwner): Promise<ProductOwner> {
    const id = randomUUID();
    const owner: ProductOwner = { 
      ...insertOwner, 
      id,
      services: insertOwner.services || [],
    };
    this.productOwners.set(id, owner);
    return owner;
  }

  async updateProductOwner(id: string, updates: Partial<ProductOwner>): Promise<ProductOwner | undefined> {
    const existing = this.productOwners.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.productOwners.set(id, updated);
    return updated;
  }

  async getAllProductOwners(): Promise<ProductOwner[]> {
    return Array.from(this.productOwners.values());
  }
}

export const storage = new MemStorage();
