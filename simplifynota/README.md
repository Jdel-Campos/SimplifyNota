# RECIBOS – Gerador de Recibos Profissionais (Next.js)

> Gerador de recibos corporativos com preview A4 1:1, exportação em PDF e fluxo otimizado para padronização, agilidade operacional e governança de dados (pagador, recebedor, retenções, referências internas etc.).

> **Jornada:** preencha → visualize no A4 → gere o PDF com timbrado e áreas seguras.
Totalmente responsivo, com accordions controlados e automações de campos-chave (nº do recibo, OS/PO, ref. interna, centro de custos).

---

## 🔥 Principais diferenciais

- **Preview A4** 1:1 com o PDF (mesmo timbrado, mesma área segura).
- **PDF** com `jsPDF`, timbrado aplicado como **background** (fill).
- **Form em accordions controlados**:
  - “Informações principais”, “Data e horário” e “Localização” (abertos por padrão).
  - “Pagamento & Preferências” fecha os demais ao abrir e faz *auto-scroll* para o topo do bloco.
- **Campos automáticos** (não editáveis):
  - **Nº do recibo** (`/api/receipts/next-number` com fallback local).
  - **OS/PO**, **Ref. interna** e **Centro de custo** (helpers).
- **Modo avançado** opcional:
  - **Fornecedor & Retenções** (toggle): contatos, dados bancários, IE/IM, classificação, condições comerciais, dados para NF, horários.
  - **Retenções** (ISS/INSS/IRRF/Outras) com header e ícone.
- **Moeda por extenso** (pt-BR) com `extenso`.
- **Acessibilidade & UX**: labels com ícones, foco, responsividade first-class.
- **Arquitetura modular** (features, widgets, shared, entities) → manutenção simples.

---

## 🧱 Stack

- **Next.js** (App Router)
- **React + TypeScript**
- **TailwindCSS**
- **jsPDF**
- **lucide-react**
- **Zustand**
- **zod**
- **extenso**

---

## 🗂️ Estrutura de pastas (resumo)

src/
  app/
    page.tsx
  features/
    create-receipt/ui/receipt-form.tsx
    generate-pdf/lib/generate-pdf.ts
  widgets/
    receipt-preview/receipt-preview.tsx
  shared/
    lib/
      currency.ts
      letterhead.ts
      ids.ts
      cost-center.ts
      receipt-text.ts
    state/receipt-store.ts
    types/receipt.ts
    ui/
      button.tsx
      card.tsx
      input.tsx
      label.tsx
      textarea.tsx
      select.tsx
  entities/
    receipts/schema.ts
public/
  letterhead/a4.png
styles/
  global.css

---

## ▶️ Rodando local

Pré-requisitos: Node 18+, PNPM (ou Yarn/NPM).

pnpm install
pnpm dev
# http://localhost:3000


Build & produção:

pnpm build
pnpm start


--

## 🧩 Assets & Configuração

*Timbrado:* coloque o arquivo em public/letterhead/a4.png.
A função loadLetterheadA4DataURL(LETTERHEAD_PATH, "fill") aplica como background preenchendo 100% da página.
*Área segura:* ajustável em SAFE_MM/SAFE_PX (margens do PDF/preview).
*CSS:* o global.css define:
.a4 e .a4-inner para manter proporção 210×297
html { scroll-behavior: smooth; } (recomendado)
tokens e utilitários


---

🧠 Fluxo de dados

- Form (ReceiptForm) controla o estado local e sincroniza o global (useReceiptStore.setAll).
- Preview (ReceiptPreview) lê o estado do store e renderiza o layout A4.
- PDF (generatePDF) usa jsPDF:
    insere o timbrado
    imprime os parágrafos e a assinatura respeitando SAFE_MM
    salva recibo.pdf


---

## 🤖 Automação de campos

- **Nº do recibo:** GET /api/receipts/next-number (implemente no seu backend).
- **Fallback:** REC-YYYY-MMDD-XXXX.
- **OS/PO:** generateLocalOS() (ex.: OS-2025-0001).
- **Ref. interna:** generateInternalRef(eventName, eventDate) (ex.: EVT-2411-ACME).
- **Centro de custo:** resolveCostCenter(eventName, eventDate) – heurística simples (personalize).

- *Esses campos não aparecem no form e são preenchidos e salvos automaticamente.*
- *O recebedor (Nome + CPF/CNPJ) pode vir pré-preenchido do banco via prop initialPayee.*


---

## 🧾 Tipo Receipt (essencial)

*shared/types/receipt.ts consolida o dado do recibo. Campos chave:*
- **Core:** client, eventName, value/rawValue, eventDate, startTime, endTime, eventLocation, city, jobDescription, valueInWords.
- **Metadados:** receiptNumber, issueDate, paymentMethod, paymentDate, purchaseOrder, costCenter, internalRef.
- **Recebedor:** payeeName, payeeCpfCnpj (+ opcionais de endereço).
- **Supplier (opcional):** contatos, bancários, inscrições, classificação, condições comerciais, dados NF, disponibilidade.
- **Taxes (opcional):** iss, inss, irrf, other.
- **Flags:** enableSupplierDetails, enableTaxes, showNFNote.


---

## 🧑‍💻 UI/UX que importam

- **Accordions controlados:**
    *“Pagamento & Preferências” fecha os demais e faz auto-scroll para o topo do bloco (evita “fundo sobrando” no preview).*

- **Mobile:** grids pivotam para 1 coluna (grid-cols-1 md:grid-cols-2), e spans que devem ocupar a linha inteira usam md:col-span-2.
    *Atenção a typos (sm-col-span-2 ❌ → sm:col-span-2 ✅).*

- **Acessibilidade:** labels visíveis, required, inputMode adequado, ícones contextuais (IdCard no CPF/CNPJ, Percent em Retenções etc.).


---

## 🌐 Endpoints esperados

POST /api/receipts – persiste o recibo (e.g., DB).
GET /api/receipts/next-number – responde { number: "REC-2025-0012" }.

*Você pode mockar esses endpoints durante o desenvolvimento.*


---

## 🧪 Qualidade & Padrões

- zod valida os campos no submit.
- TypeScript strict recomendado.
- ESLint + Prettier (configure conforme seu padrão).
- Commits: conventional commits (sugestão).


---

## Deploy

- Vercel é plug-and-play para Next.js.
- Garanta que public/letterhead/a4.png está versionado ou injetado via deploy pipeline.
- Configure variáveis/URLs dos seus endpoints (se externos).


## 🛣️ Roadmap sugerido

    Multi-itens na “tabela” (hoje 1 item → valor bruto).
    Assinatura digital (e.g., campo de assinatura no preview/PDF).
    Temas de timbrado por empresa/unidade.
    Webhooks pós-geração (ex.: enviar PDF por e-mail).
    Auditoria e trilha de alterações do recibo.


## ⚠️ Compliance

Recibo ≠ Nota Fiscal. O rodapé reforça a obrigatoriedade legal de emissão de NF quando aplicável.
LGPD: campos de fornecedor são opcionais; colete e armazene só o necessário, com consentimento e política clara.


## 📝 Licença

MIT — use à vontade, só não culpe o bot se o seu timbrado ficar lindo demais.


## 👤 Autoria & Próximos passos

Arquitetado para fluxos enterprise, com pegada developer-first. Feedbacks e PRs são bem-vindos.
Para acelerar time-to-value no mundo real:

- Integre initialPayee ao seu user service.
- Conecte o POST /api/receipts ao seu banco (Mongo/Postgres).
- Evolua o preview/PDF para multi-itens.

*Resultado:* padronização forte, single source of truth de recibos e compliance no bolso.