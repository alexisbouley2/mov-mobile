import { z } from "zod";
import { validateSchema } from "@movapp/types";
import { config } from "@/lib/config";

const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

class ApiClient {
  private baseUrl = API_BASE_URL;

  async get<T>(endpoint: string, schema: z.ZodSchema<T>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }
    return validateSchema(schema, await response.json());
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to post to ${endpoint}: ${response.statusText}`);
    }
    return validateSchema(schema, await response.json());
  }

  async patch<T>(
    endpoint: string,
    data: unknown,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to patch ${endpoint}: ${response.statusText}`);
    }
    return validateSchema(schema, await response.json());
  }

  async delete<T>(endpoint: string, schema: z.ZodSchema<T>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete ${endpoint}: ${response.statusText}`);
    }
    return validateSchema(schema, await response.json());
  }

  async deleteWithBody<T>(
    endpoint: string,
    data: unknown,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete ${endpoint}: ${response.statusText}`);
    }
    return validateSchema(schema, await response.json());
  }
}

export const api = new ApiClient();
