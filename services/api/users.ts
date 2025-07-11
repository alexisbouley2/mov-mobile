import { api } from "./client";
import {
  User,
  UserSchema,
  UpdateUserRequest,
  UpdateUserResponse,
  UpdateUserResponseSchema,
  DeleteUserResponse,
  DeleteUserResponseSchema,
  CheckContactsResponse,
  CheckContactsResponseSchema,
} from "@movapp/types";

export const usersApi = {
  // Get a user by ID
  getUser: (userId: string): Promise<User | null> =>
    api.get(`/users/${userId}`, UserSchema.nullable()),

  // Update a user
  updateUser: (
    userId: string,
    userData: UpdateUserRequest
  ): Promise<UpdateUserResponse> =>
    api.patch(`/users/${userId}`, userData, UpdateUserResponseSchema),

  // Delete a user
  deleteUser: (userId: string): Promise<DeleteUserResponse> =>
    api.delete(`/users/${userId}`, DeleteUserResponseSchema),

  // Check contacts with event participation and presigned URLs
  checkContacts: (
    phoneNumbers: string[],
    eventId: string
  ): Promise<CheckContactsResponse> =>
    api.post(
      "/users/check-contacts",
      { phoneNumbers, eventId },
      CheckContactsResponseSchema
    ),
};
