// ============================================================
// TELA: Assistente Virtual (IA Local)
// DESCRIÇÃO: Permite que o paciente faça perguntas sobre vacinação
//            e receba respostas geradas pelo modelo de IA (Qwen2.5:14b)
//            rodando localmente via Ollama no servidor do backend.
//            Esta funcionalidade foi desenvolvida como parte do TCC
//            "Imunização em Seus Dedos" — ETEC.
// ACESSO: Paciente
// ROTA: /app/(patient)/assistant.tsx
// ============================================================

// --- Bibliotecas principais do React ---
import React, { useRef, useState } from 'react';

// --- Componentes de layout e interação do React Native ---
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// --- Animações com Reanimated ---
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// --- Área segura (evita sobreposição com status bar e notch) ---
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Controle da barra de status do sistema operacional ---
import { StatusBar } from 'expo-status-bar';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../../constants/Colors';

// --- Componente de botão reutilizável do projeto ---
import { PrimaryButton } from '../../components/PrimaryButton';

// --- Serviço de IA: chama o endpoint /ai/ask do backend ---
import { askAI } from '../../services/api/aiAssistant';

// --- Tratamento de erros da camada de API ---
import { ApiError } from '../../services/api/client';

// -------------------------------------------------------
// Tipo local: representa uma mensagem no histórico do chat
// -------------------------------------------------------
type Message = {
  id: number;          // Identificador único da mensagem
  role: 'user' | 'ai'; // Quem enviou a mensagem
  text: string;        // Conteúdo da mensagem
  baseadoEmDocumentos?: boolean; // Se a resposta usou documentos oficiais
  fontes?: string[];             // Documentos oficiais consultados
};

