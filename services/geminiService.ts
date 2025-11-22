import { GoogleGenAI, Type } from "@google/genai";
import { NarrativeModel } from "../types";

// Initialize the client safely
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeNarrative = async (text: string, modelType: NarrativeModel): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Erro: Chave de API não configurada.";

  const prompt = `
    Você é um editor literário experiente e crítico.
    Analise o seguinte texto com base na estrutura narrativa: ${modelType}.
    
    O texto é:
    "${text.substring(0, 15000)}" ${(text.length > 15000) ? '...(texto truncado)' : ''}
    
    Forneça uma análise estruturada em Markdown (use tópicos):
    1. Identifique em que ponto da estrutura ${modelType} este texto parece se encaixar.
    2. Pontos fortes da narrativa atual.
    3. Sugestões de melhoria para fortalecer a tensão narrativa e o desenvolvimento de personagens.
    4. Ideias para a próxima cena seguindo a lógica do modelo escolhido.

    Seja direto, construtivo e use português culto.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é a Athena, uma IA assistente para escritores profissionais.",
        temperature: 0.7
      }
    });
    return response.text || "Não foi possível gerar uma análise.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ocorreu um erro ao contatar a IA. Verifique sua conexão ou tente novamente.";
  }
};

export const checkGrammar = async (text: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Erro: Chave de API não configurada.";

  // For grammar, we want structured feedback but formatted nicely as text/markdown for the user to read
  const prompt = `
    Atue como um revisor gramatical de língua portuguesa (PT-BR) extremamente rigoroso.
    Verifique o texto abaixo em busca de:
    1. Erros ortográficos.
    2. Erros de concordância verbal e nominal.
    3. Erros de pontuação.
    4. Sugestões de estilo para tornar a prosa mais fluida e literária (evitando repetições e cacofonias).

    Texto:
    "${text.substring(0, 10000)}"

    Retorne a resposta em Markdown. 
    Se o texto estiver perfeito, elogie e diga que não há correções.
    Se houver erros, liste-os no formato:
    - **Erro encontrado**: [trecho errado] -> **Sugestão**: [correção] (Explicação breve).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1 
      }
    });
    return response.text || "Nenhuma sugestão gerada.";
  } catch (error) {
    return "Erro ao processar revisão gramatical.";
  }
};

export const continueStory = async (text: string, context: string = ''): Promise<string> => {
    const ai = getClient();
    if (!ai) return "";

    const prompt = `
      Você é um co-autor. Continue a história abaixo, mantendo o mesmo tom, estilo de escrita e voz do narrador.
      Escreva apenas a continuação (cerca de 200 palavras).
      
      Contexto adicional do autor: ${context}
      
      Texto atual:
      "${text.slice(-3000)}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "";
    } catch (error) {
        console.error(error);
        return "";
    }
};

export const getWordDefinition = async (word: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "Erro de configuração.";

    const prompt = `Defina a palavra "${word}" no contexto literário e da língua portuguesa. Seja breve e dê um exemplo de uso.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Definição não encontrada.";
    } catch (error) {
        return "Erro ao buscar definição.";
    }
};

