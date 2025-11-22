import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignJustify, 
  AlignCenter,
  Type,
  Undo,
  Redo
} from 'lucide-react';
import { EditorConfig } from '../types';

interface ToolbarProps {
  onFormat: (command: string, value?: string) => void;
  config: EditorConfig;
  setConfig: (config: EditorConfig) => void;
}

const fonts = [
  { name: 'Cormorant Garamond', value: 'Cormorant Garamond' },
  { name: 'Merriweather', value: 'Merriweather' },
  { name: 'Lora', value: 'Lora' },
  { name: 'Playfair Display', value: 'Playfair Display' },
  { name: 'Inter (Sans)', value: 'Inter' },
  { name: 'Courier Prime (Mono)', value: 'monospace' },
  { name: 'Sistema (Serif)', value: 'serif' },
];

const Toolbar: React.FC<ToolbarProps> = ({ onFormat, config, setConfig }) => {
  
  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConfig({ ...config, fontFamily: e.target.value });
  };

  const Button: React.FC<{ cmd: string; arg?: string; icon: React.ReactNode; title: string }> = ({ cmd, arg, icon, title }) => (
    <button
      onClick={() => onFormat(cmd, arg)}
      className="p-2 text-stone-600 hover:bg-stone-200 rounded transition-colors"
      title={title}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-stone-200 shadow-sm z-10 h-14 no-print">
      
      {/* History */}
      <div className="flex gap-1 mr-4 border-r border-stone-200 pr-2">
        <Button cmd="undo" icon={<Undo size={18} />} title="Desfazer" />
        <Button cmd="redo" icon={<Redo size={18} />} title="Refazer" />
      </div>

      {/* Typography */}
      <div className="flex items-center gap-2 mr-4 border-r border-stone-200 pr-4 hidden sm:flex">
        <Type size={18} className="text-stone-400" />
        <select 
          value={config.fontFamily}
          onChange={handleFontChange}
          className="bg-transparent border-none text-sm text-stone-700 focus:ring-0 cursor-pointer outline-none font-medium w-32 lg:w-40"
        >
          {fonts.map(f => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.name}
            </option>
          ))}
        </select>
        
        <div className="flex items-center gap-2 ml-2 bg-stone-100 rounded px-2 py-1">
           <button 
             onClick={() => setConfig({...config, fontSize: Math.max(10, config.fontSize - 1)})}
             className="text-xs font-bold text-stone-600 hover:text-stone-900 w-4"
           >-</button>
           <span className="text-xs min-w-[1.5rem] text-center">{config.fontSize}</span>
           <button 
             onClick={() => setConfig({...config, fontSize: Math.min(36, config.fontSize + 1)})}
             className="text-xs font-bold text-stone-600 hover:text-stone-900 w-4"
           >+</button>
        </div>
      </div>

      {/* Basic Formatting */}
      <div className="flex gap-1 border-r border-stone-200 pr-2 mr-2">
        <Button cmd="bold" icon={<Bold size={18} />} title="Negrito (Ctrl+B)" />
        <Button cmd="italic" icon={<Italic size={18} />} title="Itálico (Ctrl+I)" />
        <Button cmd="underline" icon={<Underline size={18} />} title="Sublinhado (Ctrl+U)" />
      </div>

      {/* Alignment */}
      <div className="flex gap-1 border-r border-stone-200 pr-4 mr-2 hidden md:flex">
        <Button cmd="justifyLeft" icon={<AlignLeft size={18} />} title="Alinhar à Esquerda" />
        <Button cmd="justifyCenter" icon={<AlignCenter size={18} />} title="Centralizar" />
        <Button cmd="justifyFull" icon={<AlignJustify size={18} />} title="Justificar" />
      </div>
      
      <div className="flex-grow"></div>
      <div className="text-lg text-stone-400 font-script hidden lg:block">Athena V1.1</div>
    </div>
  );
};

export default Toolbar;