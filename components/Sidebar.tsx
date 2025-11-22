import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  SpellCheck, 
  Settings, 
  Feather,
  PanelRightClose,
  PanelRightOpen,
  Folder,
  Save,
  Download,
  Upload,
  Printer,
  FileText,
  FileCode,
  Image as ImageIcon,
  Book,
  ChevronRight,
  FilePlus,
  FolderOpen,
  Edit3,
  Undo,
  Redo,
  Scissors,
  Copy,
  Clipboard,
  Maximize,
  Search,
  RefreshCw,
  Wrench,
  Calculator,
  CheckCheck,
  Library,
  Eye,
  ZoomIn,
  ZoomOut,
  List,
  Hash,
  FileDigit,
  Moon,
  Sun,
  PanelBottom,
  FolderKanban,
  LayoutGrid,
  Clock,
  Users,
  StickyNote,
  Globe,
  LayoutTemplate,
  Smartphone,
  Scaling,
  Rocket,
  Share2,
  Palette,
  Tablet,
  Sparkles,
  PenTool,
  Lightbulb,
  AlignLeft,
  Type,
  Layers,
  User,
  Quote,
  Image,
  Map,
  Waypoints,
  Network,
  Zap,
  ChevronsRight,
  Mic,
  Cloud,
  Plus,
  PlayCircle,
  AlertTriangle,
  Columns,
  Map as MapIcon,
  Type as TypeIcon,
  Eraser,
  ALargeSmall,
  CaseUpper,
  CaseLower,
  Minimize2,
  Activity,
  Repeat,
  AlertCircle,
  Fingerprint,
  Heading,
  MoreHorizontal,
  Sword,
  TrendingUp,
  Target,
  Shuffle,
  GitBranch,
  Anchor,
  Music,
  Wind,
  HeartPulse,
  FastForward,
  BarChart3,
  Flag,
  Shield,
  RefreshCcw,
  Heart,
  LogOut,
  Crosshair,
  Wand2,
  Ghost,
  Minimize,
  Info
} from 'lucide-react';
import { ToolMode } from '../types';

