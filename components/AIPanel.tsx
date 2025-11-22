import React, { useState, useEffect } from 'react';
import { ToolMode, NarrativeModel, EditorConfig } from '../types';
import { analyzeNarrative, checkGrammar, continueStory } from '../services/geminiService';
import { Loader2, Sparkles, Send, CheckCircle2, X, Feather } from 'lucide-react';

interface AIPanelProps {
  mode: ToolMode;
  editorText: string;
  closePanel: () => void;
  config: EditorConfig;
  setConfig: (c: EditorConfig) => void;
  appendUserText: (text: string) => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ mode, editorText, closePanel, config, setConfig, appendUserText }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<NarrativeModel>(NarrativeModel.HEROS_JOURNEY);
  const [continuationContext, setContinuationContext] = useState('');

  // Reset result when switching modes
  useEffect(() => {
    setResult('');
    setLoading(false);
  }, [mode]);

  const handleAnalysis = async () => {
    if (!editorText.trim()) {
      setResult("Por favor, escreva algo no editor antes de solicitar uma análise.");
      return;
    }
    setLoading(true);
    const res = await analyzeNarrative(editorText, selectedModel);
    setResult(res);
    setLoading(false);
  };

  const handleGrammarCheck = async () => {
    if (!editorText.trim()) return;
    setLoading(true);
    const res = await checkGrammar(editorText);
    setResult(res);
    setLoading(false);
  };

  const handleContinue = async () => {
    if (!editorText.trim()) return;
    setLoading(true);
    const res = await continueStory(editorText, continuationContext);
    if (res) {
        appendUserText(" " + res);
        setResult("Texto adicionado ao editor com sucesso.");
    } else {
        setResult("Não foi possível gerar uma continuação.");
    }
    setLoading(false);
  }

  if (mode === ToolMode.NONE) return null;

  return (
    <div className="w-96 bg-white border-l border-stone-200 h-full shadow-xl flex flex-col absolute right-0 top-0 bottom-0 z-20">
      
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-stone-200 bg-stone-50">
        <h2 className="font-cinzel font-bold text-lg text-stone-800">
          {mode === ToolMode.NARRATIVE && "Assistente Narrativo"}
          {mode === ToolMode.GRAMMAR && "Revisão Gramatical"}
          {mode === ToolMode.SETTINGS && "Diagramação"}
        </h2>
        <button onClick={closePanel} className="text-stone-400 hover:text-stone-800">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* NARRATIVE MODE */}
        {mode === ToolMode.NARRATIVE && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Modelo Narrativo</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as NarrativeModel)}
                className="w-full p-2 border border-stone-300 rounded text-sm focus:ring-accent focus:border-accent"
              >
                {Object.values(NarrativeModel).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <p className="text-xs text-stone-400">A IA analisará seu texto buscando padrões deste modelo.</p>
            </div>

            <button 
              onClick={handleAnalysis}
              disabled={loading}
              className="w-full py-2 bg-ink text-white rounded hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} className="text-accent" />}
              Analisar Estrutura
            </button>

             <hr className="border-stone-200" />

             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Bloqueio Criativo?</label>
                <textarea 
                    value={continuationContext}
                    onChange={(e) => setContinuationContext(e.target.value)}
                    placeholder="O que deve acontecer a seguir? (Opcional)"
                    className="w-full p-2 border border-stone-300 rounded text-sm h-20 resize-none"
                />
                <button 
                  onClick={handleContinue}
                  disabled={loading}
                  className="w-full py-2 border border-accent text-accent-hover hover:bg-accent hover:text-white rounded transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Feather size={16} />}
                  Escrever Continuação
                </button>
             </div>
          </>
        )}

        {/* GRAMMAR MODE */}
        {mode === ToolMode.GRAMMAR && (
          <>
            <div className="bg-stone-100 p-4 rounded-lg border border-stone-200">
              <p className="text-sm text-stone-600 mb-4">
                A Athena analisará ortografia, gramática e estilo, focando na norma culta da língua portuguesa.
              </p>
              <button 
                onClick={handleGrammarCheck}
                disabled={loading}
                className="w-full py-2 bg-white border border-stone-300 text-ink rounded hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 shadow-sm"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                Iniciar Revisão
              </button>
            </div>
          </>
        )}

        {/* DIAGRAM MODE (SETTINGS) */}
        {mode === ToolMode.SETTINGS && (
          <div className="space-y-6">
             <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Largura da Página</label>
                <div className="flex gap-2">
                    <button onClick={() => setConfig({...config, maxWidth: '65ch'})} className={`flex-1 py-2 text-sm border rounded ${config.maxWidth === '65ch' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-stone-300'}`}>Foco</button>
                    <button onClick={() => setConfig({...config, maxWidth: '80ch'})} className={`flex-1 py-2 text-sm border rounded ${config.maxWidth === '80ch' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-stone-300'}`}>Padrão</button>
                    <button onClick={() => setConfig({...config, maxWidth: '100%'})} className={`flex-1 py-2 text-sm border rounded ${config.maxWidth === '100%' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-stone-300'}`}>Larga</button>
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Altura da Linha</label>
                <input 
                  type="range" 
                  min="1" 
                  max="2.5" 
                  step="0.1" 
                  value={config.lineHeight}
                  onChange={(e) => setConfig({...config, lineHeight: parseFloat(e.target.value)})}
                  className="w-full accent-ink"
                />
                <div className="flex justify-between text-xs text-stone-400">
                    <span>Compacto</span>
                    <span>{config.lineHeight}</span>
                    <span>Arejado</span>
                </div>
             </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Alinhamento</label>
                 <div className="flex gap-2">
                    <button onClick={() => setConfig({...config, textAlign: 'left'})} className={`flex-1 py-2 text-sm border rounded ${config.textAlign === 'left' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-stone-300'}`}>Esquerda</button>
                    <button onClick={() => setConfig({...config, textAlign: 'justify'})} className={`flex-1 py-2 text-sm border rounded ${config.textAlign === 'justify' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-stone-300'}`}>Justificado</button>
                </div>
             </div>
          </div>
        )}

        {/* RESULTS AREA */}
        {result && (mode === ToolMode.NARRATIVE || mode === ToolMode.GRAMMAR) && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                <h3 className="text-sm font-bold text-ink uppercase">Feedback da Athena</h3>
            </div>
            <div className="bg-stone-50 p-4 rounded border border-stone-200 text-sm text-stone-700 leading-relaxed font-serif prose prose-stone max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm">{result}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPanel;