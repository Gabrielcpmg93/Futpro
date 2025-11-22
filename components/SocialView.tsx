
import React, { useState } from 'react';
import { SocialPost } from '../types';
import { generateSocialPosts } from '../services/geminiService';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface SocialViewProps {
    teamName: string;
}

const SocialView: React.FC<SocialViewProps> = ({ teamName }) => {
    const [posts, setPosts] = useState<SocialPost[]>(generateSocialPosts(teamName));

    const toggleLike = (id: string) => {
        setPosts(posts.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
    };

    return (
        <div className="p-6 pb-24 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Rede Social</h1>
            <div className="space-y-4">
                {posts.map(post => (
                    <div key={post.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">{post.authorName}</h3>
                                <p className="text-xs text-slate-400">2 min atrás</p>
                            </div>
                        </div>
                        <p className="text-slate-700 text-sm mb-4 leading-relaxed">{post.content}</p>
                        <div className="flex items-center gap-6 border-t border-slate-50 pt-3">
                            <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1 text-xs font-bold ${post.liked ? 'text-red-500' : 'text-slate-400'}`}>
                                <Heart size={18} fill={post.liked ? "currentColor" : "none"} /> {post.likes}
                            </button>
                            <button className="flex items-center gap-1 text-xs font-bold text-slate-400">
                                <MessageCircle size={18} /> {post.comments}
                            </button>
                            <button className="flex items-center gap-1 text-xs font-bold text-slate-400 ml-auto">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SocialView;
