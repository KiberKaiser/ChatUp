import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isSearchingUsers: false,
  isUpdatingFriends: false,
  onlineUsers: [],
  friends: [],
  searchResults: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      await get().getFriends();
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      await get().getFriends();
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during signup");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      await get().getFriends();

      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during login");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, friends: [], searchResults: [] });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during logout");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "An error occurred during profile update");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  getFriends: async () => {
    try {
      const res = await axiosInstance.get("/auth/friends");
      set({ friends: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load friends");
    }
  },

  searchUsersByNickname: async (nickname) => {
    const query = nickname.trim();
    if (!query) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearchingUsers: true });
    try {
      const res = await axiosInstance.get("/auth/search-users", {
        params: { nickname: query },
      });
      set({ searchResults: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to search users");
    } finally {
      set({ isSearchingUsers: false });
    }
  },

  addFriend: async (friendId) => {
    set({ isUpdatingFriends: true });
    try {
      const res = await axiosInstance.post(`/auth/friends/${friendId}`);
      set((state) => ({
        friends: res.data,
        searchResults: state.searchResults.map((user) =>
          user._id === friendId ? { ...user, isFriend: true } : user
        ),
      }));
      toast.success("Friend added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add friend");
    } finally {
      set({ isUpdatingFriends: false });
    }
  },

  removeFriend: async (friendId) => {
    set({ isUpdatingFriends: true });
    try {
      const res = await axiosInstance.delete(`/auth/friends/${friendId}`);
      set((state) => ({
        friends: res.data,
        searchResults: state.searchResults.map((user) =>
          user._id === friendId ? { ...user, isFriend: false } : user
        ),
      }));
      toast.success("Friend removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove friend");
    } finally {
      set({ isUpdatingFriends: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get()
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
