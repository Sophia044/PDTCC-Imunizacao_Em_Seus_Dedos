"""
app/utils/validar_crm.py
========================
Utilitário para validação de CRM de médicos consultando o portal
oficial do CFM (https://portal.cfm.org.br/busca-medicos).

Estratégia dupla:
    1. Intercepta a resposta XHR/Fetch que o próprio portal dispara
       durante a busca — captura o JSON bruto diretamente (mais rápido).
    2. Se nenhuma resposta de API for capturada, faz fallback para
       extração via DOM (parsing do HTML renderizado pelo Playwright).

Dependências extras (adicionar ao requirements.txt):
    playwright==1.45.0
    playwright install chromium   ← rode uma vez no terminal

Integração FastAPI:
    from app.utils.validar_crm import validar_crm
    resultado = await asyncio.get_event_loop().run_in_executor(
        None, validar_crm, "123456", "SP"
    )
"""

import asyncio
import re
from dataclasses import asdict, dataclass, field
from typing import Optional

from playwright.async_api import Page, Response, async_playwright

# ---------------------------------------------------------------------------
# Modelo de retorno estruturado
# ---------------------------------------------------------------------------

@dataclass
class ResultadoCRM:
    """Estrutura de dados com o resultado da consulta de CRM no CFM."""
    valido: bool
    nome: Optional[str] = None
    situacao: Optional[str] = None
    especialidades: list[str] = field(default_factory=list)
    crm: Optional[str] = None
    uf: Optional[str] = None
    erro: Optional[str] = None

    def to_dict(self) -> dict:
        """Converte o resultado para um dicionário simples."""
        return asdict(self)


# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------

PORTAL_URL = "https://portal.cfm.org.br/busca-medicos/"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/125.0.0.0 Safari/537.36"
)

TIMEOUT_MS = 45_000  # 45 segundos


# ---------------------------------------------------------------------------
# Lógica principal (assíncrona — usada internamente)
# ---------------------------------------------------------------------------

async def _validar_crm_async(crm: str, uf: str) -> ResultadoCRM:
    """
    Consulta o portal do CFM e retorna os dados cadastrais do médico.

    Parâmetros:
        crm: Número do CRM (somente dígitos ou com prefixo "CRM/XX-").
        uf:  Sigla do estado, ex: "SP", "RJ", "MG".
    """
    # --- Normalização ---
    crm_numero = re.sub(r"\D", "", crm).strip()
    uf_sigla = uf.strip().upper()

    if not crm_numero:
        return ResultadoCRM(
            valido=False,
            erro="Número de CRM inválido: informe somente os dígitos.",
        )
    if len(uf_sigla) != 2:
        return ResultadoCRM(
            valido=False,
            erro=f"UF inválida: '{uf_sigla}'. Use a sigla de 2 letras (ex: SP).",
        )

    captured_api_response: dict = {}

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                # Reduz a probabilidade de detecção como bot
                "--disable-blink-features=AutomationControlled",
            ],
        )
        context = await browser.new_context(
            user_agent=USER_AGENT,
            locale="pt-BR",
            timezone_id="America/Sao_Paulo",
        )
        page: Page = await context.new_page()

        # ------------------------------------------------------------------
        # Interceptação de rede — captura a resposta JSON da API interna
        # ------------------------------------------------------------------
        async def on_response(response: Response):
            nonlocal captured_api_response
            url = response.url
            content_type = response.headers.get("content-type", "")

            is_ajax = "admin-ajax.php" in url
            is_api_busca = any(p in url for p in ["/busca", "/medico", "/crm"])
            is_json = "json" in content_type

            if (is_ajax or is_api_busca) and is_json:
                try:
                    body = await response.json()
                    if isinstance(body, dict) and (
                        "data" in body or "medico" in str(body).lower()
                    ):
                        captured_api_response = body
                except Exception:
                    pass

        page.on("response", on_response)

        try:
            # ---------------------------------------------------------------
            # Passo 1 — Carregar a página
            # ---------------------------------------------------------------
            await page.goto(
                PORTAL_URL, wait_until="domcontentloaded", timeout=TIMEOUT_MS
            )
            await page.wait_for_load_state("networkidle", timeout=TIMEOUT_MS)

            # ---------------------------------------------------------------
            # Passo 2 — Preencher campo CRM
            # Múltiplos seletores para tolerância a mudanças no portal.
            # ---------------------------------------------------------------
            crm_selectors = [
                "input[name='crm']",
                "input[id*='crm']",
                "input[placeholder*='CRM']",
                "input[placeholder*='crm']",
                "#crm",
                ".campo-crm input",
            ]
            for sel in crm_selectors:
                try:
                    el = page.locator(sel).first
                    if await el.is_visible(timeout=3000):
                        await el.fill(crm_numero)
                        break
                except Exception:
                    continue
            else:
                # Fallback: primeiro input de texto visível
                inputs = await page.locator("input[type='text']").all()
                if inputs:
                    await inputs[0].fill(crm_numero)

            # ---------------------------------------------------------------
            # Passo 3 — Selecionar UF
            # ---------------------------------------------------------------
            uf_selectors = [
                "select[name='uf']",
                "select[id*='uf']",
                "select[id*='estado']",
                "#uf",
                ".campo-uf select",
            ]
            for sel in uf_selectors:
                try:
                    el = page.locator(sel).first
                    if await el.is_visible(timeout=3000):
                        await el.select_option(value=uf_sigla)
                        break
                except Exception:
                    continue

            # ---------------------------------------------------------------
            # Passo 4 — Submeter o formulário
            # ---------------------------------------------------------------
            submit_selectors = [
                "button[type='submit']",
                "input[type='submit']",
                "button:has-text('Buscar')",
                "button:has-text('Pesquisar')",
                ".btn-busca",
                "#btn-buscar",
            ]
            submitted = False
            for sel in submit_selectors:
                try:
                    btn = page.locator(sel).first
                    if await btn.is_visible(timeout=3000):
                        await btn.click()
                        submitted = True
                        break
                except Exception:
                    continue

            if not submitted:
                # Fallback: Enter no campo CRM
                for sel in crm_selectors:
                    try:
                        await page.press(sel, "Enter")
                        break
                    except Exception:
                        continue

            # ---------------------------------------------------------------
            # Passo 5 — Aguardar resultados
            # ---------------------------------------------------------------
            await page.wait_for_load_state("networkidle", timeout=TIMEOUT_MS)
            await asyncio.sleep(2)  # aguarda carregamento dinâmico

            # ---------------------------------------------------------------
            # Passo 6a — Processar via API interceptada (preferencial)
            # ---------------------------------------------------------------
            if captured_api_response:
                return _parse_api_response(captured_api_response, crm_numero, uf_sigla)

            # ---------------------------------------------------------------
            # Passo 6b — Fallback: extração via DOM
            # ---------------------------------------------------------------
            return await _parse_dom_results(page, crm_numero, uf_sigla)

        except asyncio.TimeoutError:
            return ResultadoCRM(
                valido=False,
                crm=crm_numero,
                uf=uf_sigla,
                erro="Timeout: o portal do CFM não respondeu no tempo esperado.",
            )
        except Exception as exc:
            return ResultadoCRM(
                valido=False,
                crm=crm_numero,
                uf=uf_sigla,
                erro=f"Erro inesperado: {type(exc).__name__}: {exc}",
            )
        finally:
            await browser.close()


# ---------------------------------------------------------------------------
# Parsers de resposta
# ---------------------------------------------------------------------------

def _parse_api_response(data: dict, crm: str, uf: str) -> ResultadoCRM:
    """
    Analisa a resposta JSON capturada da API interna do portal do CFM.
    Tolerante a diferentes estruturas (WordPress AJAX, REST, etc.).
    """
    try:
        medico: dict = {}

        # Estrutura WordPress AJAX: {"success": true, "data": {...}}
        if "data" in data:
            payload = data["data"]
            if isinstance(payload, list) and payload:
                medico = payload[0]
            elif isinstance(payload, dict):
                for chave in ("medicos", "results", "items", "registros"):
                    if chave in payload and payload[chave]:
                        medico = payload[chave][0]
                        break
                if not medico:
                    medico = payload

        if not medico:
            return ResultadoCRM(
                valido=False, crm=crm, uf=uf,
                erro="Médico não encontrado na resposta da API.",
            )

        # Chaves alternativas (tolerância a mudanças no backend do CFM)
        nome = (
            medico.get("nome")
            or medico.get("name")
            or medico.get("nomeMedico")
            or medico.get("nomeCompleto")
        )
        situacao = (
            medico.get("situacao")
            or medico.get("situation")
            or medico.get("status")
            or medico.get("inscricao_situacao")
            or medico.get("situacaoDescricao")
        )
        especialidades_raw = (
            medico.get("especialidades")
            or medico.get("specialties")
            or medico.get("especialidade")
            or []
        )

        especialidades: list[str] = []
        if isinstance(especialidades_raw, list):
            for esp in especialidades_raw:
                if isinstance(esp, dict):
                    especialidades.append(
                        esp.get("descricao") or esp.get("nome") or str(esp)
                    )
                elif isinstance(esp, str):
                    especialidades.append(esp)
        elif isinstance(especialidades_raw, str):
            especialidades = [especialidades_raw]

        situacao_str = str(situacao or "").strip()
        # Válido = médico encontrado com situação "Regular" (ou sem info)
        valido = bool(nome) and (
            "regular" in situacao_str.lower() or situacao_str == ""
        )

        return ResultadoCRM(
            valido=valido,
            nome=nome,
            situacao=situacao_str or None,
            especialidades=especialidades,
            crm=crm,
            uf=uf,
        )
    except Exception as exc:
        return ResultadoCRM(
            valido=False, crm=crm, uf=uf,
            erro=f"Erro ao processar resposta da API: {exc}",
        )


