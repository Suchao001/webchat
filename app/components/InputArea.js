import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Upload, Smile } from "lucide-react";

export default function InputArea({
  mode,
  input,
  setInput,
  handleFileChange,
  sendMessage,
  uploadImage,
  getEmoji
}) {
  return (
    <div className="p-4 bg-gray-800 flex items-center w-full">
      {mode === "thaifood"||mode === "image_describe" || mode === "carlogo" ? (
        <>
          <input
            type="file"
            onChange={handleFileChange}
            className="mr-2 text-white"
          />
          <Button onClick={uploadImage}>
            <Upload className="w-5 h-5" />
          </Button>
        </>
      ) : (
        <>
          <Input
            className="flex-grow mr-2 bg-gray-700 border-none text-white placeholder:text-gray-400"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button className="mr-1" onClick={getEmoji}>
            <Smile className="w-5 h-5" />
          </Button>
          <Button onClick={sendMessage}>
            <Send className="w-5 h-5" />
          </Button>
          
        </>
      )}
    </div>
  );
} 