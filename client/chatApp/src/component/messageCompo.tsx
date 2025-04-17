import { useRef } from "react";

export function Message({message,roomNo,users,ws} : {
  message :  {
    name : string;
    message : string;
  }[];
  users : number;
  roomNo : string;
  ws : WebSocket | null
}){
  const inputRef =  useRef<HTMLInputElement>(null);

  function sendMessage(){
    if (!ws) {
      console.error("WebSocket is not connected.");
      return;
    }

    const messageContent = inputRef.current?.value?.trim();
    if (!messageContent) {
      alert("Message cannot be empty.");
      return;
    }
    
    ws.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: messageContent,
        },
      })
    );


    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }


  return <>
    <div className="bg-[#1e1e1e] border border-[#333] rounded-md p-1 flex justify-between items-center text-center shadow-md w-full mt-2 text-gray-300">
      <div>
        Room Code : {roomNo}
      </div>
      <div>
        users : {users}
      </div>
    </div>
    <div className="rounded-2xl border-2 border-[#262626] h-96 flex flex-col justify-between text-white p-2 mt-4">
      <div>
        {message.length > 0 ? (
          message.map((msg, index) => (
            <div key={index} className="mb-1">
              <p className="text-gray-400">{msg.name}</p>
              <p className="bg-gray-400 w-fit p-0.5 rounded-sm">{msg.message}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No messages yet.</p>
        )}
      </div>
      <div className='flex justify-between items-center'>
        <input ref={inputRef} 
          className='h-10 w-72 rounded-2xl border-2 border-[#262626] p-2 ' 
          type="text" 
          placeholder='Type your message...'
        />
        <button onClick={sendMessage}
          className='bg-green-400 h-11 w-20 rounded-2xl cursor-pointer hover:bg-green-500 transition ml-4'
        >
          Send
        </button>
      </div>
    </div>
    
  </>
}