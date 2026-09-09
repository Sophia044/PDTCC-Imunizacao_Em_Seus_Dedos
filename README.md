# 💉 VacinApp — Imunização em Seus Dedos

> **Aplicativo mobile para digitalização e centralização do histórico vacinal integrado com Inteligência Artificial Local (Ollama / Qwen 2.5).**  
> Desenvolvido como Trabalho de Conclusão de Curso (TCC) da ETEC.

---

## 📋 Sobre o Projeto

Muitas pessoas não sabem quais vacinas já tomaram, quando tomar a próxima dose ou onde está sua carteira de vacinação física. O **VacinApp** resolve esse problema unificando o controle vacinal de pacientes e profissionais de saúde com tecnologia moderna, segura e inteligente.

### ✨ Principais Recursos
- 📱 **Histórico Vacinal Digital:** Carteira de vacinação sempre disponível no smartphone.
- 🗓️ **Calendário Vacinal Inteligente:** Alertas de doses pendentes, atrasadas e próximas imunizações.
- 🤖 **Assistente Virtual com IA Local:** Tira-dúvidas sobre vacinas, calendário do SUS (PNI), reações esperadas e contraindicações powered by **Qwen 2.5:14b via Ollama**.
- 🗺️ **Mapa de Postos de Vacinação:** Localização de UBSs (SUS) e clínicas particulares próximas em tempo real.
- 👥 **Triagem e Fila em Tempo Real:** Módulo para Unidades Básicas de Saúde organizarem a fila de espera.
- 👩‍⚕️ **Painel Profissional:** Cadastro de aplicações, validação por lote e fabricante, e busca rápida de pacientes por CPF/CNS.
- 📰 **Campanhas e Notícias:** Informações atualizadas sobre imunização e saúde pública.

---

## 👥 Perfis de Acesso

| Perfil | Cor de Identidade | Funcionalidades Principais |
|---|---|---|
| **Paciente** | Roxo (`#685895`) | Visualizar carteira de vacinação, calendário, mapa de postos, **Assistente IA de Imunização** e perfil. |
| **Profissional** | Verde (`#588C5A`) | Registrar novas doses aplicadas, buscar histórico do paciente por CPF, gerenciar agenda (rede privada). |
| **Unidade de Saúde** | Verde (`#588C5A`) | Fila de atendimento e triagem de pacientes em tempo real. |

---

## 🛠️ Tecnologias Utilizadas

