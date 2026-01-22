import { useChatStore } from "../store/useChatStore"
    // Need to import useState for swipe logic
    import { useEffect, useRef, useState, Fragment } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Check, CheckCheck } from "lucide-react";


const ChatContainer = () => {
    const {messages,getMessages,isMessagesLoading,selectedUser,subscribeToMessages,unsubscribeFromMessages, isTyping, setReplyingTo, markMessagesAsSeen} = useChatStore();

    const { authUser, socket }=useAuthStore();

    const messageEndRef = useRef(null);
    const hasMarkedSeenRef = useRef(false);
    
    // Swipe handling
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    
    // Context Menu handling
    const [contextMenu, setContextMenu] = useState(null);
    const longPressTimeout = useRef(null);

    const handleContextMenu = (e, message) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            message: message
        });
    };

    const closeContextMenu = () => setContextMenu(null);

    const handleReplyFromMenu = () => {
        if (contextMenu?.message) {
            setReplyingTo(contextMenu.message);
        }
        closeContextMenu();
    };

    useEffect(() => {
        const handleClickOutside = () => closeContextMenu();
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const onTouchStart = (e, message) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);

        // Long press for mobile context menu
        longPressTimeout.current = setTimeout(() => {
            setContextMenu({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                message: message
            });
        }, 500); // 500ms for long press
    }

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
        if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    };

    const onTouchEnd = (message) => {
        if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
        
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        // Slide left for own message
        if (message.senderId === authUser._id && isLeftSwipe) {
            setReplyingTo(message);
        }
        // Slide right for other message
        if (message.senderId !== authUser._id && isRightSwipe) {
            setReplyingTo(message);
        }
    }

    // State for Unread Divider
    const [firstUnreadMessageId, setFirstUnreadMessageId] = useState(null);

    // Reset when switching users
    useEffect(() => {
        setFirstUnreadMessageId(null);
        hasMarkedSeenRef.current = false;
    }, [selectedUser?._id]);

    // Find first unread message and mark as seen
    useEffect(() => {
        if (messages.length > 0 && selectedUser) {
            // Set the divider location only once per session (on first load of messages)
            if (!hasMarkedSeenRef.current) {
                const firstUnread = messages.find(m => m.senderId === selectedUser._id && m.status !== "seen");
                if (firstUnread) {
                    setFirstUnreadMessageId(firstUnread._id);
                }
                hasMarkedSeenRef.current = true;
            }

            // Always mark unread messages as seen (including new incoming ones)
            const hasUnread = messages.some(m => m.senderId === selectedUser._id && m.status !== "seen");
            if (hasUnread) {
                 markMessagesAsSeen(selectedUser._id);
            }
        }
    }, [messages, selectedUser, markMessagesAsSeen]);

    useEffect(()=>{
        getMessages(selectedUser._id)
        subscribeToMessages();

        return ()=> unsubscribeFromMessages();
    },[selectedUser._id,getMessages,subscribeToMessages,unsubscribeFromMessages])

    useEffect(()=>{
        if(messageEndRef.current && messages){
            messageEndRef.current.scrollIntoView({behavior:"smooth"})
        }
    },[messages, isTyping])

    if(isMessagesLoading) {
        return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader/>
            <MessageSkeleton/>
            <MessageInput/>
        </div>
    )
    }

    

  return (
    <div className="flex-1 flex flex-col overflow-auto ">
        <ChatHeader/>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message)=>(
                <Fragment key={message._id}>
                    {firstUnreadMessageId === message._id && (
                        <div className="w-full flex items-center justify-center my-4 opacity-70">
                            <div className="h-[1px] bg-base-content/30 flex-1"></div>
                            <span className="px-3 text-xs font-medium text-base-content/60">Unread Messages</span>
                            <div className="h-[1px] bg-base-content/30 flex-1"></div>
                        </div>
                    )}
                    <div
                    className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                    ref={messageEndRef}
                    onTouchStart={(e) => onTouchStart(e, message)}
                    onTouchMove={onTouchMove}
                    onTouchEnd={() => onTouchEnd(message)}
                    onContextMenu={(e) => handleContextMenu(e, message)}
                    >
                        <div className="chat-image avatar">
                            <div className="size-10 rounded-full border">
                                <img
                                src={message.senderId===authUser._id ? authUser.profilePic || "/avtr.jpg" : selectedUser.profilePic || "/avtr.jpg"}
                                alt="profile pic"
                                />
                            </div>
                        </div>
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1">
                                {formatMessageTime(message.createdAt)}
                            </time>
                        </div>

                        <div className="chat-bubble flex flex-col">
                            {message.replyTo && (
                                <div className={`text-xs mb-2 p-2 rounded border-l-2 opacity-70 ${
                                    message.senderId === authUser._id 
                                    ? "bg-primary-content/10 border-primary-content text-primary-content" 
                                    : "bg-base-content/10 border-base-content text-base-content"
                                }`}>
                                    <p className="font-bold opacity-75">
                                        {message.replyTo.senderId === authUser._id ? "You" : selectedUser.fullName}
                                    </p>
                                    <p className="truncate opacity-75">{message.replyTo.text || "Image"}</p>
                                </div>
                            )}
                            {message.image && (
                                <img
                                src={message.image}
                                alt="Attachment"
                                className="sm:max-w-[200px] rounded-md mb-2"
                                />
                            )}
                            {message.text && <p>{message.text}</p>}
                        </div>

                        {message.senderId === authUser._id && (
                            <div className="chat-footer opacity-50 text-xs flex gap-1 items-center mt-1">
                                {message.status === "seen" ? (
                                    <>
                                        <span className="text-primary">Seen</span>
                                        <CheckCheck className="size-3 text-primary" />
                                    </>
                                ) : message.status === "delivered" ? (
                                    <>
                                        <span>Delivered</span>
                                        <CheckCheck className="size-3" />
                                    </>
                                ) : (
                                    <>
                                        <span>Sent</span>
                                        <Check className="size-3" />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </Fragment>
            ))}

            {isTyping && (
                <div className="chat chat-start">
                    <div className="chat-image avatar">
                        <div className="size-10 rounded-full border">
                            <img
                                src={selectedUser.profilePic || "/avtr.jpg"}
                                alt="profile pic"
                            />
                        </div>
                    </div>
                    <div className="chat-bubble italic text-zinc-400 text-sm">
                        Typing...
                    </div>
                </div>
            )}
            
            <div ref={messageEndRef}></div>
        </div>

        {/* Context Menu */}
        {contextMenu && (
            <div
                className="fixed bg-base-100 shadow-xl rounded-lg z-50 border border-base-300 p-2 min-w-[150px]"
                style={{ top: contextMenu.y, left: contextMenu.x }}
                onClick={(e) => e.stopPropagation()}
            >
                <ul className="menu menu-sm p-0">
                    <li>
                        <button onClick={handleReplyFromMenu} className="flex items-center gap-2">
                            <span className="text-sm">Reply</span>
                        </button>
                    </li>
                </ul>
            </div>
        )}

        <MessageInput/>

    </div>
  )
}

export default ChatContainer
