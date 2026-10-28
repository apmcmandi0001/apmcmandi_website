// =============================================================================
// हस्तांतरण बिल / Broker Transfer Bill — print (same content as the app's PDF)
// A4 portrait. data = result of broker_web_make_transfer / broker_web_transfer_print
// =============================================================================

const n = (v) => Number(v) || 0
const money = (v) => '₹' + n(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])
const dmy = (d) => {
  const p = String(d || '').slice(0, 10).split('-')
  return p.length === 3 && p[0].length === 4 ? `${p[2]}/${p[1]}/${p[0]}` : String(d || '')
}

const STYLE = `
    @page { size: A4 portrait; margin: 12mm; }
    body { margin: 0; font-family: 'Noto Sans Devanagari', system-ui, sans-serif; color: #111; font-size: 10pt; }
    .wrap { max-width: 186mm; margin: 0 auto; padding: 12px; }
    .wrap { page-break-after: always; } .wrap:last-of-type { page-break-after: auto; }
    .head { text-align: center; border-bottom: 2px solid #0e7490; padding-bottom: 8px; }
    .head h1 { margin: 0; font-size: 15pt; } .head .a { font-size: 9pt; color: #444; }
    .head .t { margin-top: 6px; font-weight: 700; font-size: 12pt; color: #0e7490; }
    .meta { display: flex; justify-content: space-between; margin: 10px 0; }
    .who { display: flex; align-items: center; gap: 12px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; }
    .who div { flex: 1; } .who small { display: block; color: #666; font-size: 8pt; } .who b { font-size: 12pt; }
    .who .arrow { flex: none; font-size: 20pt; font-weight: 700; }
    h2 { font-size: 11pt; margin: 14px 0 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    th, td { border: 1px solid #94a3b8; padding: 3px 6px; text-align: right; }
    th { background: #ecfeff; text-align: center; font-size: 8.5pt; }
    td.l { text-align: left; }
    tfoot td { font-weight: 700; background: #f8fafc; }
    .total { margin-top: 12px; display: flex; justify-content: space-between; align-items: center; border: 2px solid #0e7490; border-radius: 8px; padding: 10px 14px; }
    .total b { font-size: 16pt; }
    .note { margin-top: 10px; font-size: 8.5pt; color: #444; }
    .signs { display: flex; justify-content: space-between; margin-top: 46px; }
    .signs div { width: 40%; border-top: 1px solid #333; text-align: center; padding-top: 4px; font-size: 9pt; }
    .bar { position: sticky; top: 0; background: #0e7490; padding: 8px; text-align: center; font-family: system-ui; }
    .bar button { font: inherit; font-weight: 700; padding: 6px 16px; border-radius: 8px; border: 0; cursor: pointer; }
    @media print { .bar { display: none; } }
  `

/** html of all pages of ONE bill */
export function transferPages(data) {
  const lines = data?.lines || []
  const t = data?.transfer || {}
  const md = data?.mandi || {}
  const totalBags = lines.reduce((s, l) => s + n(l.number_of_bags), 0)
  const totalQtl = lines.reduce((s, l) => s + n(l.weight_quintal), 0)
  const totalAmt = lines.reduce((s, l) => s + n(l.amount), 0)

  const byComm = new Map()
  for (const l of lines) {
    const c = byComm.get(l.commodity_name) || { name: l.commodity_name || '-', tokens: 0, bags: 0, qty: 0, amt: 0 }
    c.tokens += 1
    c.bags += n(l.number_of_bags)
    c.qty += n(l.weight_quintal)
    c.amt += n(l.amount)
    byComm.set(c.name, c)
  }

  const commRows = [...byComm.values()]
    .map((c) => `<tr><td class="l">${esc(c.name)}</td><td>${c.tokens}</td><td>${c.bags}</td><td>${c.qty.toFixed(2)} qtl</td><td>${money(c.amt)}</td></tr>`)
    .join('')
  const tokenRows = lines
    .map(
      (l) => `<tr><td>${esc(l.token_number)}</td><td>${esc(dmy(l.token_date))}</td><td class="l">${esc(l.farmer_name)}</td>
      <td class="l">${esc(l.commodity_name)}</td><td class="l">${esc(l.buyer_name)}</td><td>${n(l.number_of_bags)}</td>
      <td>${n(l.weight_quintal).toFixed(2)} qtl</td><td>${money(l.rate_per_quintal)}</td><td>${money(l.amount)}</td></tr>`,
    )
    .join('')

  return `<div class="wrap">
    <div class="head"><h1>${esc(md.name)}</h1>${md.address ? `<div class="a">${esc(md.address)}</div>` : ''}
      <div class="t">हस्तांतरण बिल / Broker Transfer Bill</div></div>
    <div class="meta"><span>ट्रांसफर नंबर / Transfer No.: <b>${esc(t.transfer_no)}</b></span><span>दिनांक / Date: <b>${esc(dmy(t.transfer_date))}</b></span></div>
    <div class="who">
      <div><small>देने वाला दलाल / From Broker</small><b>${esc(data?.from)}</b></div>
      <span class="arrow">→</span>
      <div><small>लेने वाला दलाल / To Broker</small><b>${esc(data?.to)}</b></div>
    </div>
    <h2>फसल अनुसार सारांश / Commodity Summary</h2>
    <table><thead><tr><th>शेतमाल<br>Commodity</th><th>टोकन<br>Tokens</th><th>बॅग<br>Bags</th><th>वजन<br>Weight</th><th>रक्कम<br>Amount</th></tr></thead>
      <tbody>${commRows}</tbody></table>
    <h2>टोकन अनुसार / Token-wise Details</h2>
    <table><thead><tr><th>टोकन<br>Token</th><th>दिनांक<br>Date</th><th>किसान<br>Farmer</th><th>शेतमाल<br>Commodity</th><th>खरीदार<br>Buyer</th>
      <th>बॅग<br>Bags</th><th>वजन<br>Weight</th><th>भाव<br>Rate</th><th>रक्कम<br>Amount</th></tr></thead>
      <tbody>${tokenRows}</tbody>
      <tfoot><tr><td colspan="5" class="l">Total</td><td>${totalBags}</td><td>${totalQtl.toFixed(2)} qtl</td><td></td><td>${money(totalAmt)}</td></tr></tfoot></table>
    <div class="total"><span>कुल हस्तांतरित माल / Total Transferred</span><b>${money(totalAmt)}</b></div>
    <div class="note">ऊपर दिया गया माल अब लेने वाले दलाल के नाम है; खरीदार का बिल वही बनाएगा। / The goods above now belong to the receiving broker, who will bill the buyers.</div>
    <div class="signs"><div>देने वाला दलाल / From Broker</div><div>लेने वाला दलाल / To Broker</div></div>
  </div>`
}

/** Prints many bills in one window (one after another). Returns false if pop-ups are blocked. */
export function printTransfers(list, win, title = 'Bills') {
  const html = `<!doctype html><html><head><meta charset="utf-8">
  <title>${esc(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
  <style>${STYLE}</style></head><body>
  <div class="bar"><button onclick="window.print()">Print / Save PDF</button></div>
  ${list.map((d) => transferPages(d)).join('')}
  <script>document.fonts && document.fonts.ready.then(function(){ setTimeout(function(){ window.print() }, 300) })</script>
  </body></html>`
  const w = win || window.open('', '_blank', 'width=900,height=900')
  if (!w) return false
  w.document.open()
  w.document.write(html)
  w.document.close()
  return true
}

export function printTransfer(data, win) {
  return printTransfers([data], win, 'Transfer_Bill_' + (data?.transfer?.transfer_no ?? ''))
}
