import { useEffect, useRef, useState } from 'react'
import './App.css'
import { Message } from './compnent/messageCompo';
import { JoinCompo } from './compnent/joinCompo';
import { ChatSVG } from './compnent/chatSVG';

function App() {

  const wsRef = useRef<WebSocket  | null>(null);
  const [socket,setSocket] = useState();
  const [name,setName] = useState("")
  const [roomNo, setRoomNO] = useState<string>("");
  const [users,setUsers] = useState(0);

  interface messageType {
    name : string,
    message : string
  }

  const [message,setMessages] = useState<messageType[] | []>([{
    name : "ram",
    message : "hii there"
    },
    {
      name : "raghav",
      message : "hello"
    }]);
  const [isJoined,setJoined] = useState(false);
  const [isWSReady, setWSReady] = useState(false);
  

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;
    setWSReady(true)


  
    ws.onmessage = (event) => {
      alert(event.data)
      console.log("Raw message:", event.data)
      try {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.type === "chat") {
          console.log("Incoming chat:", data); 
          setMessages(m => [...m, { 
            name: data.name, 
            message: data.message 
          }]);
        } 
        else if (data.type === "system") {
          setUsers(data.users); 
        }
    
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };
    

  return () => {
      if(wsRef.current)
        wsRef.current.close()
    }
  },[])



  return (
    <div className='min-h-screen bg-black flex items-center justify-center p-4 font-mono'>
      <div className="w-full max-w-md bg-[#111]  text-white rounded-2xl border border-[#262626] p-6 shadow-lg flex flex-col">
      <div className="text-center flex flex-col items-center gap-2">
        <div className='flex items-center gap-2'>
          <ChatSVG  />
          <h1 className="text-2xl font-bold">Real-Time Chat</h1>
        </div>
        <p className="text-sm text-gray-400 max-w-xs">
          Temporary room expires when all users leave
        </p>
      </div>

      {isWSReady
        ? isJoined
          ? <Message roomNo={roomNo} ws={wsRef.current} users={users} message={message} />
          : <JoinCompo setUsers={setUsers} roomNo={roomNo} setRoomNO={setRoomNO} setJoined={setJoined} setName={setName} ws={wsRef.current} />
        : <div className="text-white p-4">Connecting...</div>}

      </div>
    </div>
  )
}

export default App
