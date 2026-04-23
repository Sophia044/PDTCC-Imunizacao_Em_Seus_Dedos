// ============================================================
// CONSTANTES: Paleta de Cores do VacinApp
// DESCRIÇÃO: Define todas as cores usadas no projeto.
//            Centralizar as cores aqui garante consistência
//            visual em toda a aplicação e facilita mudanças futuras.
// ============================================================

// -------------------------------------------------------
// PALETA DE CORES OFICIAL DO VACINAPP
// -------------------------------------------------------
export const Colors = {
  // === CORES DO PACIENTE (Identidade Roxa) ===
  PRIMARY:   '#685895', // Roxo principal — botões, cabeçalhos e destaques do paciente
  SECONDARY: '#988EC4', // Roxo secundário — hovers, links e elementos de suporte

  // === FUNDO GLOBAL ===
  BACKGROUND: '#E8E8F7', // Lilás suave — fundo de todas as telas

  // === CORES DO PROFISSIONAL (Identidade Verde) ===
  PROFESSIONAL: '#588C5A', // Verde principal — identidade visual do profissional de saúde
  LIGHT_GREEN:  '#A8D5A2', // Verde claro — confirmações, badges e destaques do profissional

  // === CORES DE STATUS DAS VACINAS ===
  STATUS: {
    COMPLETE: '#588C5A', // Verde — vacina tomada / em dia
    PENDING:  '#E8A838', // Laranja — vacina agendada / pendente
    OVERDUE:  '#D9534F', // Vermelho — vacina atrasada / vencida
  },

  // === CORES NEUTRAS (usadas em textos e fundos) ===
  NEUTRAL: {
    WHITE:     '#FFFFFF', // Branco — fundo de cards e áreas de conteúdo
    DARK_TEXT: '#2D2D2D', // Cinza escuro — texto principal
    MUTED:     '#7A7A9D', // Cinza-roxo — texto secundário, placeholders e ícones inativos
  },

  // === CORES DERIVADAS (tons intermediários) ===
  PRIMARY_LIGHT:      '#F0EDF8', // Roxo muito suave — fundo de badges e chips do paciente
  PROFESSIONAL_LIGHT: '#EDF5ED', // Verde muito suave — fundo de cards do profissional
  CARD_BG:            '#F5F5FF', // Fundo levemente azulado — campos de formulário
  BORDER:             '#E0DEEF', // Lilás suave — bordas de cards e divisórias
};
