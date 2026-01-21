import { useChatStore } from "../store/useChatStore"
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Check, CheckCheck } from "lucide-react";


const ChatContainer = () => {
    const {messages,getMessages,isMessagesLoading,selectedUser,subscribeToMessages,unsubscribeFromMessages, isTyping} = useChatStore();

    const { authUser, socket }=useAuthStore();

    const messageEndRef = useRef(null);

    useEffect(()=>{
        getMessages(selectedUser._id)
        subscribeToMessages();

        return ()=> unsubscribeFromMessages();
    },[selectedUser._id,getMessages,subscribeToMessages,unsubscribeFromMessages])

    useEffect(() => {
        if (socket && selectedUser) {
            socket.emit("markMessagesAsSeen", { senderId: selectedUser._id });
        }
    }, [selectedUser, socket, messages]); // Trigger on mount or when new messages arrive

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
                <div
                key = {message._id}
                className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                ref={messageEndRef}
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

        <MessageInput/>

    </div>
  )
}

export default ChatContainer
