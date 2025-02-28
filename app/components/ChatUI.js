"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import ScanIDModal from "./ScanIDModal";
import EmojiFetcher from "./EmojiFetcher";


export default function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("tokenize");
  const [image, setImage] = useState(null);
  const [username, setUsername] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scanIDModalOpen, setScanIDModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const emojiList = [
    ['🙂','😄','😁','😆','😀','😊','😃'],
    ['😢','😥','😰','😓','🙁','😟','😞','😔','😣','😫','😩'],
    ['😡','😠','😤','😖'],
    ['🙄','😒','😑','😕'],
    ['😱'],
    ['😨','😧','😦'],
    ['😮','😲','😯'],
    ['😴','😪'],
    ['😋','😜','😝','😛'],
    ['😍','💕','😘','😚','😙','😗'],
    ['😌'],
    ['😐'],
    ['😷'],
    ['😳'],
    ['😵'],
    ['💔'],
    ['😎','😈'],
    ['🙃','😏','😂','😭'],
    ['😬','😅','😶'],
    ['😉'],
    ['💖','💙','💚','💗','💓','💜','💘','💛'],
    ['😇']
];
  const modeOptions = [
    { value: "tokenize", label: "ตัดคำ" },
    { value: "textqa", label: "ถามตอบ" },
    { value: "en2th", label: "แปลไทยเป็นอังกฤษ" },
    { value: "th2en", label: "แปลอังกฤษเป็นไทย" },
    { value: "th2zh", label: "แปลไทยเป็นจีน" },
    { value: "zh2th", label: "แปลจีนเป็นไทย" },
    { value: "thaifood", label: "ข้อมูลอาหารไทย" },
    { value: "carlogo", label: "โลโกรถยนต์" },
    {value: "image_describe",label:"อธิบายรูปภาพ"}
  ];

  const getCurrentModeLabel = () => {
    const option = modeOptions.find((option) => option.value === mode);
    return option ? option.label : mode;
  };
  

  const fetchEmojis = async () => {
    const url = "https://api.aiforthai.in.th/emoji";
    const params = { text:input };
    const headers = {
      'Apikey': "v8JzzGJ7B41to0uLMNEuBikVTew3Dy5U"
    };
    try {
      const response = await axios.get(url, { params, headers });
      const keys = Object.keys(response.data);
      const fetchedEmojis = keys.map(k => emojiList[parseInt(k)][0]);
      setInput(prevInput => prevInput + fetchedEmojis.join(''));
    } catch (error) {
      console.error("Error fetching emojis:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/me`, {
          withCredentials: true,
        });
        if (response.data && response.data.username) {
          setUsername(response.data.username);
        }
      } catch (error) {
        router.push("/"); // Redirect to login page
        console.error("Error fetching username:", error);
      }
    };

    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/chat_history`, { withCredentials: true });
        if (response.data && response.data.messages) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchUsername();
    fetchChatHistory();
  }, [API_URL, username]);

  const handleFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  const uploadImage = async () => {
    if (!image) return;
    const newMessages = [...messages, { image_url:image.name, user_message: null }];
    setMessages(newMessages);
    const formData = new FormData();
    formData.append("file", image);
    try {
      const response = await axios.post(`${API_URL}/${mode}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload Response:", response.data);
      if (response.data.food) {
        const botMessage = response.data.food.objects[0].result;
        setMessages((prev) => [
          ...prev,
          { bot_message: botMessage },
        ]);

        await axios.post(`${API_URL}/save_message`,
          {"bot_message":botMessage,"image_url":image.name},{withCredentials: true});
          
      } else if (response.data.car) {
        const botMessage = response.data.car.objects[0].class
        setMessages((prev) => [
          ...prev,
          { bot_message: botMessage },
        ]);

        await axios.post(`${API_URL}/save_message`,
          {"bot_message":botMessage,"image_url":image.name},{withCredentials: true});

      } else if(response.data.image_describe){
        const botMessage = response.data.image_describe.content;
        console.log(botMessage);
        setMessages((prev) => [
          ...prev,
          { bot_message: botMessage },
        ]);
        
        await axios.post(`${API_URL}/save_message`,
        {"bot_message": botMessage,"image_url":image.name},{withCredentials: true});

      }
       else {
        setMessages((prev) => [
          ...prev,
          { bot_message: "Unexpected response" },
        ]);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      setMessages((prev) => [
        ...prev,
        { bot_message: `Error: ${error.response?.data?.message || error.message}` },
      ]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { user_message: input }];
    setMessages(newMessages);
    setInput("");
    try {
      const response = await axios.post(`${API_URL}/${mode}`, { text: input });
      console.log("API Response:", response.data);
      let botMessage = "Unexpected API response format";
      if (mode === "tokenize" && response.data.tokens?.result) {
        botMessage = response.data.tokens.result.join(" ");
      } else if (mode === "textqa" && response.data.answer) {
        botMessage = response.data.answer;
      } else if (
        ["en2th", "th2en"].includes(mode) &&
        response.data.translate?.translated_text
      ) {
        botMessage = response.data.translate.translated_text;
      } else if (mode === "th2zh" && response.data.translate) {
        botMessage = response.data.translate;
      }else if (mode === "zh2th" && response.data.translate){
        botMessage = response.data.translate;
      }
      setMessages((prev) => [...prev, { bot_message: botMessage }]);
      await axios.post(`${API_URL}/save_message`, {
        user_message: input,
        bot_message: botMessage,
      }, { withCredentials: true });
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        { bot_message: `Error: ${error.response?.data?.message || error.message}` },
      ]);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      window.location.href = "/"; // Redirect to login page
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const DeleteHistory = async () => {
    try {
      await axios.delete(`${API_URL}/chat_history`, { withCredentials: true });
      setMessages([]);
    } catch (error) {
      console.error("Delete History Error:", error);
    }
  }

  const handleOpenScanIDModal = () => {
    setScanIDModalOpen(true);
  }
  const handleCloseScanIDModal = () => {
    setScanIDModalOpen(false);
  }
  

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white">
      <div className="flex flex-col h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-700 text-white max-w-5xl mx-auto w-full">
        <ChatHeader username={username} logout={logout} DeleteHistory={DeleteHistory} />
        
        <div className="p-4 flex justify-end">
          <div>
            <Button className="mx-2" onClick={handleOpenScanIDModal} >
              สแกนบัตรประชาชน
              </Button>            
          </div>
          <div className="relative" ref={dropdownRef}>
            <Button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              variant="outline"
              className="flex items-center justify-between w-40 bg-gray-800 text-white border-none hover:bg-gray-700"
            >
              <span>{getCurrentModeLabel()}</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            {dropdownOpen && (
              <div className="absolute right-0 z-10 mt-1 w-40 bg-white border rounded-md shadow-lg">
                {modeOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 text-black"
                    onClick={() => {
                      setMode(option.value);
                      setDropdownOpen(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <MessageList messages={messages} />
        <InputArea
          mode={mode}
          input={input}
          setInput={setInput}
          handleFileChange={handleFileChange}
          sendMessage={sendMessage}
          uploadImage={uploadImage}
          getEmoji={fetchEmojis}
        />
        
      </div>
      <ScanIDModal isOpen={scanIDModalOpen} onClose={handleCloseScanIDModal} />
    </div>
  );
}
