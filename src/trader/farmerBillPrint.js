// =============================================================================
// शेतकरी हिशेब पट्टी — farmer bill print (same text & layout as the app's PDF)
// Half A4 landscape (A5 landscape). Opens a print window; "Save as PDF" also works.
// data = result of broker_web_make_farmer_bill / broker_web_farmer_bill_print
// data.texts = the mandi's changed words (table bill_text); missing → original
// =============================================================================

import { mergeBillTexts } from './billTexts'

const ROWS_PER_PAGE = 13

const n = (v) => Number(v) || 0
const m2 = (v) => n(v).toFixed(2)
const kg = (v) => (n(v) === Math.round(n(v)) ? String(Math.round(n(v))) : n(v).toFixed(1))
const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])
const mrDigits = (s) => String(s).replace(/[0-9]/g, (d) => '०१२३४५६७८९'[d])
const dmy = (d) => {
  const p = String(d || '').slice(0, 10).split('-')
  return p.length === 3 && p[0].length === 4 ? `${p[2]}/${p[1]}/${p[0]}` : String(d || '')
}
/** "Bora Corporation", 145 → "BC/145" */
const pattiNo = (firm, no) => {
  const ini = String(firm || '')
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .map((w) => w[0].toUpperCase())
    .slice(0, 3)
    .join('')
  return ini ? `${ini}/${no}` : String(no)
}

function page(d, t, rows, last, pageNo, pageCount) {
  const T = (k) => esc(t[k])
  const body = rows
    .map(
      (r) => `<tr>
      <td class="l">${esc(String(r.commodity_name || '-').toUpperCase())}</td>
      <td class="l">${esc(String(r.buyer_name || '-').toUpperCase())}</td>
      <td>${n(r.number_of_bags)}</td>
      <td>${n(r.chungad_weight_kg) > 0 ? kg(r.chungad_weight_kg) : ''}</td>
      <td class="c">${n(r.bag_weight_kg) > 0 ? kg(r.bag_weight_kg) : ''}</td>
      <td>${n(r.total_weight_quintal).toFixed(2)}</td>
      <td>${n(r.rate_per_quintal) === Math.round(n(r.rate_per_quintal)) ? Math.round(n(r.rate_per_quintal)) : m2(r.rate_per_quintal)}</td>
      <td>${m2(r.gross_amount)}</td>
    </tr>`,
    )
    .join('')
  const empty = Array.from({ length: Math.max(0, ROWS_PER_PAGE - rows.length) }, () => '<tr class="e">' + '<td></td>'.repeat(8) + '</tr>').join('')

  const totalRow = last
    ? `<tr class="tot"><td></td><td class="r"><b>${T('total')}</b></td><td>${d.totalBags}</td><td>${d.totalLoose > 0 ? kg(d.totalLoose) : ''}</td><td></td>
       <td>${d.totalQtl.toFixed(2)}</td><td></td><td>${m2(d.gross)}</td></tr>`
    : `<tr class="tot"><td></td><td class="r" colspan="7">${T('continued')} (${pageNo}/${pageCount})</td></tr>`

  const footer = last
    ? `<div class="foot">
        <div class="charges">
          <div><span>${T('utrai')}</span><span>${m2(d.utrai)}</span></div>
          <div><span>${T('mapai')}</span><span>${m2(d.mapai)}</span></div>
          <div><span>${T('hamali')}</span><span>${m2(d.hamali)}</span></div>
          ${d.other > 0.009 ? `<div><span>${T('mandiCharge')}</span><span>${m2(d.other)}</span></div>` : ''}
          <div><span>${T('expenses')}</span><span>${m2(d.expenses)}</span></div>
        </div>
        <div class="mid">
          <div>${T('received')}</div>
          <div class="sign">
            <div><span>${T('signFarmer')}</span><small>${T('amountLabel')} 0.00</small></div>
            <div><span>${T('signBroker')}</span><small>${T('cheque')}</small></div>
            <div class="mode">${esc(d.mode)}</div>
          </div>
        </div>
        <div class="totals">
          <div><span>${T('rExpenses')}</span><span>${m2(d.expenses)}</span></div>
          <div class="ln"><span>${T('rAmount')}</span><span>${m2(d.amount)}</span></div>
          <div><span>${T('rAdvance')}</span><span>${m2(0)}</span></div>
          <div class="ln big"><span>${T('rNet')}</span><b>${m2(d.amount)}</b></div>
        </div>
      </div>`
    : ''

  return `<section class="pg">
    <div class="h1">${esc(d.line1)}</div>
    ${d.line2 ? `<div class="h2">${esc(d.line2)}</div>` : ''}
    ${d.address ? `<div class="h3">${esc(d.address)}</div>` : ''}
    <div class="h4">${T('subtitle')}</div>
    <div class="info">
      <div class="row"><span><b>${T('brokerLabel')}</b> ${esc(d.brokerLine)}</span><span>${T('pattiLabel')} ${esc(d.pattiNo)}</span></div>
      <div class="row"><span><b>${T('farmerLabel')}</b> <big>${esc(d.farmer)}</big></span>
        <span>${T('villageLabel')} <big><b>${esc(d.village)}</b></big></span><span>${T('dateLabel')} ${esc(d.date)}</span></div>
    </div>
    <table>
      <thead>
        <tr><th rowspan="2">${T('colCommodity')}</th><th rowspan="2">${T('colBuyer')}</th><th colspan="2">${T('colBagsGroup')}</th>
            <th rowspan="2">${T('colBagKg')}</th><th>${T('colWeight1')}</th><th rowspan="2">${T('colRate')}</th><th rowspan="2">${T('colAmount')}</th></tr>
        <tr><th>${T('colBags')}</th><th>${T('colLoose')}</th><th>${T('colWeight2')}</th></tr>
      </thead>
      <tbody>${body}${empty}</tbody>
      <tfoot>${totalRow}</tfoot>
    </table>
    ${footer}
  </section>`
}

