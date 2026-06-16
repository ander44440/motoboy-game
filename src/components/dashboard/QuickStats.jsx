export default function QuickStats({ totalCorridas, motoNome }) {
  return (
    <div className="p-4">
      <p>Total de corridas: {totalCorridas}</p>
      <p>Moto atual: {motoNome || "Nenhuma"}</p>
    </div>
  );
}