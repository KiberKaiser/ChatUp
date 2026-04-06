import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Pencil, Trash2, X, Check } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    editMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const contextMenuRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu && contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu]);

  const handleDeleteMessage = async (messageId) => {
    await deleteMessage(messageId);
    setContextMenu(null);
  };

  const handleStartEdit = (message) => {
    setEditingMessageId(message._id);
    setEditText(message.text || "");
    setContextMenu(null);
  };

  const handleSaveEdit = async (messageId) => {
    if (editText.trim()) {
      await editMessage(messageId, editText.trim());
      setEditingMessageId(null);
      setEditText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleMessageContextMenu = (event, message) => {
    if (message.senderId !== authUser._id) return;

    event.preventDefault();
    setContextMenu({
      message,
      x: event.clientX,
      y: event.clientY,
    });
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div
              className={`chat-bubble flex flex-col relative ${
                message.senderId === authUser._id
                  ? "bg-primary text-primary-content"
                  : "bg-base-200 text-base-content border border-base-300"
              }`}
              onContextMenu={(event) => handleMessageContextMenu(event, message)}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {editingMessageId === message._id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="input input-sm input-bordered flex-1"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSaveEdit(message._id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleSaveEdit(message._id)}
                    className="btn btn-sm btn-circle btn-ghost"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn btn-sm btn-circle btn-ghost"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                message.text && <p>{message.text}</p>
              )}
            </div>
          </div>
        ))}

        {contextMenu && (
          <div
            ref={contextMenuRef}
            className="fixed bg-base-200 rounded-lg shadow-lg py-1 z-50 w-32 border border-base-300"
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          >
            <button
              onClick={() => handleStartEdit(contextMenu.message)}
              className="w-full px-3 py-2 text-left hover:bg-base-300 flex items-center gap-2 text-sm"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              onClick={() => handleDeleteMessage(contextMenu.message._id)}
              className="w-full px-3 py-2 text-left hover:bg-base-300 flex items-center gap-2 text-sm text-error"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
