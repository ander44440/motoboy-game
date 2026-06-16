import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <h1 className="text-6xl font-bold mb-4">404</h1>

      <p className="text-muted-foreground mb-6 text-center">
        Página não encontrada.
      </p>

      <Link
        to="/"
        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
      >
        Voltar ao início
      </Link>
    </div>
  );
}