// Sugestões de perguntas exibidas ao abrir a tela pela primeira vez
const SUGGESTED_QUESTIONS = [
  'Quais vacinas preciso tomar com 30 anos?',
  'O que fazer se eu perder meu cartão de vacinação?',
  'Quais são os efeitos colaterais da vacina da gripe?',
  'Vacinas do calendário infantil básico',
];

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Assistente Virtual
// -------------------------------------------------------
export default function AssistantScreen() {
  // Estado da lista de mensagens do histórico (usuário + IA)
  const [messages, setMessages] = useState<Message[]>([]);

  // Estado do campo de texto onde o usuário digita a pergunta
  const [inputText, setInputText] = useState('');

  // Estado de carregamento: true enquanto aguarda resposta da IA
  const [isLoading, setIsLoading] = useState(false);

  // Referência ao ScrollView para rolar automaticamente para o fim
  const scrollViewRef = useRef<ScrollView>(null);

  // Contador para gerar IDs únicos das mensagens
  const messageIdRef = useRef(0);

  // -------------------------------------------------------
  // Função para adicionar uma nova mensagem ao histórico
  // -------------------------------------------------------
  function addMessage(
    role: 'user' | 'ai',
    text: string,
    meta?: { baseadoEmDocumentos?: boolean; fontes?: string[] }
  ) {
    messageIdRef.current += 1;
    setMessages(prev => [
      ...prev,
      {
        id: messageIdRef.current,
        role,
        text,
        baseadoEmDocumentos: meta?.baseadoEmDocumentos,
        fontes: meta?.fontes,
      },
    ]);
    // Aguarda o re-render e rola o scroll para o final
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }

  // -------------------------------------------------------
  // Função principal: envia a pergunta para o backend
  // -------------------------------------------------------
  async function handleSend(question?: string) {
    // Usa o texto fornecido (sugestão) ou o que está no campo de input
    const text = (question ?? inputText).trim();
    if (!text || isLoading) return;

    // Adiciona a mensagem do usuário ao histórico e limpa o input
    addMessage('user', text);
    setInputText('');
    setIsLoading(true);

    try {
      // Chama o serviço de IA — faz POST /ai/ask no backend,
      // que executa RAG no ChromaDB e chama o Ollama
      const response = await askAI(text);
      addMessage('ai', response.answer, {
        baseadoEmDocumentos: response.baseado_em_documentos,
        fontes: response.fontes,
      });

    } catch (error) {
      // Trata erros de rede ou respostas de erro do backend
      const message =
        error instanceof ApiError
          ? error.message // Mensagem amigável já formatada pelo client.ts
          : 'Não foi possível conectar ao assistente. Verifique sua conexão.';

      // Exibe o erro como uma "mensagem" da IA no chat, em vez de um popup,
      // para manter a fluidez da conversa
      addMessage('ai', `⚠️ ${message}`);
    } finally {
      // Garante que o loading seja desativado independente de sucesso ou erro
      setIsLoading(false);
    }
  }

  // -------------------------------------------------------
  // RENDERIZAÇÃO
  // -------------------------------------------------------
  return (
    // SafeAreaView garante que o conteúdo não fique atrás do notch/status bar
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Barra de status com ícones claros (fundo roxo) */}
      <StatusBar style="light" />

      {/* KeyboardAvoidingView empurra o conteúdo para cima ao abrir o teclado */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >

        {/* ---- HEADER ROXO: Título da tela ---- */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Assistente Virtual 🤖</Text>
            <Text style={styles.headerSubtitle}>Tire suas dúvidas sobre vacinação</Text>
          </View>
          {/* Ícone decorativo do assistente */}
          <View style={styles.headerIcon}>
            <Ionicons name="chatbubble-ellipses" size={24} color={Colors.PRIMARY} />
          </View>
        </Animated.View>

        {/* ---- ÁREA DE MENSAGENS: Histórico do chat ---- */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesArea}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Estado inicial: exibe sugestões de perguntas */}
          {messages.length === 0 && !isLoading && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.SECONDARY} />
              <Text style={styles.emptyTitle}>Como posso ajudar?</Text>
              <Text style={styles.emptySubtitle}>
                Faça uma pergunta sobre vacinação ou escolha uma sugestão abaixo:
              </Text>

              {/* Chips de sugestão — ao tocar, preenchem o campo e enviam */}
              <View style={styles.suggestionsContainer}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionChip}
                    onPress={() => handleSend(q)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Lista de mensagens do histórico */}
          {messages.map((msg, index) => (
            <Animated.View
              key={msg.id}
              entering={FadeInDown.delay(index === messages.length - 1 ? 0 : 0).duration(300)}
              style={[
                styles.messageBubble,
                // Mensagens do usuário ficam à direita, da IA à esquerda
                msg.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {/* Ícone da IA exibido apenas nas mensagens dela */}
              {msg.role === 'ai' && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="chatbubble-ellipses" size={14} color={Colors.NEUTRAL.WHITE} />
                </View>
              )}
              <View style={[
                styles.bubbleContent,
                msg.role === 'user' ? styles.userBubbleContent : styles.aiBubbleContent,
              ]}>
                {/* Selo visual de procedência RAG (Documentos Oficiais vs Conhecimento Geral) */}
                {msg.role === 'ai' && msg.baseadoEmDocumentos !== undefined && (
                  <View style={[
                    styles.ragBadge,
                    msg.baseadoEmDocumentos ? styles.ragBadgeDoc : styles.ragBadgeGeneral
                  ]}>
                    <Ionicons
                      name={msg.baseadoEmDocumentos ? "shield-checkmark" : "information-circle-outline"}
                      size={13}
                      color={msg.baseadoEmDocumentos ? "#2E7D32" : "#E65100"}
                    />
                    <Text style={[
                      styles.ragBadgeText,
                      msg.baseadoEmDocumentos ? styles.ragBadgeTextDoc : styles.ragBadgeTextGeneral
                    ]}>
                      {msg.baseadoEmDocumentos
                        ? (msg.fontes && msg.fontes.length > 0
                            ? `Oficial: ${msg.fontes.join(', ')}`
                            : 'Documentos Oficiais (MS/SBIm)')
                        : 'Orientação Geral (sem docs específicos)'}
                    </Text>
                  </View>
                )}
                <Text style={[
                  styles.bubbleText,
                  msg.role === 'user' ? styles.userBubbleText : styles.aiBubbleText,
                ]}>
                  {msg.text}
                </Text>
              </View>
            </Animated.View>
          ))}

          {/* Indicador de carregamento enquanto a IA processa */}
          {isLoading && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.loadingBubble}>
              <View style={styles.aiAvatar}>
                <Ionicons name="chatbubble-ellipses" size={14} color={Colors.NEUTRAL.WHITE} />
              </View>
              <View style={[styles.bubbleContent, styles.aiBubbleContent, styles.loadingBubbleContent]}>
                <ActivityIndicator size="small" color={Colors.PRIMARY} />
                <Text style={styles.loadingText}>Pesquisando documentos e gerando resposta...</Text>
              </View>
            </Animated.View>
          )}

          {/* Espaço extra no final para não ficar colado no input */}
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* ---- ÁREA DE INPUT: Campo de texto + botão de envio ---- */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.inputArea}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua dúvida sobre vacinação..."
            placeholderTextColor={Colors.NEUTRAL.MUTED}
            multiline                          // Permite múltiplas linhas conforme o texto cresce
            maxLength={500}                    // Limite razoável para evitar prompts muito longos
            returnKeyType="default"
            editable={!isLoading}             // Desabilita durante o carregamento
          />
          {/* Botão de envio — ícone de avião de papel */}
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send"
              size={20}
              color={!inputText.trim() || isLoading ? Colors.NEUTRAL.MUTED : Colors.NEUTRAL.WHITE}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Informação de rodapé sobre o modelo de IA utilizado */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by {/* Nome do modelo configurado no backend */}
            <Text style={styles.footerHighlight}>Qwen2.5:14b</Text> via Ollama · Apenas para fins educativos
          </Text>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// ESTILOS DA TELA
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === CONTAINERS PRINCIPAIS ===
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND },
  flex: { flex: 1 },

  // === CABEÇALHO ROXO (padrão das outras telas do paciente) ===
  header: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.NEUTRAL.WHITE },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.NEUTRAL.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // === ÁREA DE MENSAGENS ===
  messagesArea: { flex: 1, backgroundColor: Colors.BACKGROUND },
  messagesContent: { paddingHorizontal: 16, paddingTop: 20 },

  // === ESTADO INICIAL (sem mensagens) ===
  emptyState: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: Colors.NEUTRAL.MUTED, textAlign: 'center', marginTop: 6, marginBottom: 20 },

  // === CHIPS DE SUGESTÃO ===
  suggestionsContainer: { width: '100%', gap: 8 },
  suggestionChip: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
    // Sombra sutil para dar profundidade
    shadowColor: Colors.PRIMARY,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionText: { fontSize: 13, color: Colors.NEUTRAL.DARK_TEXT, fontWeight: '500' },

  // === BOLHAS DE MENSAGEM ===
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  userBubble: { justifyContent: 'flex-end' },   // Alinha o balão do usuário à direita
  aiBubble: { justifyContent: 'flex-start' }, // Alinha o balão da IA à esquerda

  // Avatar da IA (ícone roxo circular)
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
  },

  // Conteúdo interno da bolha
  bubbleContent: {
    maxWidth: '80%', // Limita a largura para manter legibilidade
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubbleContent: {
    backgroundColor: Colors.PRIMARY,     // Roxo para mensagens do usuário
    borderBottomRightRadius: 4,          // Detalhe visual: canto cortado no lado da seta
  },
  aiBubbleContent: {
    backgroundColor: Colors.NEUTRAL.WHITE, // Branco para mensagens da IA
    borderBottomLeftRadius: 4,
    shadowColor: Colors.PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingBubbleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // === SELOS VISUAIS RAG (Origem da informação) ===
  ragBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  ragBadgeDoc: {
    backgroundColor: '#E8F5E9', // Verde suave para documentos oficiais
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  ragBadgeGeneral: {
    backgroundColor: '#FFF3E0', // Laranja suave para conhecimento geral
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  ragBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ragBadgeTextDoc: {
    color: '#2E7D32',
  },
  ragBadgeTextGeneral: {
    color: '#E65100',
  },

  bubbleText: { fontSize: 14, lineHeight: 20 },
  userBubbleText: { color: Colors.NEUTRAL.WHITE },
  aiBubbleText: { color: Colors.NEUTRAL.DARK_TEXT },

  // === INDICADOR DE CARREGAMENTO ===
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  loadingText: { fontSize: 13, color: Colors.NEUTRAL.MUTED, marginLeft: 6 },

  // === ÁREA DE INPUT (campo de texto + botão de envio) ===
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.CARD_BG,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: Colors.NEUTRAL.DARK_TEXT,
    maxHeight: 120, // Limita a altura máxima do campo multiline
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  sendButtonDisabled: { backgroundColor: Colors.BORDER },

  // === RODAPÉ INFORMATIVO ===
  footer: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    paddingBottom: 12,
    alignItems: 'center',
  },
  footerText: { fontSize: 11, color: Colors.NEUTRAL.MUTED },
  footerHighlight: { color: Colors.SECONDARY, fontWeight: '600' },
});
