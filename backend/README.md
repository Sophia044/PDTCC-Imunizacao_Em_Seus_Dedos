# VacinApp — Backend

API REST em **Python (FastAPI)** que dá vida real ao app **Imunização em Seus
Dedos**: autenticação, cadastro, histórico vacinal, agenda, fila de triagem,
campanhas e estoque — tudo persistido em banco de dados.

## Stack

- **FastAPI** — framework web (rotas, validação, documentação automática)
- **SQLAlchemy** — ORM (os modelos em `app/models.py` são a fonte da verdade
  da estrutura do banco)
- **SQLite** por padrão (zero configuração) ou **MySQL** (produção / mesmo
  banco descrito em `database/schema.sql`, para usar com MySQL Workbench)
- **JWT** (`python-jose`) + **bcrypt** para autenticação

## Como rodar (SQLite — mais rápido para testar)

## 🚀 Passo a Passo
 
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
 

### Contas de demonstração (criadas pelo `seed.py`)

Senha de todas: **`senha1234`**

| Perfil                | Como entrar no app                                             |
|------------------------|-----------------------------------------------------------------|
| Paciente SUS           | CPF `987.654.321-00`                                             |
| Paciente Convênio       | CPF `123.456.789-00`                                              |
| Profissional (rede pública)  | `fernanda.alves@saude.gov.br` · registro `COREN/SP-123456` |
| Profissional (rede privada)  | `ricardo.oliveira@vidasaude.com` · registro `CRM/SP-98765` · instituição `Clínica Vida Saúde` |
| Unidade de Saúde (triagem)   | CNES `1234567` · usuário `recepcao@ubscentral.gov.br`      |

> **Rede Privada exige a instituição no login.** O valor informado no campo
> "Instituição" precisa ser exatamente o nome da unidade de saúde vinculada
> ao profissional (tabela `professional_health_units`), que é a mesma
> unidade indicada no cadastro (`unitName`). Se o profissional estiver
> vinculado a mais de uma unidade ativa, apenas o vínculo ativo mais recente
> é considerado.

## Como rodar com MySQL (produção / MySQL Workbench)

1. Rode `database/schema.sql` no MySQL Workbench (cria o banco `vacinapp` e
   todas as tabelas).
2. No `.env`, aponte para o MySQL:
   ```
   DATABASE_URL=mysql+pymysql://usuario:senha@localhost:3306/vacinapp
   ```
3. Rode a API normalmente (`uvicorn app.main:app ...`). Os modelos do
   SQLAlchemy usam exatamente a mesma estrutura de `schema.sql`, então tudo
   funciona sem alterações.

> `python seed.py` **apaga e recria** todas as tabelas — use apenas em
> desenvolvimento. Em produção, popule o banco manualmente ou escreva um
> script de seed próprio para os dados reais da unidade.

## Estrutura do código

```
backend/
├── app/
│   ├── config.py        # variáveis de ambiente (.env)
│   ├── database.py       # conexão com o banco (SQLite/MySQL) e sessão por requisição
│   ├── models.py          # tabelas (SQLAlchemy) — fonte da verdade da estrutura do banco
│   ├── schemas.py          # formatos de entrada/saída da API (Pydantic), em camelCase
│   ├── security.py         # hash de senha (bcrypt) e tokens de acesso (JWT)
│   ├── deps.py              # "quem pode acessar essa rota" (paciente/profissional/unidade)
│   ├── utils.py              # datas, cálculo de idade, montagem do histórico vacinal
│   ├── main.py                 # monta a aplicação e registra as rotas
│   └── routers/
│       ├── auth.py             # login e cadastro (paciente, profissional, unidade)
│       ├── patients.py          # perfil do paciente + busca/listagem pelo profissional
│       ├── professionals.py      # perfil do profissional autenticado + confirmação de CRM/COREN
│       ├── vaccines.py             # catálogo de vacinas
│       ├── vaccinations.py          # registrar/consultar doses aplicadas
│       ├── appointments.py           # agenda
│       ├── health_units.py            # unidades de saúde (mapa)
│       ├── queue.py                    # fila pública de vacinação (triagem)
│       ├── campaigns.py                 # campanhas vacinais ativas
│       └── stock.py                      # estoque de vacinas
├── database/
│   └── schema.sql        # DDL de referência para MySQL
├── seed.py                # dados de demonstração
├── requirements.txt
└── .env.example
```

## Decisões de escopo (documentadas para manutenção futura)

