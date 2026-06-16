export default function RecordCard({ recorde }) {
  return (
    <div className="p-4">
      <h2>Recorde</h2>
      <p>{recorde || 0} metros</p>
    </div>
  );
}