import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, LayoutGrid, Clock, Users, StickyNote, Globe, MoreHorizontal } from 'lucide-react';

export type OrgView = 'scenes' | 'timeline' | 'characters' | 'notes' | 'research';

interface OrganizationPanelProps {
  currentView: OrgView;
  onClose: () => void;
  pendingAction?: string | null;
  clearPendingAction?: () => void;
}

// Componente interno para Cards de Cena
const SceneCards = ({ pendingAction, clearPendingAction }: { pendingAction?: string | null, clearPendingAction?: () => void }) => {
  const [scenes, setScenes] = useState<{id: number, title: string, desc: string}[]>(() => {
    const saved = localStorage.getItem('athena_scenes');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "Cena Inicial", desc: "O protagonista acorda..." },
      { id: 2, title: "Incidente Incitante", desc: "Uma carta misteriosa chega..." }
    ];
  });

  useEffect(() => { localStorage.setItem('athena_scenes', JSON.stringify(scenes)); }, [scenes]);

  const addScene = () => {
    const title = prompt("Título da Cena:");
    if (title) setScenes([...scenes, { id: Date.now(), title, desc: "" }]);
  };
  
  // Trigger addScene if action is pending
  useEffect(() => {
      if (pendingAction === 'add_scene') {
          addScene();
          if (clearPendingAction) clearPendingAction();
      }
  }, [pendingAction]);

  const removeScene = (id: number) => {
    if (confirm("Remover cena?")) setScenes(scenes.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <button onClick={addScene} className="w-full py-2 border-2 border-dashed border-stone-300 rounded-lg text-stone-400 hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2">
        <Plus size={18} /> Nova Cena
      </button>
      <div className="grid grid-cols-1 gap-3">
        {scenes.map(scene => (
          <div key={scene.id} className="bg-white border border-stone-200 p-3 rounded shadow-sm hover:shadow-md transition-shadow group">
             <div className="flex justify-between items-start mb-1">
               <h4 className="font-bold text-ink text-sm">{scene.title}</h4>
               <button onClick={() => removeScene(scene.id)} className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
             </div>
             <textarea 
                className="w-full text-xs text-stone-600 bg-transparent resize-none focus:outline-none h-16"
                placeholder="Descrição da cena..."
                value={scene.desc}
                onChange={(e) => {
                  const newScenes = scenes.map(s => s.id === scene.id ? {...s, desc: e.target.value} : s);
                  setScenes(newScenes);
                }}
             />
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente interno para Linha do Tempo
const Timeline = () => {
    const [events, setEvents] = useState<{id: number, time: string, event: string}[]>(() => {
        const saved = localStorage.getItem('athena_timeline');
        return saved ? JSON.parse(saved) : [{ id: 1, time: "1990", event: "Nascimento do Herói" }];
    });

    useEffect(() => { localStorage.setItem('athena_timeline', JSON.stringify(events)); }, [events]);

    const addEvent = () => {
        setEvents([...events, { id: Date.now(), time: "Data", event: "Novo Evento" }]);
    };

    const removeEvent = (id: number) => setEvents(events.filter(e => e.id !== id));

    return (
        <div className="relative pl-4 border-l border-stone-200 space-y-6">
            <button onClick={addEvent} className="absolute -left-3 top-0 bg-accent text-white rounded-full p-1 hover:bg-accent-hover shadow-sm z-10">
                <Plus size={14} />
            </button>
            <div className="h-4"></div> {/* Spacer for button */}
            {events.map(item => (
                <div key={item.id} className="relative pl-6 group">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-stone-300 border-2 border-white shadow-sm group-hover:bg-accent transition-colors"></div>
                    <div className="bg-stone-50 p-3 rounded border border-stone-200 text-sm">
                        <input 
                            value={item.time}
                            onChange={(e) => setEvents(events.map(ev => ev.id === item.id ? {...ev, time: e.target.value} : ev))}
                            className="bg-transparent font-bold text-accent text-xs uppercase tracking-wider mb-1 focus:outline-none w-full"
                        />
                        <textarea 
                            value={item.event}
                            onChange={(e) => setEvents(events.map(ev => ev.id === item.id ? {...ev, event: e.target.value} : ev))}
                            className="bg-transparent w-full resize-none text-stone-700 focus:outline-none"
                            rows={2}
                        />
                         <button onClick={() => removeEvent(item.id)} className="absolute top-2 right-2 text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button>
                    </div>
                </div>
            ))}
        </div>
    )
};

// Componente interno para Personagens
const CharacterSheet = () => {
    const [chars, setChars] = useState<{id: number, name: string, role: string, traits: string}[]>(() => {
        const saved = localStorage.getItem('athena_chars');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => { localStorage.setItem('athena_chars', JSON.stringify(chars)); }, [chars]);

    const addChar = () => {
        setChars([...chars, { id: Date.now(), name: "Nome", role: "Protagonista", traits: "Características..." }]);
    };
    const removeChar = (id: number) => setChars(chars.filter(c => c.id !== id));

    return (
        <div className="space-y-4">
             <button onClick={addChar} className="w-full py-2 bg-ink text-white rounded hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 text-sm">
                <Plus size={16} /> Novo Personagem
             </button>
             {chars.map(char => (
                 <div key={char.id} className="bg-stone-50 p-4 rounded border border-stone-200 relative group">
                     <div className="flex gap-3 items-center mb-2 border-b border-stone-200 pb-2">
                         <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-400">
                             <Users size={20} />
                         </div>
                         <div className="flex-1">
                             <input 
                                value={char.name}
                                onChange={(e) => setChars(chars.map(c => c.id === char.id ? {...c, name: e.target.value} : c))}
                                className="bg-transparent font-cinzel font-bold text-ink focus:outline-none w-full"
                             />
                             <input 
                                value={char.role}
                                onChange={(e) => setChars(chars.map(c => c.id === char.id ? {...c, role: e.target.value} : c))}
                                className="bg-transparent text-xs text-accent font-bold uppercase focus:outline-none w-full"
                             />
                         </div>
                     </div>
                     <textarea 
                        value={char.traits}
                        onChange={(e) => setChars(chars.map(c => c.id === char.id ? {...c, traits: e.target.value} : c))}
                        className="w-full bg-transparent text-sm text-stone-600 resize-none focus:outline-none h-20"
                        placeholder="Personalidade, aparência, conflitos..."
                     />
                     <button onClick={() => removeChar(char.id)} className="absolute top-2 right-2 text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                 </div>
             ))}
        </div>
    )
}

// Componente para Anotações e Pesquisa
const SimpleList = ({ type }: { type: 'notes' | 'research' }) => {
    const storageKey = type === 'notes' ? 'athena_notes' : 'athena_research';
    const [items, setItems] = useState<{id: number, content: string}[]>(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(items)); }, [items]);

    const addItem = () => setItems([...items, { id: Date.now(), content: "" }]);
    const removeItem = (id: number) => setItems(items.filter(i => i.id !== id));

    return (
        <div className="space-y-3">
            <button onClick={addItem} className="w-full py-2 border border-stone-300 text-stone-600 rounded hover:bg-stone-100 transition-colors flex items-center justify-center gap-2 text-sm">
                <Plus size={16} /> Adicionar {type === 'notes' ? 'Nota' : 'Link/Ref'}
            </button>
            {items.map(item => (
                <div key={item.id} className={`relative p-3 rounded group ${type === 'notes' ? 'bg-yellow-50 border border-yellow-100 shadow-sm' : 'bg-white border border-stone-200'}`}>
                    <textarea 
                        value={item.content}
                        onChange={(e) => setItems(items.map(i => i.id === item.id ? {...i, content: e.target.value} : i))}
                        className="w-full bg-transparent resize-none focus:outline-none text-sm text-stone-700"
                        placeholder={type === 'notes' ? "Escreva sua nota..." : "URL ou Tópico de pesquisa..."}
                        rows={3}
                    />
                    <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-stone-400 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button>
                </div>
            ))}
        </div>
    )
}

const OrganizationPanel: React.FC<OrganizationPanelProps> = ({ currentView, onClose, pendingAction, clearPendingAction }) => {
  const titles: Record<OrgView, string> = {
      scenes: "Cartões de Cena",
      timeline: "Linha do Tempo",
      characters: "Personagens",
      notes: "Anotações",
      research: "Pesquisa"
  };

  const icons: Record<OrgView, any> = {
      scenes: LayoutGrid,
      timeline: Clock,
      characters: Users,
      notes: StickyNote,
      research: Globe
  };

  const CurrentIcon = icons[currentView];

  return (
    <div className="w-80 md:w-96 bg-white border-l border-stone-200 h-full shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-stone-200 bg-stone-50">
        <div className="flex items-center gap-2">
          <CurrentIcon size={18} className="text-accent" />
          <h2 className="font-cinzel font-bold text-lg text-stone-800">{titles[currentView]}</h2>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-800">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-stone-50/50">
         {currentView === 'scenes' && <SceneCards pendingAction={pendingAction} clearPendingAction={clearPendingAction} />}
         {currentView === 'timeline' && <Timeline />}
         {currentView === 'characters' && <CharacterSheet />}
         {(currentView === 'notes' || currentView === 'research') && <SimpleList type={currentView} />}
      </div>
    </div>
  );
};

export default OrganizationPanel;