- **Pendências e atrasos de vacina** não vêm de uma tabela própria de
  "calendário vacinal previsto" (o schema original não tinha uma). Em vez
  disso, reaproveitamos `appointments` com `vaccine_id` preenchido: uma
  consulta futura agendada = dose "pendente"; se a data já passou e ela
  continua `scheduled` = "atrasada". Doses realmente aplicadas continuam
  em `vaccination_records`. Ver `app/utils.py::build_patient_vaccine_history`.
- **`campaigns` e `stock_items`** não existiam no `schema.sql` original —
  foram acrescentadas (aqui e no `.sql`) porque a tela da home do
  profissional já esperava esses dados.
- **Fabricantes de vacina** (`availableManufacturers` no front-end) seguem
  como uma lista estática no app: não é uma entidade que precisa de
  persistência própria, só um auxílio de preenchimento do formulário.
- **Cadastro de profissional** fica com `verification_status = 'pending'`
  por padrão — a ideia é que uma tela/rotina de aprovação por um admin possa
  ser adicionada depois sem quebrar nada (hoje o login não bloqueia por
  causa disso, mas o campo já existe pronto para essa evolução).
- **Vínculo profissional ↔ unidade de saúde (Rede Privada)** — o campo
  "Instituição" da tela de login do profissional, que antes era apenas
  exibido sem validação, agora é obrigatório para `network_type = 'private'`
  e conferido contra `professional_health_units` / `health_units` no
  endpoint `POST /auth/professional/login`. Os estabelecimentos continuam
  fictícios (criados no cadastro via `_get_or_create_unit` ou no `seed.py`);
  não há um diretório real de instituições — a "ligação" é feita pelo nome
  já cadastrado.
- **Unidade de saúde no registro de vacinação** — antes, o campo "Local de
  aplicação" da tela de Registrar Vacinação era puramente decorativo: o
  texto digitado nunca era enviado nem validado, e o backend sempre gravava
  a unidade vinculada ao profissional (`_professional_active_unit`),
  independente do que aparecia na tela. Agora isso é resolvido de ponta a
  ponta:
  - `GET /professionals/me` retorna `healthUnitId`, usado pelo front-end
    para pré-preencher/travar o campo com a unidade real do profissional.
  - `POST /professionals/me/verify-registry` confere se o CRM/COREN
    reenviado bate com o cadastro do profissional autenticado — é a
    "certificação" que libera a troca de unidade na tela. Não substitui o
    login (o token JWT continua sendo a autenticação), é apenas uma
    segunda confirmação explícita antes de uma ação sensível.
  - `POST /vaccinations` passa a receber `healthUnitId` (opcional; se
    omitido, usa a unidade do profissional) em vez do antigo `location`
    de texto livre. O backend sempre valida que o `healthUnitId` recebido
    corresponde a uma unidade ativa cadastrada em `health_units` — nunca
    aceita texto arbitrário — então o registro só é possível com uma
    unidade de saúde válida.

## Rotas principais

Veja a lista completa e testável em `/docs`. Resumo:

| Rota | Quem acessa | O que faz |
|---|---|---|
| `POST /auth/patient/register/sus` `/private` | público | cadastro de paciente |
| `POST /auth/patient/login` | público | login do paciente |
| `POST /auth/professional/register` | público | cadastro de profissional |
| `POST /auth/professional/login` | público | login do profissional (Rede Privada exige `institution`) |
| `POST /auth/unit/login` | público | login da unidade (triagem) |
| `GET /patients/me` | paciente | próprio histórico vacinal |
| `GET /patients`, `/patients/search`, `/patients/{id}` | profissional | listar/buscar/abrir paciente |
| `GET /professionals/me` | profissional | perfil autenticado (inclui `healthUnitId`) |
| `POST /professionals/me/verify-registry` | profissional | confirma CRM/COREN para liberar troca de unidade no registro de vacinação |
| `GET /vaccines` | qualquer autenticado | catálogo de vacinas |
| `POST /vaccinations` | profissional | registrar dose aplicada (usa `healthUnitId`, com fallback para a unidade do profissional) |
| `GET /appointments` | profissional | agenda |
| `PATCH /appointments/{id}` | profissional | atualizar status da consulta |
| `GET /health-units` | público | unidades para o mapa e para seleção no registro de vacinação |
| `GET /queue`, `POST /queue`, `POST /queue/{id}/call`, `DELETE /queue/{id}` | unidade/profissional | fila pública |
| `GET /campaigns`, `GET /stock` | profissional | campanhas e estoque da unidade |