### 📱 Frontend (Mobile)
- **Framework:** [React Native](https://reactnative.dev/) com [Expo SDK 54](https://expo.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Roteamento:** [Expo Router](https://docs.expo.dev/router/introduction/) (navegação baseada em arquivos)
- **Animações & UI:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/), [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- **Mapas & Calendários:** [react-native-maps](https://github.com/react-native-maps/react-native-maps), [react-native-calendars](https://github.com/wix/react-native-calendars)
- **Armazenamento Seguro:** `@react-native-async-storage/async-storage` (persistência de JWT)

### 🐍 Backend (API REST)
- **Linguagem & Framework:** [Python 3.12](https://www.python.org/) com [FastAPI](https://fastapi.tiangolo.com/)
- **Servidor ASGI:** [Uvicorn](https://www.uvicorn.org/)
- **Banco de Dados & ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) (SQLite para desenvolvimento / MySQL pronto para produção)
- **Validação:** [Pydantic v2](https://docs.pydantic.dev/) + [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- **Autenticação:** [python-jose](https://github.com/mpdavis/python-jose) (JWT) e [bcrypt](https://pypi.org/project/bcrypt/)
- **Cliente HTTP Assíncrono:** [httpx](https://www.python-httpx.org/) (comunicação de alta performance com a IA)

### 🧠 Inteligência Artificial (Local, Privativa & RAG)
- **Motor de Execução:** [Ollama](https://ollama.com/)
- **Modelo de Linguagem (LLM):** `qwen2.5:14b` (Qwen 2.5 otimizado para raciocínio e linguagem natural em português)
- **Modelo de Embeddings:** `nomic-embed-text` (768 dimensões para busca semântica em documentos)
- **Banco Vetorial:** [ChromaDB](https://www.trychroma.com/) (persistência local com métrica angular de cosseno)
- **Documentos Oficiais (RAG):** Manuais e calendários do Ministério da Saúde e SBIm
- **Conectividade Remota:** Suporte a rede mesh [Tailscale](https://tailscale.com/) para acesso remoto sem expor portas públicas.

---

## 📁 Estrutura do Repositório

```
PDTCC-Imunizacao_Em_Seus_Dedos/
├── README.md                          # Documentação completa do projeto
│
├── backend/                           # API REST (FastAPI) + Banco de Dados
│   ├── app/
│   │   ├── main.py                    # Inicialização da API, CORS e montagem de rotas
│   │   ├── config.py                  # Configurações centralizadas via .env
│   │   ├── database.py                # Conexão e sessão do SQLAlchemy
│   │   ├── models.py                  # Modelos relacionais (Usuários, Vacinas, Doses, etc.)
│   │   ├── schemas.py                 # Schemas Pydantic (validação de entrada/saída)
│   │   ├── security.py                # Hash de senhas (bcrypt) e geração de tokens JWT
│   │   ├── deps.py                    # Dependências de injeção e controle de acesso
│   │   └── routers/                   # Rotas organizadas por módulo
│   │       ├── auth.py                # Login e cadastro (Paciente, Profissional, Unidade)
│   │       ├── ai_assistant.py        # 🤖 Assistente Virtual com IA (Proxy Ollama + System Prompt)
│   │       ├── patients.py            # Consulta e histórico de pacientes
│   │       ├── professionals.py       # Perfil e ações do profissional
│   │       ├── vaccines.py            # Catálogo oficial de vacinas do SUS/Privado
│   │       ├── vaccinations.py        # Registro e validação de vacinas aplicadas
│   │       ├── appointments.py        # Agendamento de doses
│   │       ├── health_units.py        # Localização de UBSs e postos
│   │       ├── campaigns.py           # Campanhas ativas de vacinação
│   │       ├── queue.py               # Triagem e fila em tempo real
│   │       └── stock.py               # Controle de lotes e estoque
│   ├── database/
│   │   └── schema.sql                 # DDL do banco para migração MySQL
│   ├── seed.py                        # Script para popular dados de teste realistas
│   ├── requirements.txt               # Dependências Python
│   └── .env.example                   # Exemplo de variáveis de ambiente
│
└── VacinApp/                          # Frontend Mobile (React Native / Expo)
    ├── app/                           # Telas e Roteamento (Expo Router)
    │   ├── (auth)/                    # Fluxo de Autenticação
    │   │   ├── login.tsx              # Seleção de tipo de perfil
    │   │   ├── login-user.tsx         # Login do Paciente (CPF + Senha)
    │   │   ├── login-professional.tsx # Login do Profissional (Email/Registro)
    │   │   ├── login-unit.tsx         # Login da Unidade de Saúde (CNES)
    │   │   ├── register-sus.tsx       # Cadastro Paciente SUS
    │   │   └── register-private.tsx   # Cadastro Paciente Particular/Convênio
    │   ├── (patient)/                 # Área do Paciente
    │   │   ├── _layout.tsx            # Navegação por abas inferiores
    │   │   ├── home.tsx               # Dashboard com status de imunização
    │   │   ├── assistant.tsx          # 🤖 Chat do Assistente Virtual de Vacinação
    │   │   ├── calendar.tsx           # Calendário vacinal por faixas etárias
    │   │   ├── map.tsx                # Mapa interativo com postos próximos
    │   │   └── profile.tsx            # Carteira digital e dados pessoais
    │   ├── (professional)/            # Área do Profissional de Saúde
    │   │   ├── home.tsx               # Painel de atendimento
    │   │   ├── search-patient.tsx     # Busca de pacientes por CPF/CNS
    │   │   ├── patient-profile.tsx    # Histórico e aplicação de vacinas
    │   │   └── register-vaccine.tsx   # Formulário de aplicação com lote e validade
    │   ├── (unit)/                    # Área da Unidade de Saúde
    │   │   └── triage.tsx             # Fila de espera e triagem
    │   ├── index.tsx                  # Splash / Redirecionamento de sessão
    │   └── _layout.tsx                # Context Provider global
    ├── components/                    # Componentes modulares reutilizáveis
    ├── contexts/
    │   └── AuthContext.tsx            # Gerenciamento global de autenticação e sessão
    ├── services/
    │   └── api/                       # Camada de comunicação com a API REST
    │       ├── client.ts              # Interceptor HTTP assíncrono
    │       ├── config.ts              # Descoberta dinâmica de IP e URLs
    │       ├── aiAssistant.ts         # 🤖 Serviço de integração com a IA
    │       └── ...                    # Módulos por recurso (auth, vaccines, etc.)
    └── constants/
        └── Colors.ts                  # Design System e identidade de cores
```

---

## 🤖 Módulo do Assistente Virtual (IA Local)

O **VacinApp** conta com um assistente especializado em imunização humana no Brasil, projetado com privacidade e alto desempenho:

### Como Funciona:
1. **Frontend (`assistant.tsx`):** Fornece uma interface de chat interativa com balões de conversa, sugestões de perguntas frequentes (ex: *"Quais vacinas o bebê toma aos 2 meses?"*, *"Tomei a 1ª dose da Dengue, quando tomo a 2ª?"*) e animação de digitação/espera.
2. **Backend Proxy (`ai_assistant.py`):** O backend recebe a pergunta autenticada via JWT, adiciona um **System Prompt especializado** baseado nas diretrizes do Ministério da Saúde / PNI (Programa Nacional de Imunizações) e encaminha para o Ollama de forma assíncrona.
3. **Privacidade e Descentralização:** O processamento da IA é executado localmente na máquina, permitindo total sigilo de dados e funcionamento mesmo em redes locais fechadas.

### Exemplo de Chamada da API:
```http
POST /ai/ask
Content-Type: application/json
Authorization: Bearer <SEU_TOKEN_JWT>

{
  "question": "Quais vacinas são recomendadas para gestantes?"
}
```

**Resposta:**
```json
{
  "question": "Quais vacinas são recomendadas para gestantes?",
  "answer": "Para gestantes, o Calendário Nacional de Vacinação do SUS recomenda:\n\n1. **dTpa (Tríplice bacteriana acelular):** A partir da 20ª semana de gestação a cada gravidez.\n2. **Hepatite B:** 3 doses (caso não tenha sido vacinada anteriormente).\n3. **Influenza (Gripe):** Dose única em qualquer período gestacional durante a campanha.\n4. **Covid-19:** Conforme as orientações vigentes do Ministério da Saúde.\n\n*Lembre-se de sempre apresentar sua Caderneta da Gestante na UBS mais próxima.*",
  "model": "qwen2.5:14b"
}
```

---

## ⚙️ Pré-requisitos para Execução

Antes de iniciar, garanta que seu computador possui os seguintes softwares instalados:

| Software | Versão Recomendada | Finalidade |
|---|---|---|
| **Python** | `3.11` ou `3.12` (64-bit) | Executar o backend FastAPI e o banco de dados. *(Nota: Evite Python 3.14 devido à compatibilidade de wheels)* |
| **Node.js** | `18 LTS` ou `20 LTS` | Gerenciador de pacotes e runtime do Expo |
| **Ollama** | Versão mais recente | Executar o modelo de Inteligência Artificial local |
| **Expo Go** | App no celular (Android / iOS) | Testar o app mobile em tempo real via QR Code |
| **Tailscale** *(Opcional)* | Recente | Conectar dispositivos remotamente em rede mesh segura |

---

## 🚀 Como Iniciar o Projeto Passo a Passo

### 1️⃣ Inicializar o Motor de IA (Ollama) e Preparar o RAG
1. No seu computador, certifique-se de que os modelos estão baixados no Ollama:
   ```powershell
   # Modelo de resposta (LLM)
   ollama run qwen2.5:14b

   # Modelo de busca semântica em documentos (Embeddings)
   ollama pull nomic-embed-text
   ```
   > O Ollama ficará escutando por padrão em `http://localhost:11434`.

2. *(Opcional)* Se adicionou novos PDFs na pasta `backend/documentos-vacinacao/`, indexe a base vetorial:
   ```powershell
   cd backend
   .\venv\Scripts\activate
   python index_documents.py
   ```
3. criar um arquivo .env no frontend
   ```
   cd VacinApp
   ~crie uma pasta chamada ".env"~
   coloque o seguinte texto dentro "EXPO_PUBLIC_API_URL=http://100.70.203.65:8000"
   
   ```

---

### 2️⃣ Configurar e Iniciar o Backend (FastAPI)

1. Abra o terminal na pasta `backend`:
   ```powershell
   cd backend
   ```

2. Crie e ative o ambiente virtual:
   ```powershell
   # Criar o venv (usando Python 3.12)
   py -3.12 -m venv venv

   # Ativar no Windows (PowerShell)
   .\venv\Scripts\Activate.ps1
   ```
   *(Caso ocorra erro de execução de scripts no PowerShell, execute: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*

3. Instale as dependências:
   ```powershell
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Configure o arquivo `.env`:
   ```powershell
   copy .env.example .env
   ```
   *As configurações padrão já estão prontas para desenvolvimento local (SQLite + Ollama localhost).*

5. Popule o banco com dados de demonstração (pacientes, vacinas e profissionais):
   ```powershell
   python seed.py
   ```

6. Inicie o servidor FastAPI:
   ```powershell
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

✅ **Backend ativo:** Acesse [http://localhost:8000/docs](http://localhost:8000/docs) para conferir a documentação interativa Swagger.

---

### 3️⃣ Iniciar o Frontend Mobile (Expo)

1. Abra **um novo terminal** na pasta `VacinApp`:
   ```powershell
   cd VacinApp
   ```

2. Instale os pacotes npm:
   ```powershell
   npm install
   ```

3. Inicie o servidor Metro do Expo:
   ```powershell
   npx expo start
   ```

4. **Como abrir no celular:**
   - Abra o app **Expo Go** no seu smartphone (conectado ao mesmo Wi-Fi do computador).
   - Escaneie o QR Code que apareceu no terminal.
   - *Dica:* Caso use Tailscale ou rede móvel, configure a variável `EXPO_PUBLIC_API_URL=http://<IP_DO_PC>:8000` em um arquivo `.env` dentro da pasta `VacinApp`.

---

## 🔑 Contas de Demonstração (Seed)

O comando `python seed.py` cadastra contas prontas para teste da banca e desenvolvimento:

> **Senha padrão para todos os perfis:** `senha1234`

| Perfil | Identificador / Login | Detalhes |
|---|---|---|
| 🏥 **Paciente SUS** | CPF: `987.654.321-00` | Histórico com vacinas do SUS (COVID-19, Gripe, Febre Amarela). |
| 🏥 **Paciente Convênio** | CPF: `123.456.789-00` | Histórico misto (rede pública e particular). |
| 👩‍⚕️ **Profissional (SUS)** | E-mail: `fernanda.alves@saude.gov.br`<br>Registro: `COREN/SP-123456` | Enfermeira atuante em Unidade Básica de Saúde. |
| 👨‍⚕️ **Profissional (Privado)** | E-mail: `ricardo.oliveira@vidasaude.com`<br>Registro: `CRM/SP-98765` | Médico em clínica de vacinação privada. |
| 🏢 **Unidade de Saúde** | CNES: `1234567`<br>Usuário: `recepcao@ubscentral.gov.br` | Operador do painel de triagem e fila de atendimento. |

---

## 🌐 Principais Endpoints da API

| Método | Endpoint | Descrição | Autenticação |
|---|---|---|---|
| `POST` | `/auth/login/patient` | Login do paciente por CPF | Não |
| `POST` | `/auth/login/professional` | Login do profissional de saúde | Não |
| `POST` | `/auth/login/unit` | Login da unidade de saúde | Não |
| `POST` | `/ai/ask` | **Consulta ao Assistente Virtual de Imunização** | Sim (Bearer JWT) |
| `GET` | `/patients/me` | Dados e carteira vacinal do paciente logado | Paciente |
| `GET` | `/vaccines` | Catálogo de vacinas disponíveis | Sim |
| `POST` | `/vaccinations` | Registro de aplicação de dose | Profissional |
| `GET` | `/health-units` | Lista de postos e UBSs para o mapa | Sim |
| `GET` | `/campaigns` | Campanhas de vacinação em andamento | Sim |
| `GET` | `/queue` | Fila pública e status de triagem | Sim |

---

## 🛠️ Solução de Problemas Comuns

### 1. "Failed wheel build for pydantic-core" no Python 3.14
- **Causa:** O Python 3.14 ainda não possui binários pré-compilados no PyPI para bibliotecas em Rust/C++.
- **Solução:** Use o **Python 3.12**. O projeto já está configurado para o ambiente Python 3.12.

### 2. "Não foi possível conectar ao servidor" no aplicativo mobile
- Verifique se o backend está rodando no terminal (`Uvicorn running on http://0.0.0.0:8000`).
- Garanta que seu celular e computador estão na mesma rede Wi-Fi (ou conectados via Tailscale).
- No Windows Defender Firewall, certifique-se de que a porta `8000` está liberada para a rede privada.

### 3. "Assistente IA indisponível no momento"
- Certifique-se de que o serviço do Ollama está aberto com o comando `ollama run qwen2.5:14b`.
- Verifique se o endereço `OLLAMA_URL` no `.env` do backend aponta para `http://localhost:11434` (ou para o IP Tailscale configurado).

### 4. Limpar cache do Expo
```powershell
cd VacinApp
npx expo start --clear
```

---

## 🎨 Identidade Visual

- **Roxo Principal (`#685895`):** Acolhimento, tecnologia e cuidado — identidade do Paciente.
- **Roxo Claro (`#988EC4`):** Destaques, seleções e botões secundários.
- **Verde Profissional (`#588C5A`):** Saúde, segurança e rigor técnico — identidade do Profissional.
- **Verde Suave (`#A8D5A2`):** Confirmações de doses aplicadas e validações.
- **Fundo Neutro (`#F8F9FE`):** Leitura confortável e moderna.

---

## 📌 Status do Projeto

✅ **Concluído e Funcional:**
- Arquitetura completa Backend + Frontend integrada.
- Sistema de autenticação JWT multicamadas.
- Carteira vacinal digital e mapa de postos.
- Assistente Virtual com IA Generativa local (Ollama/Qwen).

---

## 👩‍💻 Autoria

Desenvolvido por **Sophia Lorena**  
*Trabalho de Conclusão de Curso (TCC) — ETEC — 2026*