async def _parse_dom_results(page: Page, crm: str, uf: str) -> ResultadoCRM:
    """
    Extrai dados do médico do DOM renderizado (fallback).
    Usado quando a interceptação de API não capturou nenhuma resposta.
    """
    try:
        html_content = await page.content()
        html_lower = html_content.lower()

        # Padrões que indicam que o médico não foi encontrado
        for padrao in [
            "nenhum médico encontrado",
            "nenhum resultado",
            "médico não encontrado",
            "não foi possível encontrar",
            "no results",
        ]:
            if padrao in html_lower:
                return ResultadoCRM(
                    valido=False, crm=crm, uf=uf,
                    erro="Médico não encontrado no portal do CFM.",
                )

        nome = None
        situacao = None
        especialidades: list[str] = []

        # Seletores de nome do médico
        for sel in [
            ".nome-medico", ".doctor-name", ".medico-nome",
            "h2.nome", "h3.nome", ".resultado-medico .nome",
            ".card-medico .nome", "td.nome", "[data-field='nome']",
        ]:
            try:
                el = page.locator(sel).first
                if await el.is_visible(timeout=2000):
                    nome = (await el.inner_text()).strip()
                    break
            except Exception:
                continue

        # Seletores de situação cadastral
        for sel in [
            ".situacao", ".situation", ".status-medico",
            ".inscricao-situacao", "[data-field='situacao']",
            "td.situacao", ".resultado-medico .situacao",
        ]:
            try:
                el = page.locator(sel).first
                if await el.is_visible(timeout=2000):
                    situacao = (await el.inner_text()).strip()
                    break
            except Exception:
                continue

        # Seletores de especialidades
        for sel in [
            ".especialidade", ".specialty", ".especialidades li",
            ".resultado-medico .especialidade",
        ]:
            try:
                els = await page.locator(sel).all()
                for el in els:
                    txt = (await el.inner_text()).strip()
                    if txt:
                        especialidades.append(txt)
                if especialidades:
                    break
            except Exception:
                continue

        # Regex fallback: tenta achar o nome logo após o número do CRM
        if not nome:
            match = re.search(
                rf"CRM[:\s]*{re.escape(crm)}[^\n]*\n([^\n]+)", html_content
            )
            if match:
                nome = match.group(1).strip()

        if not nome:
            return ResultadoCRM(
                valido=False, crm=crm, uf=uf,
                erro=(
                    "Não foi possível extrair dados via DOM. "
                    "O portal pode ter alterado sua estrutura."
                ),
            )

        situacao_str = str(situacao or "").strip()
        valido = "regular" in situacao_str.lower() or not situacao_str

        return ResultadoCRM(
            valido=valido,
            nome=nome,
            situacao=situacao_str or None,
            especialidades=especialidades,
            crm=crm,
            uf=uf,
        )
    except Exception as exc:
        return ResultadoCRM(
            valido=False, crm=crm, uf=uf,
            erro=f"Erro ao parsear DOM: {exc}",
        )


# ---------------------------------------------------------------------------
# Interface pública — wrapper síncrono (conveniência)
# ---------------------------------------------------------------------------

def validar_crm(crm: str, uf: str) -> dict:
    """
    Valida o CRM de um médico consultando o portal oficial do CFM.

    Parâmetros:
        crm (str): Número do CRM (ex: '123456' ou 'CRM/SP-123456').
        uf  (str): Sigla da UF (ex: 'SP', 'RJ', 'MG').

    Retorna:
        dict com as chaves:
            - "valido"         (bool)  — True se médico está ativo no CFM.
            - "nome"           (str)   — Nome completo do médico.
            - "situacao"       (str)   — Situação cadastral (ex: 'Regular').
            - "especialidades" (list)  — Lista de especialidades.
            - "crm"            (str)   — Número de CRM normalizado.
            - "uf"             (str)   — UF normalizada.
            - "erro"           (str)   — Mensagem de erro, se houver.

    Uso via FastAPI (dentro de um endpoint assíncrono):
        import asyncio
        from app.utils.validar_crm import validar_crm

        resultado = await asyncio.get_event_loop().run_in_executor(
            None, validar_crm, crm_numero, uf_sigla
        )
    """
    resultado = asyncio.run(_validar_crm_async(crm, uf))
    return resultado.to_dict()
