import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set,get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,
  replyingTo: null,

  setReplyingTo: (message) => set({ replyingTo: message }),

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    // Reset unread count for selected user
    if (selectedUser) {
        set(state => ({
            users: state.users.map(user => 
                user._id === selectedUser._id ? { ...user, unreadCount: 0 } : user
            )
        }));
    }
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo } = get();
    try {
      const payload = { ...messageData };
      if (replyingTo) {
        payload.replyTo = replyingTo._id;
      }
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      set({ messages: [...messages, res.data], replyingTo: null });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  markMessagesAsSeen: async (userId) => {
    try {
      await axiosInstance.put(`/messages/mark-seen/${userId}`);
      // Optimistically update local messages if we are viewing them?
      // Actually, if we are viewing them, they are ours (received), so status update doesn't matter much for us visually
      // UNLESS we want to show "seen" status for received messages too (which is rare).
      // But we should update the unread count locally (which we already do in setSelectedUser).
    } catch (error) {
      console.error("Failed to mark messages as seen:", error);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    // if (!selectedUser) return; // REMOVED: We need to listen for messages even if no user selected for unread counts

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = selectedUser && newMessage.senderId === selectedUser._id;
      
      // If chat is open with sender, append message
      if (isMessageSentFromSelectedUser) {
        // Check for duplicates
        const currentMessages = get().messages;
        const isDuplicate = currentMessages.some(msg => msg._id === newMessage._id);
        if (!isDuplicate) {
             set({
               messages: [...currentMessages, newMessage],
             });
        }
      } else {
        // Increment unread count for the sender
        set(state => ({
            users: state.users.map(user => 
                user._id === newMessage.senderId 
                ? { ...user, unreadCount: (user.unreadCount || 0) + 1 } 
                : user
            )
        }));
        
        // Optional: Show toast notification if not on chat screen
        toast.success(`New message from ${newMessage.senderId}`); // Using ID for now, ideally need name lookup or populate
      }
    });

    socket.on("typing", ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) {
        set({ isTyping: true });
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) {
        set({ isTyping: false });
      }
    });

    socket.on("messagesSeen", ({ receiverId }) => {
      if (selectedUser && selectedUser._id === receiverId) {
        set({
          messages: get().messages.map((msg) => ({ ...msg, status: "seen" })),
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("messagesSeen");
  },
}));