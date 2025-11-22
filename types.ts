export enum ToolMode {
  NONE = 'NONE',
  NARRATIVE = 'NARRATIVE',
  GRAMMAR = 'GRAMMAR',
  SETTINGS = 'SETTINGS',
  STRUCTURE = 'STRUCTURE',
  ORGANIZATION = 'ORGANIZATION'
}

export enum NarrativeModel {
  HEROS_JOURNEY = 'Jornada do Herói',
  THREE_ACTS = 'Estrutura de Três Atos',
  SAVE_THE_CAT = 'Save the Cat',
  KISHOTENKETSU = 'Kishōtenketsu',
  FREYTAGS_PYRAMID = 'Pirâmide de Freytag'
}

export interface AIResponse {
  text: string;
  type: 'analysis' | 'suggestion' | 'correction' | 'error';
}

export interface EditorConfig {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  maxWidth: string;
  textAlign: 'justify' | 'left';
}

export interface GrammarResult {
  original: string;
  correction: string;
  explanation: string;
}

export interface ViewOptions {
  zoom: number;
  showLineNumbers: boolean;
  showPageNumbers: boolean;
  isDarkMode: boolean;
  showStatusBar: boolean;
  showStructure: boolean;
  isSplitView: boolean;
  isTypewriterMode: boolean;
}