import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import Editor, { EditorHandle } from './components/Editor';
import AIPanel from './components/AIPanel';
import OrganizationPanel, { OrgView } from './components/OrganizationPanel';
import { ToolMode, EditorConfig, ViewOptions, NarrativeModel } from './types';
import { getWordDefinition, getWordSynonyms, generateCreativeContent, generateImage } from './services/geminiService';
import { X, Loader2, List, Type, Check, Book, Smartphone, Globe, Download, Copy, Image as ImageIcon, Map as MapIcon, ChevronDown, ChevronRight, AlertCircle, Hash, MoreHorizontal, Feather } from 'lucide-react';

const StructurePanel = ({ 
    structure, 
    onClose 
}: { 
    structure: {level: string, text: string, type: 'header' | 'scene' | 'marker'}[],
    onClose: () => void 
}) => {
    return (
        <div className="w-80 bg-white border-l border-stone-200 h-full shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="h-14 flex items-center justify-between px-4 border-b border-stone-200 bg-stone-50">
                <div className="flex items-center gap-2">
                    <MapIcon size={18} className="text-accent" />
                    <h2 className="font-cinzel font-bold text-lg text-stone-800">Mapa Visual</h2>
                </div>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-800">
                    <X size={20} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {structure.length === 0 && (
                    <p className="text-sm text-stone-400 italic p-4">
                        Nenhuma estrutura detectada. Use Títulos (H1, H2), Mudanças de Cena (***) ou Marcadores ([...]) no texto.
                    </p>
                )}
                {structure.map((item, idx) => (
                    <div key={idx} className={`
                        py-1 px-2 rounded hover:bg-stone-100 text-sm cursor-pointer flex items-center gap-2
                        ${item.type === 'header' ? 'font-serif font-bold text-ink' : ''}
                        ${item.type === 'scene' ? 'text-stone-500 italic bg-stone-50 justify-center my-2 border-y border-stone-100' : ''}
                        ${item.type === 'marker' ? 'text-accent font-mono text-xs border border-accent/20 bg-accent/5 w-fit' : ''}
                        ${item.level === 'h2' ? 'ml-4' : ''}
                        ${item.level === 'h3' ? 'ml-8' : ''}
                    `}>
                        {item.type === 'header' && <ChevronRight size={12} className="text-stone-400" />}
                        {item.type === 'scene' && <MoreHorizontal size={12} />}
                        {item.type === 'marker' && <AlertCircle size={10} />}
                        <span className="truncate">{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ToolMode>(ToolMode.NONE);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editorText, setEditorText] = useState('');
  // Structure now holds more detailed info for "Visual Map"
  const [structure, setStructure] = useState<{level: string, text: string, type: 'header' | 'scene' | 'marker'}[]>([]);
  
  // Organization Panel State
  const [orgView, setOrgView] = useState<OrgView>('scenes');
  const [pendingOrgAction, setPendingOrgAction] = useState<string | null>(null);

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // View State
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
      zoom: 100,
      showLineNumbers: false,
      showPageNumbers: false,
      isDarkMode: false,
      showStatusBar: false,
      showStructure: false,
      isSplitView: false,
      isTypewriterMode: false
  });

  // Tool Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  
  // Default literary configuration
  const [config, setConfig] = useState<EditorConfig>({
    fontFamily: 'Merriweather',
    fontSize: 18,
    lineHeight: 1.8,
    maxWidth: '21cm', // Starts closer to A4
    textAlign: 'left'
  });

  const editorRef = useRef<EditorHandle>(null);
  // We need a state to hold the HTML for the split view since it is read-only and reacts to changes
  const [currentHTML, setCurrentHTML] = useState<string>('');
  
  // Check for API Key on load & Handle Splash & PWA
  useEffect(() => {
    if (!process.env.API_KEY) {
      console.warn("Gemini API Key not found in process.env. AI features will be disabled.");
    }
    // Load from local storage if exists
    const saved = localStorage.getItem('athena_autosave');
    if (saved && editorRef.current) {
        // We need to wait for editor mount, this is a simple check.
        // In a real app we'd use a more robust hydration.
        setTimeout(() => {
             editorRef.current?.setHTML(saved);
             setCurrentHTML(saved);
        }, 100);
    }

    // Hide Splash after delay
    const timer = setTimeout(() => setShowSplash(false), 2500);

    // PWA Install Listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Auto-save to local storage every 30s
  useEffect(() => {
      const interval = setInterval(() => {
          if (editorRef.current) {
              const html = editorRef.current.getHTML();
              localStorage.setItem('athena_autosave', html);
          }
      }, 30000);
      return () => clearInterval(interval);
  }, []);

  // Enhanced Structure Extractor (Visual Map)
  const extractStructure = () => {
    if (editorRef.current) {
        const html = editorRef.current.getHTML();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const elements: {level: string, text: string, type: 'header' | 'scene' | 'marker'}[] = [];
        
        const processNode = (node: Element) => {
            const text = node.textContent || '';
            const tagName = node.tagName.toLowerCase();

            // Headers
            if (['h1', 'h2', 'h3'].includes(tagName)) {
                elements.push({ level: tagName, text, type: 'header' });
            } 
            // Scene Breaks (HR or ***)
            else if (tagName === 'hr' || text.includes('***') || text.includes('* * *')) {
                elements.push({ level: 'scene', text: 'Mudança de Cena', type: 'scene' });
            }
            // Paragraphs containing markers
            else if (tagName === 'p' || tagName === 'div') {
                 // Look for [MARKER] pattern
                 const markerMatch = text.match(/\[(.*?)\]/);
                 if (markerMatch) {
                     elements.push({ level: 'marker', text: markerMatch[0], type: 'marker' });
                 }
                 if (text.includes('***') || text.includes('* * *')) {
                    elements.push({ level: 'scene', text: 'Mudança de Cena', type: 'scene' });
                 }
            }
        };

        Array.from(tempDiv.querySelectorAll('h1, h2, h3, p, div, hr')).forEach(processNode);
        setStructure(elements);
    }
  };

  useEffect(() => {
      if (activeMode === ToolMode.STRUCTURE) {
          extractStructure();
      }
  }, [editorText, activeMode]);

  const handleEditorInput = (text: string) => {
      setEditorText(text);
      if (viewOptions.isSplitView && editorRef.current) {
          setCurrentHTML(editorRef.current.getHTML());
      }
  };

  const handleFormat = (command: string, value?: string) => {
    editorRef.current?.executeCommand(command, value);
  };

  const handleAppendText = (text: string) => {
      editorRef.current?.appendText(text);
  }

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    });
  };

  const showModal = (title: string, content: React.ReactNode) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  const handleCoverGeneration = (
      mode: 'full' | 'image' | 'variation',
      initialValues: {title: string, author: string, quote: string, detail: string} = {title: '', author: '', quote: '', detail: ''},
      preSelectedStyle: string = 'cinematic photorealistic'
  ) => {
      
      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const title = formData.get('title') as string;
          const author = formData.get('author') as string;
          const quote = formData.get('quote') as string;
          const desc = formData.get('desc') as string;
          const style = formData.get('style') as string;

          showModal("Criando Arte...", (
            <div className="p-8 flex justify-center items-center flex-col gap-4">
               <Loader2 className="animate-spin text-accent" size={32} />
               <span className="text-black font-script text-2xl">A Athena está pintando sua capa...</span>
           </div>
          ));

          // Construct Prompt
          let prompt = "";
          if (mode === 'full') {
              prompt = `Create a full book cover spread design including front cover, spine, and back cover.
              Title: "${title}".
              Author: "${author}".
              Style: ${style}.
              Visuals: ${desc}.
              The front cover should feature the main imagery. The back cover should be complementary. The spine should have the title.
              Atmosphere: Professional, high resolution, commercial book cover quality.
              Optional text/quote: "${quote}".`;
          } else if (mode === 'image') {
              prompt = `A high-quality artistic illustration suitable for a book cover. 
              Subject: ${desc}. 
              Style: ${style}. 
              Atmosphere: Cinematic, detailed.`;
          } else {
              prompt = `Create 4 different stylistic layout variations for a book cover concept. Subject: ${desc}. Style: ${style}. Show variety in composition and typography.`;
          }

          const imageBase64 = await generateImage(prompt);

          if (imageBase64) {
            showModal("Sua Capa", (
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-full max-w-lg shadow-2xl rounded-sm overflow-hidden border-4 border-white">
                         <img src={imageBase64} alt="Generated Cover" className="w-full h-auto" />
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button 
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = imageBase64;
                                link.download = `Athena_Capa_${title || 'cover'}.png`;
                                link.click();
                            }}
                            className="flex items-center gap-2 px-6 py-2 bg-ink text-white rounded hover:bg-stone-800 text-lg"
                        >
                            <Download size={20} /> Baixar Imagem
                        </button>
                        <button 
                            onClick={() => {
                                editorRef.current?.insertImage(imageBase64);
                                setModalOpen(false);
                            }}
                            className="flex items-center gap-2 px-6 py-2 border border-stone-300 rounded hover:bg-stone-100 text-black text-lg"
                        >
                            <ImageIcon size={20} /> Inserir no Texto
                        </button>
                    </div>
                </div>
            ));
          } else {
              showModal("Erro", <p className="text-red-600 text-lg">Não foi possível gerar a imagem. Tente novamente com uma descrição diferente.</p>);
          }
      };

      showModal(mode === 'full' ? "Criar Capa Completa" : "Gerar Imagem", (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-2 text-black">
              {mode !== 'image' && (
                  <>
                    <div>
                        <label className="block text-sm font-bold text-stone-600 uppercase mb-1">Título do Livro</label>
                        <input name="title" defaultValue={initialValues.title} className="w-full p-2 border border-stone-300 rounded" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-stone-600 uppercase mb-1">Autor</label>
                            <input name="author" defaultValue={initialValues.author} className="w-full p-2 border border-stone-300 rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-stone-600 uppercase mb-1">Frase de Efeito (Opcional)</label>
                            <input name="quote" defaultValue={initialValues.quote} className="w-full p-2 border border-stone-300 rounded" />
                        </div>
                    </div>
                  </>
              )}
              
              <div>
                  <label className="block text-sm font-bold text-stone-600 uppercase mb-1">
                      {mode === 'image' ? 'O que você quer ver na imagem?' : 'Descrição Visual da Capa'}
                  </label>
                  <textarea 
                    name="desc" 
                    className="w-full p-2 border border-stone-300 rounded h-24" 
                    placeholder="Uma torre de cristal em meio a uma tempestade, cores escuras e misteriosas..." 
                    defaultValue={initialValues.detail}
                    required 
                  />
              </div>

              <div>
                  <label className="block text-sm font-bold text-stone-600 uppercase mb-1">Estilo Artístico</label>
                  <select name="style" defaultValue={preSelectedStyle} className="w-full p-2 border border-stone-300 rounded bg-white">
                      <option value="cinematic photorealistic 8k">Cinematográfico (Realista)</option>
                      <option value="digital art fantasy oil painting">Pintura Digital (Fantasia)</option>
                      <option value="minimalist clean vector design">Minimalista (Vetor)</option>
                      <option value="vintage retro book cover">Vintage / Retrô</option>
                      <option value="dark gothic horror surreal">Gótico / Terror Surreal</option>
                      <option value="watercolor artistic soft">Aquarela Suave</option>
                  </select>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded">Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-accent text-white rounded hover:bg-accent-hover font-bold shadow-sm">
                      {mode === 'full' ? 'Gerar Capa' : 'Gerar Arte'}
                  </button>
              </div>
          </form>
      ));
  };

  // Centralized File Actions Controller
  const handleFileAction = async (action: string, format?: string) => {
    // --- CREDITS ACTION ---
    if (action === 'app:credits') {
        showModal("Créditos", (
            <div className="text-center p-6 space-y-6">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto border-2 border-accent/20">
                    <Feather className="text-accent w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Programação e Design</h3>
                    <p className="font-cinzel text-2xl text-ink font-bold">Jorge Pereira de Oliveira</p>
                </div>
                <div className="pt-6 border-t border-stone-100 text-xs text-stone-400 flex flex-col gap-1">
                    <span>Athena Editor v1.2 (PWA Enabled)</span>
                    <span>Desenvolvido com Google Gemini AI</span>
                </div>
            </div>
        ));
        return;
    }

    // --- INSTALL ACTION ---
    if (action === 'install_app') {
        handleInstallClick();
        return;
    }

    // --- AI Actions ---
    if (action.startsWith('ai:')) {
        const aiTask = action.split(':')[1];
        const param = action.split(':')[2];

        // COVER: Automatic Generation from Context
        if (aiTask === 'cover_auto') {
            showModal("Analisando Obra...", <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto mb-2"/>Lendo seu livro para criar a capa perfeita...</div>);
            const description = await generateCreativeContent('cover_description', editorText);
            if (description) {
                handleCoverGeneration('full', {title: 'Meu Livro', author: 'Autor', quote: '', detail: description});
            }
            return;
        }
        // COVER: Edit Specifics
        if (aiTask === 'cover_edit') {
            handleCoverGeneration('full', {title: 'Título', author: 'Autor', quote: '', detail: ''}); // Simplified for demo
            return;
        }
        // COVER: Styles
        if (aiTask === 'cover_style') {
            handleCoverGeneration('full', undefined, param);
            return;
        }

        // GENERAL AI TEXT GEN
        showModal("Athena Trabalhando...", <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto mb-2"/>Processando sua solicitação criativa...</div>);
        const result = await generateCreativeContent(aiTask as any, editorText, param);
        setModalOpen(false);
        
        if (result) {
            // For some tasks we show a result modal, for others we might append?
            // Let's show a result modal with "Insert" option
            showModal("Sugestão da Athena", (
                <div className="flex flex-col gap-4 h-[60vh]">
                    <textarea className="flex-1 w-full p-4 border border-stone-200 rounded font-serif text-stone-700 resize-none focus:outline-accent" defaultValue={result} />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => {navigator.clipboard.writeText(result); alert("Copiado!")}} className="px-4 py-2 border border-stone-300 rounded flex items-center gap-2"><Copy size={16}/> Copiar</button>
                        <button onClick={() => {handleAppendText("\n" + result); setModalOpen(false);}} className="px-4 py-2 bg-ink text-white rounded flex items-center gap-2"><Check size={16}/> Inserir no Texto</button>
                    </div>
                </div>
            ));
        }
        return;
    }

    // --- View Options ---
    if (action.startsWith('view:')) {
        const viewType = action.split(':')[1];
        switch(viewType) {
            case 'zoom_in': setViewOptions(v => ({...v, zoom: Math.min(200, v.zoom + 10)})); break;
            case 'zoom_out': setViewOptions(v => ({...v, zoom: Math.max(50, v.zoom - 10)})); break;
            case 'zoom_reset': setViewOptions(v => ({...v, zoom: 100})); break;
            case 'linenumbers': setViewOptions(v => ({...v, showLineNumbers: !v.showLineNumbers})); break;
            case 'pagenumbers': setViewOptions(v => ({...v, showPageNumbers: !v.showPageNumbers})); break;
            case 'theme': setViewOptions(v => ({...v, isDarkMode: !v.isDarkMode})); break;
            case 'statusbar': setViewOptions(v => ({...v, showStatusBar: !v.showStatusBar})); break;
            case 'split': setViewOptions(v => ({...v, isSplitView: !v.isSplitView})); break;
            case 'typewriter': setViewOptions(v => ({...v, isTypewriterMode: !v.isTypewriterMode})); break;
            case 'visual_map': 
                if(activeMode === ToolMode.STRUCTURE) setActiveMode(ToolMode.NONE);
                else setActiveMode(ToolMode.STRUCTURE);
                break;
            case 'structure': 
                 if(activeMode === ToolMode.STRUCTURE) setActiveMode(ToolMode.NONE);
                 else setActiveMode(ToolMode.STRUCTURE);
                 break;
        }
        return;
    }

    // --- Org Actions ---
    if (action.startsWith('org:')) {
        const orgTask = action.split(':')[1];
        if (orgTask === 'scenes:new') {
            setOrgView('scenes');
            setPendingOrgAction('add_scene');
            setActiveMode(ToolMode.ORGANIZATION);
        } else if (orgTask === 'scenes:open') {
            setOrgView('scenes');
            setActiveMode(ToolMode.ORGANIZATION);
        } else if (['timeline', 'characters', 'notes', 'research'].includes(orgTask)) {
            setOrgView(orgTask as OrgView);
            setActiveMode(ToolMode.ORGANIZATION);
        }
        return;
    }

    // --- Editor Actions ---
    if (action.startsWith('edit:')) {
        const cmd = action.split(':')[1];
        if (cmd === 'page_a4') setConfig({...config, maxWidth: '21cm'});
        else if (cmd === 'page_a5') setConfig({...config, maxWidth: '14.8cm'});
        else if (cmd === 'page_6x9') setConfig({...config, maxWidth: '15.24cm'});
        else if (cmd === 'page_pocket') setConfig({...config, maxWidth: '10.8cm'});
        else if (cmd === 'transform_upper') handleFormat('insertText', window.getSelection()?.toString().toUpperCase()); // Simplified
        else if (cmd === 'transform_lower') handleFormat('insertText', window.getSelection()?.toString().toLowerCase());
        else handleFormat(cmd);
        return;
    }

    // --- Basic File Actions ---
    if (action === 'new') {
        if(confirm("Criar novo documento? O atual será perdido se não salvo.")) {
            editorRef.current?.setHTML('');
            setEditorText('');
        }
    } else if (action === 'save') {
        const blob = new Blob([editorText], {type: "text/plain;charset=utf-8"});
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "meu_livro_athena.txt";
        a.click();
    } else if (action === 'save_as') {
        // Handle different formats based on 'format' arg
        const content = format === 'md' ? `# Meu Livro\n\n${editorText}` : editorText;
        const blob = new Blob([content], {type: "text/plain;charset=utf-8"});
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `documento.${format}`;
        a.click();
    }
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${viewOptions.isDarkMode ? 'bg-stone-900' : 'bg-stone-100'}`}>
      
      {/* SPLASH SCREEN */}
      {showSplash && (
        <div className="fixed inset-0 z-[100] bg-[#fdfbf7] flex flex-col items-center justify-center transition-opacity duration-700" style={{ opacity: showSplash ? 1 : 0, pointerEvents: showSplash ? 'all' : 'none' }}>
           <div className="relative w-48 h-48 mb-6 animate-in zoom-in duration-1000">
               {/* Placeholder for Goddess Athena Illustration - Using an abstract representation for code */}
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Owl_of_Athena_-_Athenian_tetradrachm_coin_-_AoE.png/512px-Owl_of_Athena_-_Athenian_tetradrachm_coin_-_AoE.png" 
                    className="w-full h-full object-contain opacity-80 drop-shadow-2xl" alt="Owl of Athena" />
           </div>
           <h1 className="font-script text-6xl text-ink mb-2 animate-in slide-in-from-bottom-4 duration-1000 delay-300">Athena</h1>
           <p className="text-stone-500 font-serif italic tracking-widest text-sm animate-in slide-in-from-bottom-4 duration-1000 delay-500">A Sabedoria da Escrita</p>
           <div className="mt-8 w-16 h-1 bg-accent/30 rounded-full overflow-hidden">
              <div className="h-full bg-accent w-full animate-[shimmer_2s_infinite]"></div>
           </div>
        </div>
      )}

      {/* MAIN MODAL */}
      {modalOpen && (
          <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                      <h3 className="font-cinzel font-bold text-xl text-ink">{modalTitle}</h3>
                      <button onClick={() => setModalOpen(false)}><X className="text-stone-400 hover:text-ink"/></button>
                  </div>
                  <div className="p-4 overflow-y-auto">
                      {modalContent}
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
            activeMode={activeMode} 
            setMode={setActiveMode}
            isCollapsed={isSidebarCollapsed}
            toggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
            onFileAction={handleFileAction}
            installApp={!!installPrompt}
        />
        
        <div className="flex-1 flex flex-col relative min-w-0">
          <Toolbar 
            onFormat={handleFormat} 
            config={config} 
            setConfig={setConfig} 
          />
          
          <div className="flex-1 relative flex overflow-hidden">
             {/* Main Editor Area */}
             <div className={`flex-1 flex flex-col relative h-full transition-all duration-300 ${viewOptions.isSplitView ? 'w-1/2' : 'w-full'}`}>
                <Editor 
                    ref={editorRef}
                    config={config}
                    viewOptions={viewOptions}
                    onInput={handleEditorInput}
                    readOnly={false}
                />
                {/* Status Bar */}
                {viewOptions.showStatusBar && (
                    <div className="h-8 bg-stone-200 border-t border-stone-300 flex items-center px-4 text-xs text-stone-600 justify-between select-none no-print">
                        <div className="flex gap-4">
                            <span>Palavras: {editorText.split(/\s+/).filter(w => w.length > 0).length}</span>
                            <span>Caracteres: {editorText.length}</span>
                        </div>
                        <div>
                             {editorText.length < 100 ? "Rascunho Inicial" : "Escrevendo..."}
                        </div>
                    </div>
                )}
             </div>

             {/* Split View (Preview/Reference) */}
             {viewOptions.isSplitView && (
                 <div className="w-1/2 border-l border-stone-300 bg-white h-full overflow-y-auto p-8 prose prose-stone max-w-none">
                     <h3 className="text-center text-stone-400 uppercase text-xs font-bold tracking-widest mb-8">Visualização de Leitura</h3>
                     <div dangerouslySetInnerHTML={{__html: currentHTML}} />
                 </div>
             )}
             
             {/* Right Panels (Overlay or Side) */}
             {(activeMode === ToolMode.NARRATIVE || activeMode === ToolMode.GRAMMAR || activeMode === ToolMode.SETTINGS) && (
                <div className="relative z-20">
                     <AIPanel 
                        mode={activeMode}
                        editorText={editorText}
                        closePanel={() => setActiveMode(ToolMode.NONE)}
                        config={config}
                        setConfig={setConfig}
                        appendUserText={handleAppendText}
                    />
                </div>
             )}
             
             {activeMode === ToolMode.ORGANIZATION && (
                 <div className="relative z-20">
                    <OrganizationPanel 
                        currentView={orgView} 
                        onClose={() => setActiveMode(ToolMode.NONE)} 
                        pendingAction={pendingOrgAction}
                        clearPendingAction={() => setPendingOrgAction(null)}
                    />
                 </div>
             )}

             {activeMode === ToolMode.STRUCTURE && (
                 <div className="relative z-20">
                     <StructurePanel structure={structure} onClose={() => setActiveMode(ToolMode.NONE)} />
                 </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;