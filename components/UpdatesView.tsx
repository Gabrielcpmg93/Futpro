
import React from 'react';
import { ArrowLeft, BellRing, Star, Rocket, Cpu, RefreshCw, Layers } from 'lucide-react';

interface UpdatesViewProps {
  onBack: () => void;
}

const updatesList = [
  { 
    id: 1, 
    icon: <Rocket size={20} className="text-emerald-500" />, 
    headline: "Salvamento Automático Ativado!", 
    description: "Seu progresso agora é salvo automaticamente a cada ação, para que você nunca perca o que conquistou!" 
  },
  { 
    id: 2, 
    icon: <Star size={20} className="text-yellow-500" />, 
    headline: "Partida 3D: Câmera Mais Próxima e HUD Aprimorado", 
    description: "A câmera da Partida 3D está mais próxima, trazendo você para o centro da ação! O placar e os chutes agora ficam ao lado dos jogadores, com os chutes acima do placar, para uma visualização mais intuitiva." 
  },
  { 
    id: 3, 
    icon: <RefreshCw size={20} className="text-indigo-500" />, 
    headline: "Mercado: Botão 'Atualizar'!", 
    description: "No Mercado, você agora pode atualizar a lista de jogadores disponíveis com um clique, facilitando a busca por novos talentos." 
  },
  { 
    id: 4, 
    icon: <Layers size={20} className="text-fuchsia-500" />, 
    headline: "Novos Modos de Jogo Exploratórios!", 
    description: "Explore o Modo Prefeito para construir sua cidade, o Modo Fazenda para cultivar e vender produtos, o Modo Polícia para patrulhar as ruas e as Coletivas de Imprensa para interagir com a mídia!" 
  },
  { 
    id: 5, 
    icon: <Cpu size={20} className="text-orange-500" />, 
    headline: "Desempenho Otimizado em Dispositivos Móveis", 
    description: "Diversas melhorias de performance e responsividade foram implementadas para garantir uma experiência mais fluida em celulares e tablets." 
  },
];

const UpdatesView: React.FC<UpdatesViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BellRing size={24} className="text-fuchsia-400" />
          Atualizações
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
        <p className="text-slate-400 text-sm mb-6">Confira as últimas novidades e melhorias que adicionamos ao FutManager Pro:</p>
        
        <div className="space-y-4">
          {updatesList.map(update => (
            <div key={update.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex items-start gap-4">
              <div className="bg-fuchsia-900/30 p-2 rounded-lg text-fuchsia-400">
                {update.icon}
              </div>
              <div>
                <h2 className="font-bold text-lg mb-1">{update.headline}</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{update.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdatesView;