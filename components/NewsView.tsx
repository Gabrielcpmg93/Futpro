import React from 'react';
import { NewsArticle } from '../types';
import { ArrowLeft, Share2, Printer, Camera } from 'lucide-react';

interface NewsViewProps {
  news: NewsArticle | null;
  onBack: () => void;
}

const NewsView: React.FC<NewsViewProps> = ({ news, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-900 p-4 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4 text-white">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg">Banca de Jornal</h1>
        <div className="w-9"></div> {/* Spacer */}
      </div>

      <div className="w-full max-w-md bg-[#fdfbf7] text-slate-900 shadow-2xl overflow-hidden relative transform rotate-1 transition-transform hover:rotate-0 duration-500 border-x-4 border-slate-900">
        
        {/* Paper Texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>

        {/* Header */}
        <div className="border-b-4 border-black p-4 text-center">
             <h1 className="text-4xl font-black uppercase tracking-tighter font-serif">GAZETA DA BOLA</h1>
             <div className="flex justify-between items-center text-[10px] font-bold uppercase mt-2 border-t border-black pt-1">
                 <span>Edição Diária</span>
                 <span>R$ 2,50</span>
                 <span>{news?.date || new Date().toLocaleDateString('pt-BR')}</span>
             </div>
        </div>

        {/* Content */}
        {news ? (
            <div className="p-5">
                <h2 className="text-3xl font-bold leading-tight mb-2 font-serif">{news.headline}</h2>
                <p className="text-lg text-slate-600 font-medium italic mb-4 leading-snug border-l-4 border-red-600 pl-3">
                    {news.subheadline}
                </p>

                {/* Image Placeholder */}
                <div className="w-full h-48 bg-slate-200 mb-4 relative overflow-hidden grayscale contrast-125 border-2 border-black">
                     <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <Camera size={48} />
                     </div>
                     <div className="absolute bottom-0 left-0 bg-black text-white text-[10px] px-2 py-1 uppercase font-bold">
                        Foto: Arquivo
                     </div>
                </div>
                <p className="text-[10px] text-slate-500 mb-4 italic text-right">{news.imageCaption}</p>

                <div className="columns-1 text-justify text-sm font-serif leading-relaxed">
                    <span className="float-left text-4xl font-black mr-2 mt-[-6px] font-sans">O</span>
                    {news.content}
                </div>
            </div>
        ) : (
            <div className="p-10 text-center">
                <h2 className="text-2xl font-bold text-slate-400 mb-4">Edição em Fechamento...</h2>
                <p className="text-sm text-slate-500">Aguarde o fim da próxima partida para ler as notícias.</p>
            </div>
        )}

        {/* Footer */}
        <div className="bg-slate-100 p-3 border-t-2 border-black mt-4 flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Vol. 420</span>
            <div className="flex gap-4">
                <Share2 size={16} className="cursor-pointer hover:text-slate-900" />
                <Printer size={16} className="cursor-pointer hover:text-slate-900" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsView;