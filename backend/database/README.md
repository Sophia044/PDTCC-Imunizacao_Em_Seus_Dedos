# Banco de Dados - VacinApp

Esta pasta guarda os scripts oficiais do banco de dados do projeto.

## Como executar no MySQL Workbench

1. Abra o MySQL Workbench.
2. Entre na conexao local, normalmente `Local instance MySQL80`.
3. Clique em `File > Open SQL Script`.
4. Selecione `backend/database/schema.sql`.
5. Clique no raio amarelo para executar o script.
6. No painel `Schemas`, clique com o botao direito e escolha `Refresh All`.
7. Confira se o banco `vacinapp` apareceu com as tabelas.

## Estrutura inicial

- `users`: login base de pacientes, profissionais e administradores.
- `patients`: pacientes da rede publica ou privada.
- `professionals`: profissionais de saude.
- `health_units`: UBS, postos, hospitais e clinicas.
- `health_unit_users`: usuarios institucionais da triagem/unidade.
- `professional_health_units`: vinculo entre profissional e unidade.
- `vaccines`: catalogo de vacinas.
- `vaccination_records`: historico real de vacinacao do paciente.
- `appointments`: agenda de vacinacao.
- `public_queue`: fila de atendimento da rede publica.

## Observacao importante

O app mobile nao deve conectar diretamente no MySQL. O fluxo correto sera:

```txt
React Native / Expo -> Backend Python -> MySQL
```

Assim as senhas, permissoes e regras do banco ficam protegidas no backend.
