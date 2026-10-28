// =============================================================================
// शेत मालाचे बिल — broker → buyer bill print (same text & layout as the app's PDF)
// Half A4 portrait (A5 portrait). Opens a print window; "Save as PDF" also works.
// data = result of broker_web_make_buyer_bill / broker_web_buyer_bill_print
// data.texts = the mandi's changed words (table bill_text); missing → original
// =============================================================================

import { mergeBillTexts } from './billTexts'

const ROWS_PER_PAGE = 26

const n = (v) => Number(v) || 0
const m2 = (v) => n(v).toFixed(2)
const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])
const mrDigits = (s) => String(s).replace(/[0-9]/g, (d) => '०१२३४५६७८९'[d])
const dmy = (d) => {
  const p = String(d || '').slice(0, 10).split('-')
  return p.length === 3 && p[0].length === 4 ? `${p[2]}/${p[1]}/${p[0]}` : String(d || '')
}
const billNo = (firm, no) => {
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
      <td>${n(r.number_of_bags).toFixed(2)}</td>
      <td>${n(r.chungad_weight_kg).toFixed(1)}</td>
      <td>${n(r.bag_weight_kg) > 0 ? n(r.bag_weight_kg).toFixed(2) : ''}</td>
      <td>${n(r.weight_quintal).toFixed(2)}</td>
      <td>${m2(r.rate_per_quintal)}</td>
      <td>${m2(r.amount)}</td>
    </tr>`,
    )
    .join('')
  const empty = Array.from({ length: Math.max(0, ROWS_PER_PAGE - rows.length) }, () => '<tr class="e">' + '<td></td>'.repeat(7) + '</tr>').join('')

  const totalRow = last
    ? `<tr><td class="r"><b>${T('total')}</b></td><td>${d.totalBags.toFixed(2)}</td><td>${d.totalLoose.toFixed(1)}</td><td></td>
       <td>${d.totalQtl.toFixed(2)}</td><td></td><td>${m2(d.gross)}</td></tr>`
    : `<tr><td class="r" colspan="7">${T('continued')} (${pageNo}/${pageCount})</td></tr>`

  const footer = last
    ? `<div class="foot">
        <div>
          <div>${T('panLabel')} ${esc(d.pan)}</div>
          <div class="gap">${T('received')}</div>
          <div class="gap2">${T('signBuyer')}</div>
        </div>
        <div class="tot">
          <div><span>${T('brokerage')} :</span><span>${m2(d.brokerage)}</span></div>
          <div><span>${T('hamali')} :</span><span>${m2(0)}</span></div>
          ${d.tds > 0.009 ? `<div><span>${T('tds')} :</span><span>${m2(-d.tds)}</span></div>` : ''}
          <div class="big"><span>${T('grandTotal')} :</span><b>${m2(d.total)}</b></div>
          <div class="sign">${T('signBroker')}</div>
        </div>
      </div>`
    : ''

  return `<section class="pg">
    <div class="h1">${esc(d.line1)}</div>
    ${d.line2 ? `<div class="h2">${esc(d.line2)}</div>` : ''}
    ${d.address ? `<div class="h3">${esc(d.address)}</div>` : ''}
    <div class="h4">${T('subtitle')}</div>
    <div class="info">
      <div class="row"><span><b>${T('brokerLabel')} ${esc(d.brokerLine)}</b></span><span>${T('noLabel')} ${esc(d.billNo)}</span></div>
      <div class="row"><span><b>${T('buyerLabel')}</b> ${esc(d.buyer)}</span><span>${T('dateLabel')} ${esc(d.date)}</span></div>
    </div>
    <table>
      <thead><tr>
        <th>${T('colCommodity')}</th><th>${T('colBags')}</th><th>${T('colLoose')}</th><th>${T('colBagKg')}</th>
        <th>${T('colWeight1')}<br>${T('colWeight2')}</th><th>${T('colRate1')}<br>${T('colRate2')}</th><th>${T('colAmount1')}<br>${T('colAmount2')}</th>
      </tr></thead>
      <tbody>${body}${empty}</tbody>
      <tfoot>${totalRow}</tfoot>
    </table>
    ${footer}
  </section>`
}

const STYLE = `
    @page { size: A5 portrait; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Noto Sans Devanagari', system-ui, sans-serif; color: #000; background: #e5e7eb; }
    .pg { width: 148mm; height: 210mm; padding: 4mm 7mm; background: #fff; margin: 0 auto 8mm; page-break-after: always; overflow: hidden; display: flex; flex-direction: column; }
    .pg:last-child { page-break-after: auto; }
    .h1 { text-align: center; font-weight: 700; font-size: 12pt; line-height: 1.2; }
    .h2 { text-align: center; font-weight: 700; font-size: 10.5pt; line-height: 1.2; }
    .h3 { text-align: center; font-size: 8.5pt; }
    .h4 { text-align: center; font-size: 6.5pt; border-bottom: 1px solid #000; padding-bottom: 2px; }
    .info { font-size: 8.5pt; padding: 3px 0; }
    .info .row { display: flex; justify-content: space-between; gap: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 8pt; }
    th, td { border-left: 1px solid #000; border-right: 1px solid #000; padding: 0 3px; text-align: right; white-space: nowrap; overflow: hidden; }
    th { border: 1px solid #000; font-weight: 400; font-size: 7pt; text-align: center; white-space: normal; line-height: 1.15; }
    td.l { text-align: left; max-width: 26mm; text-overflow: ellipsis; } td.r { text-align: right; }
    tbody td { height: 4.6mm; }
    tfoot td { border: 1px solid #000; }
    .foot { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 9pt; padding-top: 6px; border-bottom: 1px solid #000; padding-bottom: 6px; }
    .gap { margin-top: 6px; } .gap2 { margin-top: 18px; }
    .tot div { display: flex; justify-content: space-between; gap: 8px; line-height: 1.5; }
    .tot .big { border-top: 1px solid #000; font-size: 10.5pt; }
    .tot .sign { justify-content: center; margin-top: 8px; }
    .bar { position: sticky; top: 0; background: #0e7490; color: #fff; padding: 8px; text-align: center; font-family: system-ui; }
    .bar button { font: inherit; font-weight: 700; padding: 6px 16px; border-radius: 8px; border: 0; cursor: pointer; }
    @media print { body { background: #fff; } .pg { margin: 0; } .bar { display: none; } }
  `

/** html of all pages of ONE bill */
export function buyerBillPages(data) {
  const lines = [...(data?.lines || [])].sort((a, b) => n(a.token_number) - n(b.token_number))
  const b = data?.bill || {}
  const br = data?.broker || {}
  const md = data?.mandi || {}
  const firm = br.firm || br.name || '-'
  const phone = String(br.phone || '').replace('+91', '').trim()
  const t = mergeBillTexts('buyer', data?.texts)
  const d = {
    line1: t.header1 || md.line1 || md.name || '',
    line2: t.header2 || md.line2 || '',
    address: t.address || md.address || '',
    brokerLine: phone ? `${firm} ${mrDigits(phone)}` : firm,
    billNo: billNo(firm, b.bill_no),
    buyer: String(data?.buyer?.firm || data?.buyer?.name || '-').toUpperCase(),
    date: dmy(b.bill_date),
    pan: br.pan || '',
    gross: n(b.gross_amount),
    brokerage: n(b.brokerage_amount),
    tds: n(b.tds_amount),
    total: n(b.total_amount),
    totalBags: lines.reduce((s, l) => s + n(l.number_of_bags), 0),
    totalLoose: lines.reduce((s, l) => s + n(l.chungad_weight_kg), 0),
    totalQtl: lines.reduce((s, l) => s + n(l.weight_quintal), 0),
  }

  const pages = []
  for (let i = 0; i < lines.length; i += ROWS_PER_PAGE) pages.push(lines.slice(i, i + ROWS_PER_PAGE))
  if (!pages.length) pages.push([])

  return `${pages.map((p, i) => page(d, t, p, i === pages.length - 1, i + 1, pages.length)).join('')}`
}

/** Whole html page for many bills. print = add the Print bar and open the print box. */
export function buyerBillsHtml(list, title = 'Bills', print = true) {
  return `<!doctype html><html><head><meta charset="utf-8">
  <title>${esc(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
  <style>${STYLE}</style></head><body>
  ${print ? '<div class="bar"><button onclick="window.print()">Print / Save PDF</button></div>' : ''}
  ${list.map((d) => buyerBillPages(d)).join('')}
  ${print ? '<script>document.fonts && document.fonts.ready.then(function(){ setTimeout(function(){ window.print() }, 300) })</script>' : ''}
  </body></html>`
}

/** Prints many bills in one window (one after another). Returns false if pop-ups are blocked. */
export function printBuyerBills(list, win, title = 'Bills') {
  const html = buyerBillsHtml(list, title, true)
  const w = win || window.open('', '_blank', 'width=800,height=900')
  if (!w) return false
  w.document.open()
  w.document.write(html)
  w.document.close()
  return true
}

export function printBuyerBill(data, win) {
  return printBuyerBills([data], win, 'Buyer_Bill_' + (data?.bill?.bill_no ?? ''))
}
