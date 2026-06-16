import React, { useEffect, useState } from "react";
import { Coins, Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";
import SkinCard from "@/components/garage/SkinCard";
import { skinsData } from "@/data/skins";

const PLAYER_STORAGE_KEY = "motoboy-player";

const defaultPlayer = {
  moedas_acumuladas: 2000,
  motos_possuidas: [1],
  moto_atual_id: 1,
};

export default function Garage() {
  const [player, setPlayer] = useState(defaultPlayer);
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [equippingId, setEquippingId] = useState(null);

  useEffect(() => {
    loadGarage();
  }, []);

  function savePlayer(data) {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(data));
  }

  function loadGarage() {
    try {
      const storedPlayer = localStorage.getItem(PLAYER_STORAGE_KEY);

      if (storedPlayer) {
        setPlayer(JSON.parse(storedPlayer));
      } else {
        savePlayer(defaultPlayer);
      }

      setSkins(skinsData);
    } catch (error) {
      console.error("Erro ao carregar garagem:", error);
      toast.error("Erro ao carregar garagem");
    } finally {
      setLoading(false);
    }
  }

  function handleBuy(skin) {
    if (buyingId) return;

    if (player.moedas_acumuladas < skin.preco_moedas) {
      toast.error("Moedas insuficientes");
      return;
    }

    setBuyingId(skin.id);

    const updatedPlayer = {
      ...player,
      moedas_acumuladas:
        player.moedas_acumuladas - skin.preco_moedas,
      motos_possuidas: [
        ...player.motos_possuidas,
        skin.id,
      ],
      moto_atual_id: skin.id,
    };

    setPlayer(updatedPlayer);
    savePlayer(updatedPlayer);

    toast.success(`${skin.nome} comprada!`);

    setBuyingId(null);
  }

  function handleEquip(skinId) {
    if (equippingId) return;

    setEquippingId(skinId);

    const updatedPlayer = {
      ...player,
      moto_atual_id: skinId,
    };

    setPlayer(updatedPlayer);
    savePlayer(updatedPlayer);

    toast.success("Moto equipada!");

    setEquippingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-primary" />

            <h1 className="font-heading text-xl font-black uppercase">
              Garagem
            </h1>
          </div>

          <p className="text-muted-foreground text-xs">
            Compre e equipe suas motos
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/60 rounded-full px-3 py-1.5 border border-primary/20">
          <Coins className="w-4 h-4 text-primary" />

          <span className="font-heading text-sm font-bold text-primary">
            {player.moedas_acumuladas.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {skins.map((skin) => {
          const isOwned =
            player.motos_possuidas.includes(skin.id);

          const isEquipped =
            player.moto_atual_id === skin.id;

          const canAfford =
            player.moedas_acumuladas >=
            skin.preco_moedas;

          return (
            <SkinCard
              key={skin.id}
              skin={skin}
              isOwned={isOwned}
              isEquipped={isEquipped}
              canAfford={canAfford}
              onBuy={handleBuy}
              onEquip={handleEquip}
              isBuying={buyingId === skin.id}
              isEquipping={equippingId === skin.id}
            />
          );
        })}
      </div>
    </div>
  );
}