export const getWordSynonyms = async (word: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "Erro de configuração.";

    const prompt = `Forneça 5 sinônimos sofisticados/literários para a palavra "${word}" e 3 antônimos. Formate como lista.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Sinônimos não encontrados.";
    } catch (error) {
        return "Erro ao buscar sinônimos.";
    }
};

// New function for Creative AI Menu
export const generateCreativeContent = async (
    task: 'next_paragraph' | 'expand' | 'summarize' | 'rewrite' | 'synopsis' | 'titles' | 'character' | 'chapters' | 'template' | 'story_map' | 'story_connections' | 'story_conflicts' | 'smart_continue' | 'show_dont_tell' | 'voice_analysis' | 'style_analysis' | 'style_rhythm' | 'style_repetition' | 'style_weak' | 'style_show' | 'hero_journey' | 'character_arc' | 'scene_triggers' | 'plot_points' | 'central_conflict' | 'subplots' | 'cliffhangers' | 'text_music_analysis' | 'narrative_speed' | 'sentence_breathing' | 'emotional_intensity' | 'tension_peaks' | 'scene_objective' | 'scene_conflict' | 'scene_obstacle' | 'scene_twist' | 'scene_emotion' | 'scene_exit' | 'cover_description',
    inputData: string,
    extraParam?: string
): Promise<string> => {
    const ai = getClient();
    if (!ai) return "Erro: Chave de API não configurada.";

    let prompt = "";

    switch (task) {
        case 'next_paragraph':
            prompt = `Com base no texto a seguir, escreva o próximo parágrafo mantendo o estilo, tom e voz narrativa. Texto: "${inputData.slice(-3000)}"`;
            break;
        case 'expand':
            prompt = `Expanda o seguinte trecho de texto. Adicione detalhes sensoriais, aprofunde a descrição do ambiente e das emoções, mantendo o sentido original, mas tornando-o mais literário e imersivo: "${inputData}"`;
            break;
        case 'summarize':
            prompt = `Resuma o seguinte texto em um único parágrafo conciso e objetivo, capturando os pontos principais: "${inputData}"`;
            break;
        case 'rewrite':
            prompt = `Reescreva o seguinte texto alterando o tom para: ${extraParam || 'mais dramático'}. Mantenha a ideia central, mas adapte o vocabulário e a construção frasal. Texto: "${inputData}"`;
            break;
        case 'synopsis':
            prompt = `Crie uma sinopse comercial e atraente para um livro baseado nas seguintes premissas/notas: "${inputData}". A sinopse deve apresentar o protagonista, o conflito central e ter um gancho forte.`;
            break;
        case 'titles':
            prompt = `Gere 10 sugestões de títulos criativos, comerciais e literários para uma história sobre: "${inputData}". Explique brevemente o porquê de cada título.`;
            break;
        case 'character':
            prompt = `Crie uma ficha detalhada de personagem (Nome, Idade, Aparência Física, Personalidade, Motivação, Medo, Segredo) baseada nestas notas: "${inputData}".`;
            break;
        case 'chapters':
            prompt = `Crie uma estrutura de capítulos (Outline) detalhada para uma história sobre: "${inputData}". Liste capitulo por capitulo com uma breve descrição do que acontece em cada um (Arco Narrativo).`;
            break;
        case 'template':
            prompt = `Gere um esboço estrutural vazio mas guiado e detalhado baseado no modelo narrativo: "${extraParam}". Para cada etapa do modelo, forneça uma explicação do que deve ser escrito e deixe um espaço para o autor preencher.`;
            break;
        
        // Narrative Map prompts
        case 'story_map':
            prompt = `Atue como um analista literário. Com base no texto completo fornecido, crie um "Mapa de História" (Timeline) estruturado.
            1. Crie uma linha do tempo cronológica dos eventos principais apresentados.
            2. Analise os arcos dramáticos atuais (Início, Meio, Fim).
            3. Avalie o ritmo (pacing) da narrativa (onde está lento, onde está rápido).
            Texto: "${inputData.slice(0, 30000)}"`;
            break;
        case 'story_connections':
            prompt = `Analise o texto e mapeie as conexões profundas da história.
            1. Conexões entre Eventos: Mostre causa e consequência (Evento A causou Evento B).
            2. Conexões entre Personagens: Como eles se relacionam e influenciam uns aos outros.
            3. Identifique "Pontas Soltas" ou elementos introduzidos que precisam de resolução.
            Texto: "${inputData.slice(0, 30000)}"`;
            break;
        case 'story_conflicts':
            prompt = `Analise o texto e foque exclusivamente nos conflitos.
            1. Liste os conflitos atuais (manifestos).
            2. Sugira 3 opções de Conflitos Internos para o protagonista baseados na sua personalidade.
            3. Sugira 3 opções de Conflitos Externos (antagonistas, ambiente, sociedade) que poderiam piorar a situação.
            Texto: "${inputData.slice(0, 30000)}"`;
            break;
            
        // Smart Editing prompts
        case 'smart_continue':
            prompt = `Você é o próprio autor escrevendo. Continue o texto a partir do ponto exato onde parou, completando a frase se necessário e adicionando cerca de 100-150 palavras que fluam organicamente. Não repita o texto anterior.
            Contexto: "${inputData.slice(-2000)}"`;
            break;
        case 'show_dont_tell':
            prompt = `Reescreva o trecho abaixo aplicando rigorosamente a técnica "Show, Don't Tell" (Mostrar, não contar).
            Em vez de adjetivos abstratos ou descrições expositivas de emoções (ex: "ele estava triste"), use ações físicas, detalhes sensoriais e linguagem corporal para evocar a cena.
            Trecho Original: "${inputData}"`;
            break;
        case 'voice_analysis':
            prompt = `Faça uma análise técnica da Voz Narrativa no texto fornecido.
            Analise e comente sobre:
            1. A Consistência do tom (Formal, coloquial, lírico, seco?).
            2. A Perspectiva (1ª, 3ª limitada, 3ª onisciente) e se há quebras de foco.
            3. O "Distanciamento Psíquico" (Estamos muito perto ou muito longe dos pensamentos do personagem?).
            4. Sugestões para tornar a voz mais única e marcante.
            Texto: "${inputData.slice(0, 5000)}"`;
            break;

        // Style Assistant prompts
        case 'style_analysis':
            prompt = `Atue como um crítico literário e faça uma "Análise de Estilo" profunda do autor deste texto.
            Identifique:
            1. **Impressão Digital**: Qual é a marca registrada deste texto? (Ex: Uso de metáforas complexas, diálogos rápidos, descrições densas).
            2. **Vocabulário**: Analise a riqueza lexical. É repetitiva? É arcaica? É moderna?
            3. **Vícios**: Existem padrões que empobrecem o texto? (Ex: excesso de adjetivos, frases muito longas).
            4. **Comparação**: Se possível, compare o estilo com autores consagrados para referência.
            Texto: "${inputData.slice(0, 10000)}"`;
            break;
        case 'style_rhythm':
            prompt = `Analise exclusivamente o **Ritmo e a Cadência** do texto abaixo.
            1. Identifique parágrafos onde a leitura "engasga" ou se torna monótona.
            2. Analise a variação do tamanho das frases (o autor intercala frases curtas e longas para criar dinamismo?).
            3. Aponte cacofonias ou aliterações acidentais que quebram a imersão.
            4. Sugira como melhorar a musicalidade da prosa neste trecho.
            Texto: "${inputData.slice(0, 5000)}"`;
            break;
        case 'style_repetition':
            prompt = `Faça uma varredura no texto buscando **Repetições de Palavras e Ecos**.
            Não liste conectivos comuns (o, a, de, que) a menos que usados excessivamente.
            Foque em substantivos, adjetivos e verbos que aparecem muito próximos uns dos outros.
            Para cada repetição encontrada, cite o trecho e sugira um sinônimo ou uma reestruturação da frase.
            Texto: "${inputData.slice(0, 5000)}"`;
            break;
        case 'style_weak':
            prompt = `Identifique **Frases Fracas e Passivas** no texto.
            Procure por:
            1. Excesso de voz passiva.
            2. Uso excessivo de verbos de ligação (ser/estar) em vez de verbos de ação.
            3. Advérbios terminados em "-mente" que poderiam ser cortados.
            4. Clichês e lugares-comuns.
            Liste os exemplos encontrados e ofereça uma reescrita mais forte e ativa para cada um.
            Texto: "${inputData.slice(0, 5000)}"`;
            break;
        case 'style_show':
            prompt = `Analise o texto abaixo buscando oportunidades de "Show, Don't Tell" (Mostrar vs Dizer).
            Identifique trechos onde o autor está apenas informando uma emoção ou estado (Ex: "Ele estava com raiva") e sugira como reescrever isso mostrando a ação (Ex: "Ele cerrou os punhos até os nós dos dedos ficarem brancos").
            Texto: "${inputData.slice(0, 5000)}"`;
            break;

        // New Narrative Tools Prompts
        case 'hero_journey':
            prompt = `Analise o texto atual sob a ótica da **Jornada do Herói** (Joseph Campbell).
            1. Em qual estágio da jornada o protagonista parece estar neste trecho?
            2. Quais elementos arquetípicos estão presentes ou faltando?
            3. Sugira como conduzir a história para a próxima etapa da Jornada de forma natural.
            Texto: "${inputData.slice(0, 20000)}"`;
            break;
        case 'character_arc':
            prompt = `Analise o **Arco do Personagem Principal** com base no texto fornecido.
            1. Defina o estado inicial do personagem (sua "Mentira" ou falha trágica).
            2. Identifique sinais de mudança ou resistência à mudança neste trecho.
            3. Sugira situações que forcem o personagem a confrontar seus medos.
            Texto: "${inputData.slice(0, 20000)}"`;
            break;
        case 'scene_triggers':
            prompt = `Analise os **Gatilhos de Cena e Transições** no texto.
            1. Identifique como as cenas começam e terminam (Entradas e Saídas). Elas são fortes?
            2. Existem "Ganchos" ao final das cenas que obrigam o leitor a continuar?
            3. Sugira gatilhos de ação mais fortes para iniciar as próximas cenas.
            Texto: "${inputData.slice(0, 20000)}"`;
            break;
        case 'plot_points':
            prompt = `Identifique os **Pontos de Virada Automáticos** (Plot Points) no texto, se houver.
            Se não houver pontos de virada claros, sugira onde eles poderiam ser inseridos para aumentar a tensão.
            Considere a estrutura de 3 Atos:
            - Incidente Incitante
            - Ponto de Virada 1
            - Ponto Médio (Midpoint)
            - Ponto de Virada 2
            Texto: "${inputData.slice(0, 20000)}"`;
            break;
        case 'central_conflict':
            prompt = `Identifique e analise o **Conflito Central** da história com base neste texto.
            1. Qual é a força antagônica principal?
            2. O que está em jogo (Stakes)? São altos o suficiente?
            3. Sugira maneiras de elevar o risco e tornar o conflito mais pessoal para o protagonista.
            Texto: "${inputData.slice(0, 20000)}"`;
            break;
        case 'subplots':
            prompt = `Com base nos personagens secundários e pontas soltas apresentadas no texto, sugira 3 **Subtramas Possíveis** que enriqueceriam a história.
            Para cada subtrama, explique como ela se conecta ou reflete o tema principal da obra.
            Texto: "${inputData.slice(0, 20000)}"`;
            break;
        case 'cliffhangers':
            prompt = `Analise o final do texto fornecido e sugira 3 opções de **Ganchos e Cliffhangers** poderosos para encerrar este capítulo/trecho, deixando o leitor desesperado para ler a continuação.
            Texto: "${inputData.slice(-5000)}"`;
            break;
            
        // Text Music Prompts
        case 'text_music_analysis':
            prompt = `Atue como um maestro literário e realize uma **Análise Profunda da Música do Texto**.
            1. **Sonoridade**: Avalie a eufonia geral. O texto flui suavemente ou é propositalmente áspero?
            2. **Aliterações e Assonâncias**: Identifique padrões sonoros (repetições de consoantes ou vogais) que criam musicalidade.
            3. **Ritmo**: O texto tem um ritmo hipnótico, staccato, ou irregular?
            4. **Sugestão**: Como o autor pode melhorar a "acústica" da leitura mental deste trecho?
            Texto: "${inputData.slice(0, 10000)}"`;
            break;
        case 'narrative_speed':
            prompt = `Analise a **Velocidade Narrativa** deste trecho.
            1. Identifique passagens "Rápidas" (muita ação, diálogo curto, pouca adjetivação).
            2. Identifique passagens "Lentas" (descrição densa, introspecção, explicação).
            3. **Equilíbrio**: A alternância entre rápido e lento está engajante ou cansativa?
            4. **Sugestão**: Indique onde acelerar ou desacelerar para melhorar o impacto da cena.
            Texto: "${inputData.slice(0, 15000)}"`;
            break;
        case 'sentence_breathing':
            prompt = `Analise a **Respiração das Frases** e a pontuação.
            1. **Comprimento das Frases**: O autor varia entre frases curtas, médias e longas? (A falta de variedade cria monotonia).
            2. **Pontuação**: O uso de vírgulas e pontos finais dita um ritmo de leitura confortável? O leitor fica "sem ar" em algum momento?
            3. **Parágrafos**: A estrutura visual dos parágrafos convida à leitura?
            Texto: "${inputData.slice(0, 10000)}"`;
            break;
        case 'emotional_intensity':
            prompt = `Mapeie a **Intensidade Emocional** do texto.
            1. Qual é a emoção predominante neste trecho?
            2. Identifique frases ou palavras específicas que carregam a maior carga emocional (palavras-gatilho).
            3. O texto evoca a emoção de forma visceral ou distante?
            4. Sugira como intensificar a conexão emocional com o leitor.
            Texto: "${inputData.slice(0, 15000)}"`;
            break;
        case 'tension_peaks':
            prompt = `Analise os **Picos e Vales de Tensão** (Tension Map).
            1. Identifique o momento de maior tensão (Clímax da cena) neste trecho.
            2. Identifique os momentos de relaxamento ou alívio cômico.
            3. A curva de tensão é ascendente? Se for plana, sugira como introduzir micro-tensões ou obstáculos.
            Texto: "${inputData.slice(0, 20000)}"`;
            break;

        // NEW: Smart Scene Prompts
        case 'scene_objective':
            prompt = `Analise a cena fornecida e foque no **Objetivo do Personagem**.
            1. O que o protagonista quer *nesta cena específica*? (Se não estiver claro, isso é um problema).
            2. O objetivo é tangível ou abstrato?
            3. Sugira como tornar o objetivo mais urgente ou vital.
            Texto: "${inputData.slice(0, 10000)}"`;
            break;
        case 'scene_conflict':
            prompt = `Analise o **Conflito Imediato** da cena.
            1. Quem ou o que está impedindo o protagonista de conseguir o que quer AGORA?
            2. O conflito é direto (embate) ou indireto (ambiente, dúvida interna)?
            3. Sugira formas de aumentar o atrito entre a vontade do protagonista e a força antagonista da cena.
            Texto: "${inputData.slice(0, 10000)}"`;
            break;
        case 'scene_obstacle':
            prompt = `Identifique ou sugira **Obstáculos** para esta cena.
            Com base no contexto, sugira 3 obstáculos (físicos, sociais ou internos) que poderiam surgir repentinamente para dificultar a vida do personagem neste momento.
            Texto: "${inputData.slice(0, 10000)}"`;
            break;
        case 'scene_twist':
            prompt = `Atue como um roteirista e sugira uma **Reviravolta (Twist)** para esta cena.
            Analise o que o leitor espera que aconteça e sugira algo diferente que surpreenda, mas faça sentido. Pode ser uma revelação, uma traição ou uma coincidência trágica.
            Texto: "${inputData.slice(0, 10000)}"`;
            break;
        case 'scene_emotion':
            prompt = `Analise o **Valor Emocional (Scene Charge)**.
            1. A cena começa com carga Positiva (+) ou Negativa (-)?
            2. Ela termina com a mesma carga ou houve mudança? (Cenas boas geralmente invertem a carga).
            3. Se a cena for "reta" (começa feliz, termina feliz), sugira um evento que altere o humor para o polo oposto.
            Texto: "${inputData.slice(0, 10000)}"`;
            break;
        case 'scene_exit':
            prompt = `Analise o desfecho desta cena e sugira uma **Saída de Cena (Scene Exit)** poderosa.
            1. Como terminar esta cena de forma que o leitor *precise* ler a próxima?
            2. Sugira uma frase final de impacto ou uma ação suspensa (cliffhanger menor).
            Texto: "${inputData.slice(0, 10000)}"`;
            break;
            
        // Cover Description Prompt (Automatic Generation)
        case 'cover_description':
            prompt = `Atue como um diretor de arte. Analise o texto completo e crie um Prompt Visual detalhado (em Inglês) para gerar uma capa de livro que capture perfeitamente a essência da história.
            Descreva:
            1. O Assunto Central (personagem principal ou elemento simbólico).
            2. O Cenário/Ambiente.
            3. O Estilo Artístico sugerido (ex: cinematic, dark fantasy, minimalist).
            4. A Iluminação e Paleta de Cores.
            Retorne APENAS o prompt descritivo em inglês, sem introduções.
            Texto para análise: "${inputData.slice(0, 30000)}"`;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.85 // Higher creativity
            }
        });
        return response.text || "Não foi possível gerar o conteúdo criativo.";
    } catch (error) {
        return "Erro ao conectar com a IA Criativa.";
    }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        // Using gemini-2.5-flash-image as default for image generation tasks
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            }
        });
        
        // Iterate through parts to find the image data
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
};