const STYLE = `
    @page { size: A5 landscape; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Noto Sans Devanagari', system-ui, sans-serif; color: #000; background: #e5e7eb; }
    .pg { width: 210mm; height: 148mm; padding: 4mm 8mm; background: #fff; margin: 0 auto 8mm; page-break-after: always; overflow: hidden; display: flex; flex-direction: column; }
    .pg:last-child { page-break-after: auto; }
    .h1 { text-align: center; font-weight: 700; font-size: 13pt; line-height: 1.2; }
    .h2 { text-align: center; font-weight: 700; font-size: 11pt; line-height: 1.2; }
    .h3 { text-align: center; font-size: 8.5pt; }
    .h4 { text-align: center; font-size: 7.5pt; border-bottom: 1px solid #000; padding-bottom: 2px; }
    .info { font-size: 9pt; padding: 3px 0; }
    .info .row { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
    .info big { font-size: 11pt; }
    table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
    th, td { border-left: 1px solid #000; border-right: 1px solid #000; padding: 1px 4px; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    th { border: 1px solid #000; font-weight: 400; font-size: 7pt; text-align: center; white-space: normal; line-height: 1.15; }
    td.l { text-align: left; max-width: 38mm; } td.c { text-align: center; } td.r { text-align: right; }
    tbody td { height: 4.4mm; } tr.e td { height: 4.4mm; }
    tfoot td { border: 1px solid #000; font-size: 8.5pt; }
    .foot { display: grid; grid-template-columns: 1.1fr 1.3fr 1.2fr; gap: 6px; font-size: 8.5pt; padding-top: 4px; border-bottom: 1px solid #000; padding-bottom: 4px; }
    .charges div, .totals div { display: flex; justify-content: space-between; gap: 8px; line-height: 1.45; }
    .totals .ln { border-top: 1px solid #000; }
    .totals .big b { font-size: 12pt; }
    .sign { display: flex; gap: 14px; align-items: flex-start; margin-top: 18px; }
    .sign div { display: grid; text-align: center; }
    .sign small { font-size: 7.5pt; margin-top: 4px; }
    .sign .mode { font-size: 13pt; font-weight: 700; }
    .bar { position: sticky; top: 0; background: #0e7490; color: #fff; padding: 8px; text-align: center; font-family: system-ui; }
    .bar button { font: inherit; font-weight: 700; padding: 6px 16px; border-radius: 8px; border: 0; cursor: pointer; }
    @media print { body { background: #fff; } .pg { margin: 0; } .bar { display: none; } }
  `

