import { useRef, useState } from "react";

interface JoinCompoProps {
  setJoined: (isJoined : boolean) => void;
  setName: (name : string) => void;
  ws : WebSocket | null;
  roomNo : string
  setRoomNO : (code : string) => void
  setUsers : (no : number) => void
}

export function JoinCompo({ setJoined, setName, ws,roomNo, setRoomNO,setUsers }: JoinCompoProps) {
  const [room, setRoom] = useState(false);
  
  const nameInpRef = useRef<HTMLInputElement>(null);
  const roomCodeRef = useRef<HTMLInputElement>(null);

  function createRoom() {
    const code = ("0000" + Math.floor(Math.random() * 10000)).slice(-4);
    setRoomNO(code);
    setRoom(true);
  }

  function joinRoom() {
    const name = nameInpRef.current?.value?.trim();
    const roomId = roomCodeRef.current?.value?.trim() || roomNo;

    if (!name || !roomId) {
      alert("Please enter your name and room code.");
      return;
    }

    setName(name);

    if (!ws) {
      console.error("WebSocket is not connected.");
      return;
    }

    
    ws.send(
      JSON.stringify({
        type: "join",
        payload: {
          roomId : roomId,
          name : name
        },
      })
    );
    

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "system") {
        setUsers(data.users); 
      }
    }

    
    setJoined(true);    
  }

  return (
    <div className="font-mono">
      <div className="flex flex-col gap-3 w-full">

        <button
          onClick={createRoom}
          className="bg-[#fafafa] text-black w-full rounded-md p-2 mt-2 hover:bg-[#e4e4e4] transition cursor-pointer"
        >
          Create New Room
        </button>

        <input
          ref={nameInpRef}
          className="w-full border border-[#262626] p-2 rounded-md bg-black text-white mt-2"
          type="text"
          placeholder="Enter your name"
        />

        <div className="flex gap-2 w-full">
          <input
            ref={roomCodeRef}
            className="flex-grow border border-[#262626] p-2 rounded-md bg-black text-white"
            type="text"
            placeholder="Enter Room Code"
            defaultValue={roomNo}
          />
          <button
            onClick={joinRoom}
            className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition cursor-pointer"
          >
            Join
          </button>
        </div>

        {room && (
          <div className="bg-[#1e1e1e] border border-[#333] rounded-md p-4 flex flex-col items-center justify-center text-center shadow-md w-full mt-2">
            <p className="text-gray-300 text-sm">Room created! Share this code:</p>
            <div className="text-2xl font-mono font-semibold text-white bg-[#333] px-4 py-2 rounded-md tracking-wider mt-1">
              {roomNo}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