interface SidebarProps {
  activeMode: ToolMode;
  setMode: (mode: ToolMode) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onFileAction: (action: string, format?: string) => void;
  installApp?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMode, setMode, isCollapsed, toggleCollapse, onFileAction, installApp }) => {
  // State now tracks which menu is open: 'file' | 'edit' | 'tools' | 'view' | 'org' | 'pub' | 'ai_creative' | null
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setActiveSubMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const NavItem = ({ mode, icon: Icon, label }: { mode: ToolMode; icon: any; label: string }) => (
    <button
      onClick={() => {
        setMode(activeMode === mode ? ToolMode.NONE : mode);
        setActiveMenu(null);
      }}
      className={`
        w-full p-3 flex items-center gap-3 transition-all duration-200 relative
        ${activeMode === mode 
          ? 'bg-stone-200 text-ink border-l-4 border-accent' 
          : 'text-stone-500 hover:bg-stone-100 hover:text-ink border-l-4 border-transparent'}
      `}
      title={label}
    >
      <Icon size={24} strokeWidth={1.5} />
      {!isCollapsed && <span className="text-sm font-medium font-sans">{label}</span>}
    </button>
  );

  // --- Generic Menu Item Components ---

  const SubMenuItem = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <button
      onClick={(e) => { 
        e.stopPropagation();
        onClick(); 
        setActiveMenu(null); 
      }}
      className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2"
    >
      <Icon size={16} className="text-stone-500" />
      <span>{label}</span>
    </button>
  );

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    onClick, 
    hasSubmenu = false, 
    subMenuId = '' 
  }: { 
    icon: any, 
    label: string, 
    onClick?: () => void, 
    hasSubmenu?: boolean, 
    subMenuId?: string 
  }) => (
    <div 
      className="relative group w-full"
      onMouseEnter={() => setActiveSubMenu(hasSubmenu ? subMenuId : null)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!hasSubmenu && onClick) {
            onClick();
            setActiveMenu(null);
          }
        }}
        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-stone-500" />
          <span>{label}</span>
        </div>
        {hasSubmenu && <ChevronRight size={14} className="text-stone-400" />}
      </button>
      
      {/* Submenu Rendering Logic */}
      {hasSubmenu && activeSubMenu === subMenuId && (
        <div className="absolute left-full top-0 ml-1 w-64 bg-white border border-stone-200 shadow-lg rounded-lg py-1 z-[70]">
           {/* File Submenus */}
          {subMenuId === 'save_as' && (
             <>
              <SubMenuItem icon={FileText} label="Texto Puro (.txt)" onClick={() => onFileAction('save_as', 'txt')} />
              <SubMenuItem icon={FileCode} label="Markdown (.md)" onClick={() => onFileAction('save_as', 'md')} />
             </>
          )}
          {subMenuId === 'import' && (
             <>
              <SubMenuItem icon={FileText} label="Texto (.txt, .md)" onClick={() => onFileAction('import', 'text')} />
              <SubMenuItem icon={ImageIcon} label="Imagem" onClick={() => onFileAction('import', 'image')} />
             </>
          )}
          {subMenuId === 'export' && (
             <>
              <SubMenuItem icon={Printer} label="PDF" onClick={() => onFileAction('export', 'pdf')} />
              <SubMenuItem icon={FileText} label="Word (.docx)" onClick={() => onFileAction('export', 'docx')} />
              <SubMenuItem icon={Book} label="Epub" onClick={() => onFileAction('export', 'epub')} />
             </>
          )}
          {/* Edit Submenus */}
          {subMenuId === 'page_setup' && (
             <>
              <SubMenuItem icon={FileText} label="A4 (Padrão)" onClick={() => onFileAction('edit:page_a4')} />
              <SubMenuItem icon={Book} label="A5 (Romance)" onClick={() => onFileAction('edit:page_a5')} />
              <SubMenuItem icon={BookOpen} label="Trade (6x9)" onClick={() => onFileAction('edit:page_6x9')} />
              <SubMenuItem icon={Smartphone} label="Pocket (4x7)" onClick={() => onFileAction('edit:page_pocket')} />
              <SubMenuItem icon={Scaling} label="Personalizado..." onClick={() => onFileAction('edit:page_custom')} />
             </>
          )}
          {subMenuId === 'edit_transform' && (
             <>
              <SubMenuItem icon={CaseUpper} label="Tudo maiúsculas" onClick={() => onFileAction('edit:transform_upper')} />
              <SubMenuItem icon={CaseLower} label="Tudo minúsculas" onClick={() => onFileAction('edit:transform_lower')} />
              <SubMenuItem icon={Heading} label="Capitalização automática" onClick={() => onFileAction('edit:transform_title')} />
             </>
          )}
          {/* View Submenus */}
          {subMenuId === 'zoom' && (
            <>
              <SubMenuItem icon={ZoomIn} label="Ampliar (+)" onClick={() => onFileAction('view:zoom_in')} />
              <SubMenuItem icon={ZoomOut} label="Reduzir (-)" onClick={() => onFileAction('view:zoom_out')} />
              <SubMenuItem icon={Maximize} label="Restaurar (100%)" onClick={() => onFileAction('view:zoom_reset')} />
            </>
          )}
          {/* AI: Narrative Map */}
          {subMenuId === 'ai_narrative_map' && (
             <>
              <SubMenuItem icon={Clock} label="Timeline automática, arcos e andamento" onClick={() => onFileAction('ai:story_map')} />
              <SubMenuItem icon={Network} label="Conexões entre eventos e personagens" onClick={() => onFileAction('ai:story_connections')} />
              <SubMenuItem icon={Zap} label="Sugestões de conflitos" onClick={() => onFileAction('ai:story_conflicts')} />
             </>
          )}
           {/* Org: Scene Cards */}
           {subMenuId === 'org_scenes' && (
             <>
              <SubMenuItem icon={PlayCircle} label="Cena Inicial" onClick={() => onFileAction('org:scenes:open')} />
              <SubMenuItem icon={AlertTriangle} label="Incidente Incitante" onClick={() => onFileAction('org:scenes:open')} />
              <div className="h-px bg-stone-100 my-1"></div>
              <SubMenuItem icon={Plus} label="+ Nova Cena" onClick={() => onFileAction('org:scenes:new')} />
             </>
          )}
        </div>
      )}
    </div>
  );

  const MenuButton = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => {
          setActiveMenu(activeMenu === id ? null : id);
          setMode(ToolMode.NONE);
      }}
      className={`
        w-full p-3 flex items-center gap-3 transition-all duration-200
        ${activeMenu === id 
          ? 'bg-stone-800 text-white border-l-4 border-stone-800' 
          : 'text-stone-500 hover:bg-stone-100 hover:text-ink border-l-4 border-transparent'}
      `}
      title={label}
    >
      <Icon size={24} strokeWidth={1.5} />
      {!isCollapsed && <span className="text-sm font-medium font-sans">{label}</span>}
    </button>
  );

  return (
    <div ref={sidebarRef} className={`bg-white border-r border-stone-200 flex flex-col h-full transition-all duration-300 z-50 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      
      {/* Brand - Changed Font to Script */}
      <div className="h-14 flex items-center justify-center border-b border-stone-200 mb-2 flex-shrink-0">
        <Feather className={`text-accent transition-all ${isCollapsed ? 'w-6 h-6' : 'w-8 h-8 mr-2'}`} />
        {!isCollapsed && <h1 className="font-script font-bold text-3xl tracking-wide text-ink">Athena</h1>}
      </div>

      {/* Navigation & Menus */}
      <nav className="flex-1 flex flex-col gap-1 py-2">
        
        {/* ARQUIVO MENU */}
        <div className="relative">
          <MenuButton id="file" icon={Folder} label="Arquivo" />
          {activeMenu === 'file' && (
            <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-stone-200 shadow-xl rounded-lg py-1 z-[60] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1">
                    Geral
                </div>
                <MenuItem icon={FilePlus} label="Novo" onClick={() => onFileAction('new')} />
                <MenuItem icon={FolderOpen} label="Abrir" onClick={() => onFileAction('open')} />
                
                <div className="h-px bg-stone-100 my-1"></div>
                
                <MenuItem icon={Save} label="Salvar" onClick={() => onFileAction('save')} />
                <MenuItem icon={Download} label="Salvar Como..." hasSubmenu subMenuId="save_as" />
                
                <div className="h-px bg-stone-100 my-1"></div>
                
                <MenuItem icon={Upload} label="Importar" hasSubmenu subMenuId="import" />
                <MenuItem icon={Download} label="Exportar" hasSubmenu subMenuId="export" />

                <div className="h-px bg-stone-100 my-1"></div>
                
                <div className="px-4 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1">
                    Nuvem
                </div>
                <MenuItem icon={Cloud} label="Google Docs" onClick={() => onFileAction('file:gdocs')} />
                
                <div className="h-px bg-stone-100 my-1"></div>

                <MenuItem icon={Info} label="Créditos" onClick={() => onFileAction('app:credits')} />

                {installApp && (
                    <>
                        <div className="h-px bg-stone-100 my-1"></div>
                        <MenuItem icon={Smartphone} label="Instalar Aplicativo" onClick={() => onFileAction('install_app')} />
                    </>
                )}
            </div>
          )}
        </div>

        {/* IA CRIATIVA MENU (NOVO) */}
        <div className="relative">
          <MenuButton id="ai_creative" icon={Sparkles} label="IA Criativa" />
          {activeMenu === 'ai_creative' && (
            <div className="absolute left-full top-0 ml-2 w-64 bg-white border border-stone-200 shadow-xl rounded-lg py-1 z-[60] animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
                 {/* Submenu: Cena Inteligente (NOVO) */}
                 <div className="px-4 py-2 text-xs font-bold text-accent uppercase tracking-wider border-b border-stone-100 mb-1 flex items-center gap-2 bg-stone-50">
                    <Crosshair size={12}/> Cena Inteligente
                 </div>
                 <MenuItem icon={Flag} label="Objetivo" onClick={() => onFileAction('ai:scene_objective')} />
                 <MenuItem icon={Zap} label="Conflito" onClick={() => onFileAction('ai:scene_conflict')} />
                 <MenuItem icon={Shield} label="Obstáculo" onClick={() => onFileAction('ai:scene_obstacle')} />
                 <MenuItem icon={RefreshCcw} label="Reviravolta" onClick={() => onFileAction('ai:scene_twist')} />
                 <MenuItem icon={Heart} label="Valor Emocional" onClick={() => onFileAction('ai:scene_emotion')} />
                 <MenuItem icon={LogOut} label="Saída da Cena" onClick={() => onFileAction('ai:scene_exit')} />

                 <div className="h-px bg-stone-100 my-1"></div>

                 {/* Submenu: Narrativa */}
                 <div className="px-4 py-2 text-xs font-bold text-accent uppercase tracking-wider border-b border-stone-100 mb-1 flex items-center gap-2 bg-stone-50">
                    <Map size={12}/> Narrativa
                 </div>
                 <MenuItem icon={Waypoints} label="Mapa de História" hasSubmenu subMenuId="ai_narrative_map" />
                 <MenuItem icon={Sword} label="Jornada do Herói" onClick={() => onFileAction('ai:hero_journey')} />
                 <MenuItem icon={TrendingUp} label="Arco de Personagem" onClick={() => onFileAction('ai:character_arc')} />
                 <MenuItem icon={Zap} label="Gatilhos de Cena" onClick={() => onFileAction('ai:scene_triggers')} />
                 <MenuItem icon={Shuffle} label="Pontos de Virada Automáticos" onClick={() => onFileAction('ai:plot_points')} />
                 <MenuItem icon={Target} label="Conflito Central" onClick={() => onFileAction('ai:central_conflict')} />
                 <MenuItem icon={GitBranch} label="Subtramas Possíveis" onClick={() => onFileAction('ai:subplots')} />
                 <MenuItem icon={Anchor} label="Ganchos e Cliffhangers" onClick={() => onFileAction('ai:cliffhangers')} />

                 <div className="h-px bg-stone-100 my-1"></div>
                 
                 {/* Submenu: Música do Texto */}
                 <div className="px-4 py-2 text-xs font-bold text-accent uppercase tracking-wider border-b border-stone-100 mb-1 flex items-center gap-2 bg-stone-50">
                    <Music size={12}/> Música do Texto
                 </div>
                 <MenuItem icon={Activity} label="Análise Profunda" onClick={() => onFileAction('ai:text_music_analysis')} />
                 <MenuItem icon={FastForward} label="Velocidade Narrativa" onClick={() => onFileAction('ai:narrative_speed')} />
                 <MenuItem icon={Wind} label="Respiração das Frases" onClick={() => onFileAction('ai:sentence_breathing')} />
                 <MenuItem icon={HeartPulse} label="Intensidade Emocional" onClick={() => onFileAction('ai:emotional_intensity')} />
                 <MenuItem icon={BarChart3} label="Picos e Vales de Tensão" onClick={() => onFileAction('ai:tension_peaks')} />
                 
                 <div className="h-px bg-stone-100 my-1"></div>

                 {/* Submenu: Assistente de Estilo */}
                 <div className="px-4 py-2 text-xs font-bold text-accent uppercase tracking-wider border-b border-stone-100 mb-1 flex items-center gap-2 bg-stone-50">
                    <Feather size={12}/> Assistente de Estilo
                 </div>
                 <MenuItem icon={Fingerprint} label="Analisar Estilo do Autor" onClick={() => onFileAction('ai:style_analysis')} />
                 <MenuItem icon={Activity} label="Sugerir Ritmo e Cadência" onClick={() => onFileAction('ai:style_rhythm')} />
                 <MenuItem icon={Repeat} label="Detectar Palavras Repetidas" onClick={() => onFileAction('ai:style_repetition')} />
                 <MenuItem icon={Eye} label="Apontar “Dizer vs Mostrar”" onClick={() => onFileAction('ai:style_show')} />
                 <MenuItem icon={AlertCircle} label="Identificar Frases Fracas" onClick={() => onFileAction('ai:style_weak')} />

                 <div className="h-px bg-stone-100 my-1"></div>

                 {/* Submenu: Capas e Imagens (ATUALIZADO) */}
                 <div className="px-4 py-2 text-xs font-bold text-accent uppercase tracking-wider border-b border-stone-100 mb-1 flex items-center gap-2 bg-stone-50">
                    <ImageIcon size={12}/> Capas e Imagens
                 </div>
                 
                 {/* Geração Automática */}
                 <div className="px-4 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Geração Automática</div>
                 <MenuItem icon={Wand2} label="Gerar capa baseada no livro" onClick={() => onFileAction('ai:cover_auto')} />

                 {/* Edição Assistida */}
                 <div className="px-4 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Edição Assistida</div>
                 <MenuItem icon={Type} label="Adicionar Título" onClick={() => onFileAction('ai:cover_edit:title')} />
                 <MenuItem icon={User} label="Autor" onClick={() => onFileAction('ai:cover_edit:author')} />
                 <MenuItem icon={Quote} label="Frase de Impacto" onClick={() => onFileAction('ai:cover_edit:tagline')} />
                 <MenuItem icon={Palette} label="Detalhes Visuais" onClick={() => onFileAction('ai:cover_edit:visuals')} />

                 {/* Estilos Prontos */}
                 <div className="px-4 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Estilos Prontos</div>
                 <MenuItem icon={Sword} label="Fantasia" onClick={() => onFileAction('ai:cover_style:fantasy digital art')} />
                 <MenuItem icon={Rocket} label="Sci-Fi" onClick={() => onFileAction('ai:cover_style:sci-fi futuristic')} />
                 <MenuItem icon={Heart} label="Romance" onClick={() => onFileAction('ai:cover_style:romance book cover soft lighting')} />
                 <MenuItem icon={Ghost} label="Terror" onClick={() => onFileAction('ai:cover_style:horror dark thriller')} />
                 <MenuItem icon={Minimize} label="Minimalista" onClick={() => onFileAction('ai:cover_style:minimalist vector art')} />
                 <MenuItem icon={Zap} label="Neon" onClick={() => onFileAction('ai:cover_style:neon cyberpunk')} />

                 <div className="h-px bg-stone-100 my-1"></div>

                 {/* Submenu: Texto / Assistente de Escrita */}
                 <div className="px-4 py-2 text-xs font-bold text-accent uppercase tracking-wider border-b border-stone-100 mb-1 flex items-center gap-2 bg-stone-50">
                    <PenTool size={12}/> Texto
                 </div>
                 <MenuItem icon={ChevronRight} label="Sugerir Próximo Parágrafo" onClick={() => onFileAction('ai:next_paragraph')} />
                 <MenuItem icon={Maximize} label="Expandir Texto" onClick={() => onFileAction('ai:expand')} />
                 <MenuItem icon={AlignLeft} label="Resumir" onClick={() => onFileAction('ai:summarize')} />
                 <MenuItem icon={RefreshCw} label="Reescrever com outro tom" onClick={() => onFileAction('ai:rewrite')} />
                 
                 {/* Submenu: Criação de Conteúdo */}
                 <MenuItem icon={FileText} label="Sinopses" onClick={() => onFileAction('ai:synopsis')} />
                 <MenuItem icon={Type} label="Títulos" onClick={() => onFileAction('ai:titles')} />
                 <MenuItem icon={Users} label="Descrição de Personagens" onClick={() => onFileAction('ai:character')} />
                 <MenuItem icon={List} label="Estruturação de Capítulos" onClick={() => onFileAction('ai:chapters')} />
                 <MenuItem icon={LayoutGrid} label="Templates Narrativos" onClick={() => onFileAction('ai:narrative_templates')} />

                 <div className="h-px bg-stone-100 my-1"></div>

                 {/* Submenu: Edição Inteligente */}
                 <div className="px-4 py-2 text-xs font-bold text-accent uppercase tracking-wider border-b border-stone-100 mb-1 flex items-center gap-2 bg-stone-50">
                    <Sparkles size={12}/> Edição Inteligente
                 </div>
                 <MenuItem icon={ChevronsRight} label="Continuar do Ultimo Ponto" onClick={() => onFileAction('ai:smart_continue')} />
                 <MenuItem icon={Mic} label="Análise de voz narrativa" onClick={() => onFileAction('ai:voice_analysis')} />
            </div>
          )}
        </div>

        {/* EDITAR MENU */}
        <div className="relative">
          <MenuButton id="edit" icon={Edit3} label="Editar" />
          {activeMenu === 'edit' && (
            <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-stone-200 shadow-xl rounded-lg py-1 z-[60] animate-in fade-in zoom-in-95 duration-200">
                 <div className="px-4 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1">
                    Ferramentas
                </div>
                <MenuItem icon={Undo} label="Desfazer" onClick={() => onFileAction('edit:undo')} />
                <MenuItem icon={Redo} label="Refazer" onClick={() => onFileAction('edit:redo')} />
                <div className="h-px bg-stone-100 my-1"></div>
                <MenuItem icon={Scissors} label="Recortar" onClick={() => onFileAction('edit:cut')} />
                <MenuItem icon={Copy} label="Copiar" onClick={() => onFileAction('edit:copy')} />
                <MenuItem icon={Clipboard} label="Colar" onClick={() => onFileAction('edit:paste')} />
                <MenuItem icon={Maximize} label="Selecionar Tudo" onClick={() => onFileAction('edit:selectAll')} />
                <div className="h-px bg-stone-100 my-1"></div>
                <MenuItem icon={Eraser} label="Limpar Formatação" onClick={() => onFileAction('edit:clear_format')} />
                <MenuItem icon={ALargeSmall} label="Transformações de Texto" hasSubmenu subMenuId="edit_transform" />
                <MenuItem icon={Minimize2} label="Remover quebras extras" onClick={() => onFileAction('edit:remove_extra_breaks')} />
                <div className="h-px bg-stone-100 my-1"></div>
                <MenuItem icon={Search} label="Localizar" onClick={() => onFileAction('edit:find')} />
                <MenuItem icon={RefreshCw} label="Substituir" onClick={() => onFileAction('edit:replace')} />
                <div className="h-px bg-stone-100 my-1"></div>
                <MenuItem icon={LayoutTemplate} label="Configurar Página" hasSubmenu subMenuId="page_setup" />
            </div>
          )}
        </div>

        {/* ORGANIZAÇÃO MENU */}
        <div className="relative">
          <MenuButton id="org" icon={FolderKanban} label="Organização" />
          {activeMenu === 'org' && (
            <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-stone-200 shadow-xl rounded-lg py-1 z-[60] animate-in fade-in zoom-in-95 duration-200">
                 <div className="px-4 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1">
                    Planejamento
                </div>
                <MenuItem icon={LayoutGrid} label="Cartões de Cena" hasSubmenu subMenuId="org_scenes" />
                <MenuItem icon={Clock} label="Linha do Tempo" onClick={() => onFileAction('org:timeline')} />
                <div className="h-px bg-stone-100 my-1"></div>
                <MenuItem icon={Users} label="Ficha de Personagens" onClick={() => onFileAction('org:characters')} />
                <MenuItem icon={StickyNote} label="Anotações" onClick={() => onFileAction('org:notes')} />
                <div className="h-px bg-stone-100 my-1"></div>
                <MenuItem icon={Globe} label="Pesquisa" onClick={() => onFileAction('org:research')} />
            </div>
          )}
        </div>

        {/* PUBLICAÇÃO MENU */}
        <div className="relative">
          <MenuButton id="pub" icon={Rocket} label="Publicação" />
          {activeMenu === 'pub' && (
            <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-stone-200 shadow-xl rounded-lg py-1 z-[60] animate-in fade-in zoom-in-95 duration-200">
                 <div className="px-4 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1">
                    Distribuição
                </div>
                <MenuItem icon={Share2} label="Exportar para Plataformas" onClick={() => onFileAction('pub:export_platforms')} />
                <MenuItem icon={Tablet} label="Pré-visualização E-book" onClick={() => onFileAction('pub:preview_ebook')} />
                <div className="h-px bg-stone-100 my-1"></div>
                <MenuItem icon={Palette} label="Templates Profissionais" onClick={() => onFileAction('pub:templates')} />
            </div>
          )}
        </div>

        {/* FERRAMENTAS MENU */}
        <div className="relative">
          <MenuButton id="tools" icon={Wrench} label="Ferramentas" />
          {activeMenu === 'tools' && (
            <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-stone-200 shadow-xl rounded-lg py-1 z-[60] animate-in fade-in zoom-in-95 duration-200">
                 <div className="px-4 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1">
                    Utilitários
                </div>
                <MenuItem icon={Calculator} label="Contador de Palavras" onClick={() => onFileAction('tools:wordcount')} />
                <MenuItem icon={CheckCheck} label="Verificação" onClick={() => onFileAction('tools:check')} />
                <div className="h-px bg-stone-100 my-1"></div>
                <MenuItem icon={Book} label="Dicionário" onClick={() => onFileAction('tools:dict')} />
                <MenuItem icon={Library} label="Sinônimos" onClick={() => onFileAction('tools:synonyms')} />
            </div>
          )}
        </div>

         {/* EXIBIR MENU */}
         <div className="relative">
          <MenuButton id="view" icon={Eye} label="Exibir" />
          {activeMenu === 'view' && (
            <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-stone-200 shadow-xl rounded-lg py-1 z-[60] animate-in fade-in zoom-in-95 duration-200">
                 <div className="px-4 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1">
                    Visualização
                </div>
                <MenuItem icon={ZoomIn} label="Zoom" hasSubmenu subMenuId="zoom" />
                <div className="h-px bg-stone-100 my-1"></div>
                <MenuItem icon={Columns} label="Divisão em Colunas (Split)" onClick={() => onFileAction('view:split')} />
                <MenuItem icon={MapIcon} label="Mapa Visual do Documento" onClick={() => onFileAction('view:visual_map')} />
                <MenuItem icon={TypeIcon} label="Modo Máquina de Escrever" onClick={() => onFileAction('view:typewriter')} />
                <div className="h-px bg-stone-100 my-1"></div>
                <MenuItem icon={List} label="Estrutura Simples" onClick={() => onFileAction('view:structure')} />
                <MenuItem icon={Hash} label="Numeração de Linhas" onClick={() => onFileAction('view:linenumbers')} />
                <MenuItem icon={FileDigit} label="Numeração de Páginas" onClick={() => onFileAction('view:pagenumbers')} />
                <div className="h-px bg-stone-100 my-1"></div>
                <MenuItem icon={Moon} label="Modo Claro / Escuro" onClick={() => onFileAction('view:theme')} />
                <MenuItem icon={PanelBottom} label="Barra de Status" onClick={() => onFileAction('view:statusbar')} />
            </div>
          )}
        </div>
        
        <div className="h-px bg-stone-200 mx-4 my-2"></div>

        <NavItem mode={ToolMode.NARRATIVE} icon={BookOpen} label="Narrativa & Modelos" />
        <NavItem mode={ToolMode.GRAMMAR} icon={SpellCheck} label="Revisão & Gramática" />
        <NavItem mode={ToolMode.SETTINGS} icon={Settings} label="Diagramação & Layout" />
        <NavItem mode={ToolMode.STRUCTURE} icon={MapIcon} label="Mapa Visual" />
      </nav>

      {/* Collapse Toggle */}
      <button 
        onClick={toggleCollapse}
        className="p-4 text-stone-400 hover:text-stone-600 flex justify-center border-t border-stone-200 mt-auto"
      >
        {isCollapsed ? <PanelRightOpen size={20} /> : <PanelRightClose size={20} />}
      </button>
    </div>
  );
};

export default Sidebar;