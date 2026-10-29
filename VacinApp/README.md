# 📱 VacinApp — Frontend Mobile (React Native / Expo)

Aplicativo mobile do sistema **VacinApp — Imunização em Seus Dedos**, desenvolvido em **React Native** com **Expo SDK 54** e **TypeScript**.

---

## 🚀 Como Executar o App

### 1. Instalar as dependências
```bash
npm install
```

### 2. Configurar a URL da API (Opcional se rodando local)
Se for testar em um celular físico via Wi-Fi ou Tailscale, crie um arquivo `.env` dentro de `VacinApp/`:
```env
EXPO_PUBLIC_API_URL=http://100.71.111.117:8000
```
*(Substitua pelo IP do computador na rede local ou pelo IP do Tailscale)*

### 3. Iniciar o servidor Metro / Expo
```bash
npx expo start
```
Ou:
```bash
npm start
```

### 4. Abrir no dispositivo
- **Android / iOS:** Baixe o app **Expo Go** e escaneie o QR Code exibido no terminal.
- **Web:** Pressione `w` no terminal para abrir no navegador.
- **Android Emulator:** Pressione `a` com o emulador aberto.

---

## 🧭 Estrutura de Telas e Navegação

O projeto utiliza **Expo Router** (navegação orientada a arquivos):

```
app/
├── (auth)/                    # Fluxo de Login e Registro
│   ├── login.tsx              # Seleção de tipo de perfil (Paciente / Profissional / Unidade)
│   ├── login-user.tsx         # Login com CPF
│   ├── login-professional.tsx # Login com Email/Registro (CRM/COREN)
│   ├── login-unit.tsx         # Login da Unidade com CNES
│   ├── register-sus.tsx       # Cadastro de Paciente SUS
│   └── register-private.tsx   # Cadastro de Paciente Convênio/Particular
│
├── (patient)/                 # Área do Paciente
│   ├── _layout.tsx            # Navegação inferior por abas
│   ├── home.tsx               # Status de vacinas, lembretes e notícias
│   ├── assistant.tsx          # 🤖 Assistente Virtual de Vacinação (IA Integrada)
│   ├── calendar.tsx           # Calendário por faixas etárias
│   ├── map.tsx                # Postos de vacinação próximos no mapa
│   └── profile.tsx            # Carteira de vacinação digital
│
├── (professional)/            # Área do Profissional de Saúde
│   ├── home.tsx               # Painel de atendimento e estatísticas
│   ├── search-patient.tsx     # Busca de pacientes por CPF/CNS
│   ├── patient-profile.tsx    # Carteira completa do paciente selecionado
│   └── register-vaccine.tsx   # Formulário de aplicação de vacina
│
└── (unit)/                    # Área da Unidade de Saúde
    └── triage.tsx             # Fila de atendimento e triagem
```

---

## 🤖 Tela do Assistente Virtual de Imunização (`assistant.tsx`)

A tela do Assistente IA está disponível na aba do paciente e oferece:
- Interface de chat moderna com histórico de mensagens.
- Chips de sugestões com dúvidas frequentes sobre vacinação no Brasil.
- Feedback visual de digitação enquanto o modelo de IA processa a resposta.
- Comunicação direta com o backend via endpoint protegido `POST /ai/ask`.