/** html of all pages of ONE bill */
export function farmerBillPages(data) {
  const lines = data?.lines || []
  const b = data?.bill || {}
  const br = data?.broker || {}
  const md = data?.mandi || {}
  const firm = br.firm || br.name || '-'
  const phone = String(br.phone || '').replace('+91', '').trim()
  const sum = (k) => lines.reduce((s, l) => s + n(l[k]), 0)
  const utrai = sum('utrai_amount')
  const mapai = sum('mapai_amount')
  const hamali = sum('hamali_amount')
  const expenses = sum('mandi_charge_amount')
  const gross = sum('gross_amount')

  const t = mergeBillTexts('farmer', data?.texts)
  const d = {
    line1: t.header1 || md.line1 || md.name || '',
    line2: t.header2 || md.line2 || '',
    address: t.address || md.address || '',
    brokerLine: phone ? `${firm} ${mrDigits(phone)}` : firm,
    pattiNo: pattiNo(firm, b.bill_no),
    farmer: String(b.farmer_name || '').toUpperCase(),
    village: String(lines.find((l) => l.village)?.village || '-').toUpperCase(),
    date: dmy(b.bill_date),
    mode: String(b.payment_mode || 'CASH').toUpperCase(),
    utrai,
    mapai,
    hamali,
    other: Math.max(0, expenses - utrai - mapai - hamali),
    expenses,
    gross,
    amount: gross - expenses,
    totalBags: lines.reduce((s, l) => s + n(l.number_of_bags), 0),
    totalLoose: sum('chungad_weight_kg'),
    totalQtl: sum('total_weight_quintal'),
  }

  const pages = []
  for (let i = 0; i < lines.length; i += ROWS_PER_PAGE) pages.push(lines.slice(i, i + ROWS_PER_PAGE))
  if (!pages.length) pages.push([])

  return `${pages.map((p, i) => page(d, t, p, i === pages.length - 1, i + 1, pages.length)).join('')}`
}

/** Whole html page for many bills. print = add the Print bar and open the print box. */
export function farmerBillsHtml(list, title = 'Bills', print = true) {
  return `<!doctype html><html><head><meta charset="utf-8">
  <title>${esc(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
  <style>${STYLE}</style></head><body>
  ${print ? '<div class="bar"><button onclick="window.print()">Print / Save PDF</button></div>' : ''}
  ${list.map((d) => farmerBillPages(d)).join('')}
  ${print ? '<script>document.fonts && document.fonts.ready.then(function(){ setTimeout(function(){ window.print() }, 300) })</script>' : ''}
  </body></html>`
}

/** Prints many bills in one window (one after another). Returns false if pop-ups are blocked. */
export function printFarmerBills(list, win, title = 'Bills') {
  const html = farmerBillsHtml(list, title, true)
  const w = win || window.open('', '_blank', 'width=1000,height=800')
  if (!w) return false
  w.document.open()
  w.document.write(html)
  w.document.close()
  return true
}

export function printFarmerBill(data, win) {
  return printFarmerBills([data], win, 'Farmer_Bill_' + (data?.bill?.bill_no ?? ''))
}
