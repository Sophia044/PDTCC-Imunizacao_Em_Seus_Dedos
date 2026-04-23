# 💉 VacinApp — Imunização em Seus Dedos

Aplicativo mobile desenvolvido como Trabalho de Conclusão de Curso (TCC) da ETEC,
com o objetivo de digitalizar e centralizar o histórico vacinal dos usuários.

---

## 📋 Sobre o Projeto

Muitas pessoas não sabem quais vacinas já tomaram ou onde está sua carteira de
vacinação física. O VacinApp resolve esse problema oferecendo:

- 📱 Histórico vacinal digital sempre disponível no celular
- 🗓️ Calendário de vacinação com alertas de doses pendentes e atrasadas
- 🗺️ Mapa de postos de vacinação próximos (SUS e clínicas particulares)
- 📰 Notícias e atualizações sobre vacinação e saúde
- 👩‍⚕️ Painel exclusivo para profissionais de saúde registrarem vacinações

O app funciona como **complemento** à carteira física — não como substituto.

---

## 👥 Perfis de Acesso

| Perfil | Cor de Identidade | Funcionalidades |
|---|---|---|
| **Paciente** | Roxo (#685895) | Ver histórico, calendário, mapa, notícias e perfil |
| **Profissional** | Verde (#588C5A) | Registrar vacinas, gerenciar pacientes, configurações |

---

## 🛠️ Tecnologias Utilizadas

**Front-end (Mobile)**
- [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/) — tipagem estática
- [Expo Router](https://expo.github.io/router) — navegação baseada em arquivos
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) — animações
- [react-native-maps](https://github.com/react-native-maps/react-native-maps) — mapa interativo
- [react-native-calendars](https://github.com/wix/react-native-calendars) — calendário
- [@gorhom/bottom-sheet](https://gorhom.github.io/react-native-bottom-sheet/) — painel deslizante
- [expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) — gradientes

**Back-end** *(a ser integrado)*
- Python — API REST para autenticação e gerenciamento de dados

---

## 📁 Estrutura de Pastas

```
VacinApp/
├── app/
│   ├── (auth)/               # Telas de autenticação (login e cadastros)
│   │   ├── login.tsx
│   │   ├── register-patient.tsx
│   │   └── register-professional.tsx
│   ├── (patient)/            # Telas exclusivas do paciente
│   │   ├── home.tsx          # Dashboard principal
│   │   ├── calendar.tsx      # Calendário vacinal
│   │   ├── map.tsx           # Mapa de postos de vacinação
│   │   └── profile.tsx       # Perfil e configurações
│   ├── (professional)/       # Telas exclusivas do profissional
│   │   ├── home.tsx          # Dashboard do profissional
│   │   ├── patients.tsx      # Lista de pacientes
│   │   ├── register-vaccine.tsx  # Registrar nova vacinação
│   │   └── settings.tsx      # Configurações e logout
│   ├── index.tsx             # Splash screen
│   └── _layout.tsx           # Layout raiz com navegação
├── components/               # Componentes reutilizáveis
│   ├── VaccineCard.tsx
│   ├── StatusBadge.tsx
│   ├── PrimaryButton.tsx
│   ├── InputField.tsx
│   └── HealthUnitCard.tsx
├── constants/                # Cores, fontes e constantes globais
│   ├── Colors.ts
│   └── MockData.ts
├── assets/                   # Imagens e ícones
└── README.md
```

---

## 🚀 Como Iniciar o Projeto

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) — versão 18 ou superior
- [Git](https://git-scm.com/)
- Aplicativo **Expo Go** no seu celular
  - [Android — Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iOS — App Store](https://apps.apple.com/app/expo-go/id982107779)

---

### Passo a Passo

**1. Clone o repositório**
```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO
```

**2. Instale as dependências**
```bash
npm install
```

**3. Inicie o servidor de desenvolvimento**
```bash
npx expo start
```

**4. Abra no celular**

Após executar o comando acima, um QR Code aparecerá no terminal.
Abra o aplicativo **Expo Go** no celular e escaneie o QR Code.
O app será carregado automaticamente no seu dispositivo.

**5. Alternativas para rodar o app**

| Comando | Descrição |
|---|---|
| `npx expo start` | Inicia o servidor (recomendado) |
| `npx expo start --android` | Abre direto no emulador Android |
| `npx expo start --ios` | Abre direto no simulador iOS (macOS) |
| `npx expo start --web` | Abre no navegador (versão web) |

---

### Solução de Problemas Comuns

**Erro: "Unable to resolve module"**
```bash
npm install
npx expo start --clear
```

**App não carrega no celular**
- Certifique-se de que o celular e o computador estão na mesma rede Wi-Fi
- Tente usar a opção "Tunnel" no menu do Expo (tecle `t` no terminal)

**Cache desatualizado**
```bash
npx expo start --clear
```

---

## 🎨 Paleta de Cores

| Nome | Hex | Uso |
|---|---|---|
| Roxo Principal | `#685895` | Cor primária — botões e cabeçalhos do paciente |
| Roxo Claro | `#988EC4` | Hover e destaques |
| Lilás Suave | `#E8E8F7` | Fundos e áreas neutras |
| Verde Profissional | `#588C5A` | Identidade visual do médico |
| Verde Claro | `#A8D5A2` | Status e confirmações |

---

## 📌 Status do Projeto

🚧 Em desenvolvimento — TCC ETEC 2026

---

## 👩‍💻 Autora

Desenvolvido por **Sophia Lorena** como TCC do curso técnico na ETEC.
