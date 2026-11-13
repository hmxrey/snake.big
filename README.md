# Snake Arena

Jogo clássico estilo **Snake (Cobrinha)** desenvolvido em **HTML5, CSS3 e JavaScript puros**, sem necessidade de frameworks ou etapa de build.

**Criado por Ivo Ribeiro**

---

## Funcionalidades

- **6 níveis com dificuldade progressiva:** cada fase traz aumento de velocidade e um novo layout de obstáculos seguros no tabuleiro `20×20`:
  1. **Campo Aberto** — Arena livre (meta: 50 pts)
  2. **Quatro Pilares** — Pilares simétricos nos quadrantes (meta: 120 pts)
  3. **Corredores** — Barreiras horizontais em faixas (meta: 210 pts)
  4. **Cruzamentos** — Eixos verticais e bloqueios laterais (meta: 320 pts)
  5. **Cantoneiras** — Cantos fechados em L e torres centrais (meta: 450 pts)
  6. **Fortaleza (Infinito)** — Arena avançada com aceleração progressiva a cada 50 pontos extras
- **Maçã Dourada (Bônus):** aparece periodicamente a partir do Nível 2 por tempo limitado (+30 pts).
- **Controles intuitivos:**
  - **Teclado:** Setas (`↑ ↓ ← →`) ou `W A S D`, `Espaço` / `P` para pausar e `M` para silenciar o áudio.
  - **Celular / Tablet:** gestos de deslize (*swipe*) diretamente sobre o tabuleiro e D-Pad tátil na tela.
- **Identificação do jogador, Progresso Salvo e Ranking local:**
  - Campo obrigatório de nome antes de iniciar a partida.
  - **Progresso de níveis salvo:** ao passar de fase, o nível desbloqueado fica salvo por jogador no `localStorage`, permitindo retomar diretamente da fase alcançada ou escolher qualquer nível já desbloqueado (com opção de resetar o progresso).
  - Top 10 salvo automaticamente no `localStorage` exibindo posição, nome, nível alcançado e pontuação.
- **Efeitos sonoros sintetizados:** áudio leve via *Web Audio API* sem arquivos externos.

---

## Estrutura do Projeto

```text
snake-arena/
├── index.html   # Estrutura semântica da aplicação
├── style.css    # Estilização responsiva e tema escuro
├── script.js    # Motor do jogo, níveis, controles e ranking
└── README.md    # Documentação do projeto
```

---

## Como Executar Localmente

Como o projeto utiliza apenas arquivos estáticos, você tem duas opções simples:

### Opção 1 — Abrir diretamente no navegador
1. Baixe ou clone este repositório.
2. Dê um duplo clique no arquivo `index.html` para abri-lo diretamente no navegador.

### Opção 2 — Servidor local (recomendado para testes)
No terminal, dentro da pasta do projeto, execute:

```bash
# Usando Python 3
python3 -m http.server 8080

# Ou usando Node.js (npx)
npx serve .
```

Depois acesse `http://localhost:8080` (ou a porta exibida no terminal).

---

## Como Publicar no GitHub e na Vercel

### 1. Subir para o GitHub
1. Crie um novo repositório no [GitHub](https://github.com/new) (por exemplo, `snake-arena`).
2. No terminal, dentro da pasta do projeto, execute:

```bash
git init
git add index.html style.css script.js README.md
git commit -m "feat: jogo Snake Arena com 6 níveis e ranking local"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/snake-arena.git
git push -u origin main
```

### 2. Deploy Estático na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
2. Clique em **Add New... → Project** e selecione o repositório `snake-arena`.
3. Em **Framework Preset**, mantenha **Other** (sem build command e com Output Directory padrão `.`).
4. Clique em **Deploy**.

Em poucos segundos o jogo estará publicado com URL HTTPS pronta para jogar em desktop e celular.
