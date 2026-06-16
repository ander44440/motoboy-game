import { useNavigate } from "react-router-dom";

export default function StartButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/jogo")}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Jogar
    </button>
  );
}