import { useState } from "react";
import axios from "axios";

const mojiList = [
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

export default function EmojiFetcher() {
  const [text, setText] = useState("");
  const [emojis, setEmojis] = useState([]);

  const fetchEmojis = async () => {
    const url = "https://api.aiforthai.in.th/emoji";
    const params = { text };
    const headers = {
      'Apikey': "v8JzzGJ7B41to0uLMNEuBikVTew3Dy5U"
    };

    try {
      const response = await axios.get(url, { params, headers });
      const keys = Object.keys(response.data);
      const fetchedEmojis = keys.map(k => mojiList[parseInt(k)][0]);
      setEmojis(fetchedEmojis);
    } catch (error) {
      console.error("Error fetching emojis:", error);
    }
  };

  return (
    <div className="emoji-fetcher">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to get emojis"
        className="text-input"
      />
      <button onClick={fetchEmojis} className="fetch-button">
        Get Emojis
      </button>
      <div className="emoji-display">
        {emojis.map((emoji, index) => (
          <span key={index} className="emoji">
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
} 