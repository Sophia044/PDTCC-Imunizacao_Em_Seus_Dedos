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
| **Unidade de Saúde** | Verde (#588C5A) | Triagem: identificar pacientes e organizar a fila de vacinação |

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
- [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) — geolocalização (mapa de postos)
- [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) — persistência da sessão (token de login)
- React Context API (`contexts/AuthContext.tsx`) — estado global de autenticação

**Back-end**
- [Python](https://www.python.org/) com [FastAPI](https://fastapi.tiangolo.com/) — API REST
- [Uvicorn](https://www.uvicorn.org/) — servidor ASGI
- [SQLAlchemy](https://www.sqlalchemy.org/) — ORM (SQLite para desenvolvimento, MySQL para produção)
- [Pydantic](https://docs.pydantic.dev/) — validação e formatos de entrada/saída da API
- [python-jose](https://github.com/mpdavis/python-jose) + [bcrypt](https://pypi.org/project/bcrypt/) — autenticação (JWT) e hash de senhas

---

## 📁 Estrutura de Pastas

```
PDTCC-Imunizacao_Em_Seus_Dedos/
├── README.md                    # Este arquivo
├── GUIA-WINDOWS.md              # Guia detalhado de instalação no Windows
│
├── backend/                     # API REST (Python/FastAPI) + banco de dados
│   ├── app/
│   │   ├── main.py              # Ponto de entrada da API (monta rotas e CORS)
│   │   ├── config.py            # Configurações via .env
│   │   ├── database.py          # Conexão com o banco (SQLite/MySQL)
│   │   ├── models.py            # Tabelas do banco (SQLAlchemy)
│   │   ├── schemas.py           # Formatos de entrada/saída da API (Pydantic)
│   │   ├── security.py          # Hash de senha (bcrypt) e tokens JWT
│   │   ├── deps.py              # Dependências de autenticação por perfil
│   │   ├── utils.py             # Funções auxiliares (datas, cálculos, etc.)
│   │   └── routers/             # Uma rota por recurso da API
│   │       ├── auth.py          # Login e cadastro (paciente, profissional, unidade)
│   │       ├── patients.py      # Perfil, listagem e busca de pacientes
│   │       ├── professionals.py # Perfil do profissional autenticado
│   │       ├── vaccines.py      # Catálogo de vacinas
│   │       ├── vaccinations.py  # Registro de vacinação aplicada
│   │       ├── appointments.py  # Agenda (rede privada)
│   │       ├── health_units.py  # Unidades de saúde (mapa)
│   │       ├── queue.py         # Fila pública de vacinação (triagem)
│   │       ├── campaigns.py     # Campanhas vacinais ativas
│   │       └── stock.py         # Estoque de vacinas da unidade
│   ├── database/
│   │   └── schema.sql           # DDL de referência para MySQL
│   ├── seed.py                  # Popula o banco com dados de demonstração
│   ├── requirements.txt         # Dependências Python
│   ├── .env.example             # Modelo de configuração do backend
│   └── README.md                # Instruções completas de setup do backend
│
└── VacinApp/                    # Aplicativo mobile (React Native/Expo)
    ├── app/                     # Telas (Expo Router — cada arquivo é uma rota)
    │   ├── (auth)/               # Autenticação
    │   │   ├── login.tsx                  # Escolha do tipo de acesso
    │   │   ├── login-user.tsx             # Login do paciente
    │   │   ├── login-professional.tsx     # Login do profissional
    │   │   ├── login-unit.tsx             # Login da unidade de saúde
    │   │   ├── choose-registration.tsx    # Escolha do tipo de cadastro
    │   │   ├── register-sus.tsx           # Cadastro de paciente (SUS)
    │   │   └── register-private.tsx       # Cadastro de paciente (convênio)
    │   ├── (patient)/            # Área do paciente
    │   │   ├── home.tsx                   # Dashboard principal
    │   │   ├── calendar.tsx               # Calendário vacinal
    │   │   ├── map.tsx                    # Mapa de postos de vacinação
    │   │   └── profile.tsx                # Perfil e dados pessoais
    │   ├── (professional)/      # Área do profissional
    │   │   ├── home.tsx                   # Dashboard do profissional
    │   │   ├── patients.tsx               # Lista de pacientes
    │   │   ├── search-patient.tsx         # Busca avançada de pacientes
    │   │   ├── patient-profile.tsx        # Perfil completo do paciente
    │   │   ├── register-vaccine.tsx       # Registrar nova vacinação
    │   │   ├── agenda.tsx                 # Agenda (rede privada)
    │   │   └── settings.tsx               # Configurações e logout
    │   ├── (unit)/               # Área da unidade de saúde
    │   │   └── triage.tsx                 # Triagem e fila de vacinação
    │   ├── index.tsx             # Splash screen (com redirecionamento automático)
    │   └── _layout.tsx           # Layout raiz (AuthProvider + navegação)
    │
    ├── components/               # Componentes reutilizáveis
    │   ├── VaccineCard.tsx
    │   ├── StatusBadge.tsx
    │   ├── PrimaryButton.tsx
    │   ├── InputField.tsx
    │   ├── HealthUnitCard.tsx
    │   ├── auth/                 # Componentes específicos das telas de autenticação
    │   └── professional/         # Componentes específicos das telas do profissional
    │
    ├── contexts/
    │   └── AuthContext.tsx       # Sessão do usuário (login, token, perfil, logout)
    │
    ├── services/
    │   ├── PublicQueueStore.ts   # Fila pública de vacinação (via API)
    │   └── api/                  # Cliente HTTP e funções por recurso da API
    │       ├── client.ts         # Requisições HTTP + tratamento de erros
    │       ├── config.ts         # Descoberta/configuração da URL da API
    │       ├── token.ts          # Armazenamento do token (AsyncStorage)
    │       ├── auth.ts           # Login e cadastro
    │       ├── patients.ts       # Perfil, listagem e busca de pacientes
    │       ├── professionals.ts  # Perfil do profissional
    │       ├── vaccines.ts       # Catálogo de vacinas
    │       ├── vaccinations.ts   # Registro de vacinação
    │       ├── appointments.ts   # Agenda
    │       ├── healthUnits.ts    # Unidades de saúde (mapa)
    │       ├── campaigns.ts      # Campanhas vacinais
    │       └── stock.ts          # Estoque de vacinas
    │
    ├── constants/
    │   ├── Colors.ts              # Paleta de cores oficial
    │   └── MockData.ts            # Tipos compartilhados com o backend
    │
    ├── assets/                    # Ícones e imagens do app
    ├── app.json                   # Configuração do Expo
    ├── package.json
    └── README.md
```

---

## 🚀 Como Iniciar o Projeto

O app precisa do **backend rodando** para funcionar de verdade (login, cadastro,
histórico vacinal, etc. — nada mais é mockado). São dois passos: primeiro a
API, depois o app mobile.

---
# 🪟 Guia de Instalação — Windows
 
Guia detalhado para rodar o **VacinApp** (backend + app mobile) no Windows,
com foco nos problemas mais comuns do PowerShell.
 
---
 
## 📋 Pré-requisitos
 
| Programa | Versão recomendada | Link |
|---|---|---|
| **Python** | 3.11 ou 3.12 (64 bits) | https://www.python.org/downloads/ |
| **Node.js** | 18 LTS ou 20 LTS | https://nodejs.org/ |
| **Git** *(opcional, só se for clonar via git)* | qualquer versão recente | https://git-scm.com/ |
| **Expo Go** *(app no celular)* | mais recente | Play Store / App Store |
 
⚠️ No Windows, ao instalar o Python, marque a caixinha **"Add python.exe to
PATH"** na primeira tela do instalador — isso evita muita dor de cabeça
depois.
 
Para conferir se já está tudo certo, abra o PowerShell e rode:
 
```powershell
python --version
node --version
npm --version
```
 
Se algum desses der erro de "comando não reconhecido", o programa não está
instalado ou não foi adicionado ao PATH.
 
---
 
## 🚀 Passo a Passo
 
### Passo 1 — Backend (API + banco de dados)
 
Abra o PowerShell **na pasta do projeto** e siga um comando de cada vez:
 
```powershell
cd backend
python -m venv venv
```
 
**Ativar o ambiente virtual:**
```powershell
.\venv\Scripts\Activate.ps1
```
> Se aparecer erro de política de execução, rode antes:
> `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
 
Depois de ativado, o terminal mostra `(venv)` no início da linha. **A partir
daqui, todo comando abaixo é com o venv ativado**:
 
```powershell
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```
 
**Configurar o ambiente** (copiar o arquivo de exemplo):
```powershell
copy .env.example .env
```
> Não precisa editar nada no `.env` — o padrão já usa SQLite (banco de
> arquivo único, zero configuração).
 
**Criar o banco e popular com dados de teste:**
```powershell
python seed.py
```
 
**Subir a API:**
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
 
✅ Se aparecer `Uvicorn running on http://0.0.0.0:8000`, o backend está no
ar. Deixe esse terminal aberto e abra `http://localhost:8000/docs` no
navegador — se a documentação da API carregar, está tudo certo.
 
---
 
### Passo 2 — App mobile (frontend)
 
Abra **um novo terminal PowerShell** (não feche o do backend):
 
```powershell
cd VacinApp
npm install
npx expo start
```
 
Um QR Code vai aparecer no terminal. Abra o app **Expo Go** no celular (na
mesma rede Wi-Fi do computador) e escaneie o QR Code.
 
> Se o app não conseguir "achar" o backend sozinho, crie um arquivo `.env`
> dentro da pasta `VacinApp` com:
> ```
> EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:8000
> ```
> (descubra seu IP local rodando `ipconfig` no PowerShell e procurando
> "Endereço IPv4")
 
---
 
## 🔑 Contas de demonstração
 
Criadas automaticamente pelo `python seed.py`. Senha de todas: **`senha1234`**
 
| Perfil | Login |
|---|---|
| Paciente SUS | CPF `987.654.321-00` |
| Paciente Convênio | CPF `123.456.789-00` |
| Profissional (rede pública) | `fernanda.alves@saude.gov.br` · registro `COREN/SP-123456` |
| Profissional (rede privada) | `ricardo.oliveira@vidasaude.com` · registro `CRM/SP-98765` |
| Unidade de Saúde (triagem) | CNES `1234567` · usuário `recepcao@ubscentral.gov.br` |
 
---
 
## 🛠️ Solução de Problemas Comuns (Windows)
 
**`&&` não funciona no PowerShell**
```
O token '&&' não é um separador de instruções válido nesta versão.
```
→ Rode os comandos um por linha (como neste guia), ou use o `cmd.exe` no
lugar do PowerShell.
 
**Erro compilando `pydantic-core`**
```
error: failed-wheel-build-for-install
```
→ Rode antes do `pip install -r requirements.txt`:
```powershell
python -m pip install --upgrade pip setuptools wheel
```
 
**Tenho uma versão muito nova do Python (ex: 3.14) e os pacotes não instalam**
→ Não precisa desinstalar. Instale o Python 3.12 ao lado e crie o `venv`
apontando para ele:
```powershell
py -3.12 -m venv venv
```
(confira as versões instaladas com `py --list`)
 
**"Não foi possível conectar ao servidor" ao fazer login no app**
- Confirme que o terminal do backend ainda está rodando e sem erros
- No celular físico, backend e celular precisam estar na mesma rede Wi-Fi
- Se a descoberta automática não funcionar, configure `EXPO_PUBLIC_API_URL`
  manualmente (ver Passo 2)
**Cache do Expo desatualizado**
```powershell
npx expo start --clear
```
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

**"Não foi possível conectar ao servidor" ao fazer login**
- Confirme que o backend está rodando (`uvicorn app.main:app ...`) e acessível em `http://localhost:8000`
- No celular físico, backend e celular precisam estar na mesma rede Wi-Fi
- Se a descoberta automática não funcionar, configure `EXPO_PUBLIC_API_URL` manualmente (ver Passo 2)

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
