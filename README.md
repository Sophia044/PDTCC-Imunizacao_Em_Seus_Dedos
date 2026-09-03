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
- 👩‍⚕️ Painel exclusivo para profissionais de saúde registrarem vacinações
- 🏥 Módulo de triagem para unidades de saúde (fila de vacinação com vacinas pendentes visíveis)

O app funciona como **complemento** à carteira física — não como substituto.

---

## 👥 Perfis de Acesso

| Perfil | Cor de Identidade | Funcionalidades |
|---|---|---|
| **Paciente** | Roxo `#685895` | Histórico, calendário, mapa de postos e perfil |
| **Profissional** | Verde `#588C5A` | Registrar vacinas, gerenciar pacientes, agenda (rede privada), configurações |
| **Unidade de Saúde** | Verde `#588C5A` | Triagem: identificar pacientes e organizar fila de vacinação |

---

## 🛠️ Tecnologias Utilizadas

### Front-end — Mobile (VacinApp/)

| Tecnologia | Versão | Finalidade |
|---|---|---|
| [React Native](https://reactnative.dev/) | 0.86.3 | Framework mobile |
| [Expo](https://expo.dev/) | SDK 57 | Toolchain e runtime |
| [TypeScript](https://www.typescriptlang.org/) | ~6.0.3 | Tipagem estática |
| [Expo Router](https://expo.github.io/router) | ~57.0.18 | Navegação baseada em arquivos |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | 4.5.1 | Animações fluidas |
| [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) | ~2.32.0 | Gestos e swipe |
| [React Native Screens](https://github.com/software-mansion/react-native-screens) | ~4.26.0 | Otimização de telas nativas |
| [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context) | ~5.7.0 | Notch / barras do sistema |
| [react-native-calendars](https://github.com/wix/react-native-calendars) | ^1.1310.0 | Calendário vacinal |
| [expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) | ~57.0.1 | Gradientes |
| [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) | ~57.0.15 | Geolocalização (mapa de postos) |
| [expo-font](https://docs.expo.dev/versions/latest/sdk/font/) | ~57.0.3 | Carregamento de fontes |
| [@expo/vector-icons](https://docs.expo.dev/guides/icons/) | ^15.1.1 | Ícones (Ionicons) |
| [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) | 2.2.0 | Persistência do token de sessão |
| React Context API (`AuthContext.tsx`) | — | Estado global de autenticação |

### Back-end (backend/)

| Tecnologia | Versão | Finalidade |
|---|---|---|
| [Python](https://www.python.org/) | 3.11 / 3.12 | Linguagem principal |
| [FastAPI](https://fastapi.tiangolo.com/) | 0.115.6 | Framework de API REST |
| [Uvicorn](https://www.uvicorn.org/) | 0.34.0 | Servidor ASGI |
| [SQLAlchemy](https://www.sqlalchemy.org/) | 2.0.36 | ORM (SQLite dev / MySQL prod) |
| [Pydantic](https://docs.pydantic.dev/) | 2.10.4 | Validação de dados |
| [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) | 2.7.1 | Configuração via `.env` |
| [python-jose](https://github.com/mpdavis/python-jose) | 3.3.0 | Tokens JWT |
| [bcrypt](https://pypi.org/project/bcrypt/) | 4.2.1 | Hash de senhas |
| [PyMySQL](https://pypi.org/project/PyMySQL/) | 1.1.1 | Driver MySQL (produção) |
| [email-validator](https://pypi.org/project/email-validator/) | 2.2.0 | Validação de e-mail |

---

## 📁 Estrutura de Pastas

```
PDTCC-Imunizacao_Em_Seus_Dedos/
├── README.md                        # Este arquivo
│
├── backend/                         # API REST (Python/FastAPI)
│   ├── app/
│   │   ├── main.py                  # Ponto de entrada — monta rotas e CORS
│   │   ├── config.py                # Configurações via .env
│   │   ├── database.py              # Conexão com o banco (SQLite/MySQL)
│   │   ├── models.py                # Tabelas do banco (SQLAlchemy ORM)
│   │   ├── schemas.py               # Formatos de entrada/saída (Pydantic)
│   │   ├── security.py              # Hash de senha (bcrypt) e tokens JWT
│   │   ├── deps.py                  # Dependências de autenticação por perfil
│   │   ├── utils.py                 # Funções auxiliares (datas, cálculos)
│   │   └── routers/
│   │       ├── auth.py              # Login e cadastro (paciente, profissional, unidade)
│   │       ├── patients.py          # Perfil, listagem e busca de pacientes
│   │       ├── professionals.py     # Perfil do profissional autenticado
│   │       ├── vaccines.py          # Catálogo de vacinas disponíveis
│   │       ├── vaccinations.py      # Registro de vacinação aplicada
│   │       ├── appointments.py      # Agenda (rede privada)
│   │       ├── health_units.py      # Unidades de saúde (mapa)
│   │       ├── queue.py             # Fila pública de vacinação (triagem)
│   │       ├── campaigns.py         # Campanhas vacinais ativas
│   │       └── stock.py             # Estoque de vacinas da unidade
│   ├── database/
│   │   └── schema.sql               # DDL de referência para MySQL
│   ├── seed.py                      # Popula o banco com dados de demonstração
│   ├── requirements.txt             # Dependências Python
│   └── .env.example                 # Modelo de configuração do backend
│
└── VacinApp/                        # Aplicativo mobile (React Native / Expo)
    ├── app/                         # Telas (Expo Router — cada arquivo é uma rota)
    │   ├── _layout.tsx              # Layout raiz (GestureHandlerRootView + AuthProvider)
    │   ├── index.tsx                # Splash screen + redirecionamento automático
    │   ├── (auth)/                  # Autenticação
    │   │   ├── login.tsx            # Escolha do tipo de acesso
    │   │   ├── login-user.tsx       # Login do paciente
    │   │   ├── login-professional.tsx # Login do profissional
    │   │   ├── login-unit.tsx       # Login da unidade de saúde
    │   │   ├── choose-registration.tsx # Escolha do tipo de cadastro
    │   │   ├── register-patient.tsx # Cadastro de paciente (genérico)
    │   │   ├── register-sus.tsx     # Cadastro de paciente SUS
    │   │   ├── register-private.tsx # Cadastro de paciente convênio
    │   │   └── register-professional.tsx # Cadastro de profissional
    │   ├── (patient)/               # Área do paciente
    │   │   ├── home.tsx             # Dashboard principal
    │   │   ├── calendar.tsx         # Calendário vacinal interativo
    │   │   ├── map.tsx              # Mapa de postos de vacinação
    │   │   └── profile.tsx          # Perfil e dados pessoais
    │   ├── (professional)/          # Área do profissional
    │   │   ├── home.tsx             # Dashboard do profissional
    │   │   ├── patients.tsx         # Lista de pacientes
    │   │   ├── search-patient.tsx   # Busca avançada de pacientes
    │   │   ├── patient-profile.tsx  # Perfil completo do paciente
    │   │   ├── register-vaccine.tsx # Registrar nova vacinação ✱
    │   │   ├── agenda.tsx           # Agenda (rede privada)
    │   │   └── settings.tsx         # Configurações e logout
    │   └── (unit)/                  # Área da unidade de saúde
    │       └── triage.tsx           # Triagem e fila de vacinação
    │
    ├── components/                  # Componentes reutilizáveis
    │   ├── VaccineCard.tsx          # Card de vacina (histórico)
    │   ├── StatusBadge.tsx          # Badge de status (pendente/atrasada/completa)
    │   ├── PrimaryButton.tsx        # Botão principal (variantes paciente/profissional)
    │   ├── InputField.tsx           # Campo de formulário padronizado
    │   ├── HealthUnitCard.tsx       # Card de unidade de saúde (mapa)
    │   ├── auth/                    # Componentes exclusivos das telas de autenticação
    │   └── professional/            # Componentes exclusivos da área do profissional
    │       ├── PatientContextCard.tsx
    │       └── SuccessModal.tsx
    │
    ├── contexts/
    │   └── AuthContext.tsx          # Sessão global (login, token JWT, perfil, logout)
    │
    ├── services/
    │   ├── PublicQueueStore.ts      # Fila pública de vacinação (via API)
    │   └── api/                    # Cliente HTTP e funções por recurso
    │       ├── client.ts           # fetch + tratamento de erros (ApiError)
    │       ├── config.ts           # Descoberta/configuração da URL da API
    │       ├── token.ts            # Token JWT no AsyncStorage
    │       ├── auth.ts             # Login e cadastro
    │       ├── patients.ts         # Perfil, listagem e busca
    │       ├── professionals.ts    # Perfil e verificação de registro
    │       ├── vaccines.ts         # Catálogo de vacinas
    │       ├── vaccinations.ts     # Registro de vacinação
    │       ├── appointments.ts     # Agenda
    │       ├── healthUnits.ts      # Unidades de saúde
    │       ├── campaigns.ts        # Campanhas vacinais
    │       └── stock.ts            # Estoque de vacinas
    │
    ├── constants/
    │   ├── Colors.ts               # Paleta de cores oficial do projeto
    │   └── MockData.ts             # Tipos TypeScript compartilhados
    │
    ├── assets/                     # Ícones, splash e imagens do app
    ├── babel.config.js             # Configuração Babel (babel-preset-expo)
    ├── app.json                    # Configuração do Expo (SDK, plugins, ícones)
    ├── tsconfig.json
    └── package.json
```

> **✱ register-vaccine.tsx** — tela de maior complexidade: formulário de registro vacinal com
> dropdown de vacinas e fabricantes, seleção/troca de unidade de saúde com confirmação de
> CRM/COREN, validação completa de campos obrigatórios e de data (sem datas futuras ou
> inválidas), e fila de vacinação com chips de vacinas pendentes/atrasadas visíveis.

---

## 🚀 Como Iniciar o Projeto

O app precisa do **backend rodando** para funcionar. São dois passos: primeiro a API, depois o app mobile.

---

## 🪟 Guia de Instalação — Windows

### 📋 Pré-requisitos

| Programa | Versão recomendada | Link |
|---|---|---|
| **Python** | 3.11 ou 3.12 (64 bits) | https://www.python.org/downloads/ |
| **Node.js** | 18 LTS ou 20 LTS | https://nodejs.org/ |
| **Git** *(para clonar)* | qualquer recente | https://git-scm.com/ |
| **Expo Go** *(app no celular)* | mais recente | Play Store / App Store |

> ⚠️ No instalador do Python, marque **"Add python.exe to PATH"** — isso evita muita dor de cabeça depois.

Verifique se está tudo instalado:
```powershell
python --version
node --version
npm --version
```

---

### Passo 1 — Backend (API + banco de dados)

Abra o PowerShell **na pasta raiz do projeto** e rode um comando de cada vez:

```powershell
cd backend
python -m venv venv
```

**Ativar o ambiente virtual:**
```powershell
.\venv\Scripts\Activate.ps1
```
> Se aparecer erro de política de execução, rode antes:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```

Após ativação, o terminal exibe `(venv)` no início. **Todos os comandos a seguir são com o venv ativado:**

```powershell
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

**Configurar o ambiente** (copiar arquivo de exemplo):
```powershell
copy .env.example .env
```
> O padrão já usa SQLite — nenhuma edição necessária para rodar localmente.

**Criar o banco e popular com dados de demonstração:**
```powershell
python seed.py
```

**Subir a API:**
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Se aparecer `Uvicorn running on http://0.0.0.0:8000`, o backend está no ar.
Abra `http://localhost:8000/docs` no navegador para ver a documentação interativa da API.

---

### Passo 2 — App mobile (frontend)

Abra **um novo terminal PowerShell** (mantenha o do backend aberto):

```powershell
cd VacinApp
npm install
npx expo start
```

Um QR Code vai aparecer no terminal. Abra o **Expo Go** no celular (na mesma rede Wi-Fi do computador) e escaneie.

> Se o app não encontrar o backend automaticamente, crie um arquivo `.env` dentro de `VacinApp/`:
> ```env
> EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:8000
> ```
> Descubra seu IP local rodando `ipconfig` no PowerShell (procure "Endereço IPv4").

---

## 🔑 Contas de Demonstração

Criadas automaticamente pelo `python seed.py`. Senha de todas: **`senha1234`**

| Perfil | Login |
|---|---|
| Paciente SUS | CPF `987.654.321-00` |
| Paciente Convênio | CPF `123.456.789-00` |
| Profissional (rede pública) | `fernanda.alves@saude.gov.br` · registro `COREN/SP-123456` |
| Profissional (rede privada) | `ricardo.oliveira@vidasaude.com` · registro `CRM/SP-98765` · instituição `Clínica Vida Saúde` |
| Unidade de Saúde (triagem) | CNES `1234567` · usuário `recepcao@ubscentral.gov.br` |

> ℹ️ O login da **Rede Privada** exige o campo **Instituição**, que deve corresponder exatamente
> ao nome da unidade vinculada ao profissional no backend.

---

## 🛠️ Solução de Problemas Comuns

### Backend

**`&&` não funciona no PowerShell**
```
O token '&&' não é um separador de instruções válido nesta versão.
```
→ Execute os comandos um por linha (como neste guia), ou use `cmd.exe`.

**Erro compilando `pydantic-core`**
```
error: failed-wheel-build-for-install
```
→ Rode antes do `pip install`:
```powershell
python -m pip install --upgrade pip setuptools wheel
```

**Python muito novo (ex: 3.14) — pacotes não instalam**
→ Instale o Python 3.12 ao lado e aponte o venv para ele:
```powershell
py -3.12 -m venv venv
```
(liste as versões instaladas com `py --list`)

### App Mobile

**"Não foi possível conectar ao servidor" ao fazer login**
- Confirme que o backend está rodando sem erros
- No celular físico, backend e celular devem estar na mesma rede Wi-Fi
- Configure `EXPO_PUBLIC_API_URL` manualmente se a descoberta automática falhar

**"Unable to resolve module"**
```powershell
npm install
npx expo start --clear
```

**App não carrega no celular**
- Confirme que estão na mesma rede Wi-Fi
- Pressione `t` no terminal do Expo para usar o modo **Tunnel**

**Cache desatualizado**
```powershell
npx expo start --clear
```

**Erro `Cannot find module 'expo/node_modules/babel-preset-expo'`**
→ Abra `VacinApp/babel.config.js` e certifique-se que o preset está assim:
```js
presets: ['babel-preset-expo'],
```
(não use `require.resolve('expo/node_modules/...')` — esse caminho não existe no SDK 57+)

---

## 🎨 Paleta de Cores

| Nome | Hex | Uso |
|---|---|---|
| Roxo Principal | `#685895` | Botões e cabeçalhos do paciente |
| Roxo Secundário | `#988EC4` | Hover e destaques do paciente |
| Lilás Suave | `#E8E8F7` | Fundo global de todas as telas |
| Verde Profissional | `#588C5A` | Identidade do profissional e da unidade |
| Verde Claro | `#A8D5A2` | Badges e confirmações |
| Status Completo | `#588C5A` | Vacina tomada / em dia |
| Status Pendente | `#E8A838` | Vacina agendada / pendente |
| Status Atrasada | `#D9534F` | Vacina atrasada / vencida |

---

## ✅ Regras de Negócio Implementadas

### Registro de Vacinação (`register-vaccine.tsx`)
- **Campos obrigatórios:** vacina, dose, número de lote e data de aplicação — todos validados individualmente com mensagens específicas
- **Validação de data:**
  - Deve estar no formato `DD/MM/AAAA`
  - Deve ser uma data real (ex: `31/02` é bloqueada)
  - Não pode ser anterior a `01/01/1900`
  - **Não pode ser uma data futura** — apenas datas até hoje são aceitas
- **Unidade de saúde:** travada na unidade vinculada ao profissional; trocar exige confirmação de CRM/COREN

### Fila de Vacinação (`register-vaccine.tsx` — rede pública)
- Cada paciente na fila exibe chips visuais com as vacinas **atrasadas** (vermelho 🔴) e **pendentes** (amarelo 🟡), sem precisar abrir o perfil completo

---

## 📌 Status do Projeto

🚧 Em desenvolvimento — TCC ETEC 2026

---

## 👩‍💻 Autora

Desenvolvido por **Sophia Lorena** como TCC do curso técnico na ETEC.