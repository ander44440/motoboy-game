export default function PlayerHeader({ player }) {
  return (
    <div className="p-4 bg-black text-white">
      <h2>Jogador: {player?.nome_usuario}</h2>
      <p>Moedas: {player?.moedas_acumuladas || 0}</p>
    </div>
  );
}