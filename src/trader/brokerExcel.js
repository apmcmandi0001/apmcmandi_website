import { buildXlsx } from './xlsxWriter'

// =============================================================================
// Broker export workbook — same sheets as the app's Excel export:
//   Summary · Farmer Bills · Farmer Bill Items · Farmer Bills by Commodity ·
//   Buyer Bills · Buyer Bill Items · Transfer Bills · Transfer Items
// data = result of broker_web_export
// =============================================================================

const n = (v) => Number(v) || 0
const i0 = (v) => Math.round(n(v))
const s = (v) => (v === null || v === undefined || String(v).trim() === '' ? '-' : String(v))
const dmy = (d) => {
  const p = String(d || '').slice(0, 10).split('-')
  return p.length === 3 && p[0].length === 4 ? `${p[2]}/${p[1]}/${p[0]}` : s(d)
}
const sum = (list, f) => list.reduce((a, x) => a + f(x), 0)
const chargeOf = (l) => (n(l.utrai_amount) > 0 ? 'Utrai' : n(l.mapai_amount) > 0 ? 'Mapai' : n(l.hamali_amount) > 0 ? 'Hamali' : '-')

export function brokerWorkbook(data, periodText) {
  const fb = data.farmer_bills || []
  const bb = data.buyer_bills || []
  const tr = data.transfers || []
  const title = `${data.mandi || 'APMC Mandi'} — ${data.broker || ''}`
  const sheets = []
  const summary = [['Broker', data.broker || '-'], ['Period', periodText], []]

  // ----- farmer bills
  if (fb.length) {
    const lines = fb.flatMap((b) => (b.lines || []).map((l) => ({ ...l, _b: b.bill })))
    const other = (l) => Math.max(0, n(l.mandi_charge_amount) - n(l.utrai_amount) - n(l.mapai_amount) - n(l.hamali_amount))
    const hasOther = lines.some((l) => other(l) > 0.009)
    summary.push(
      ['FARMER BILLS (किसान बिल)'],
      ['Farmer Bills', fb.length],
      ['Tokens', lines.length],
      ['Weight (qtl)', sum(lines, (l) => n(l.total_weight_quintal))],
      ['Gross Amount (₹)', sum(lines, (l) => n(l.gross_amount))],
      ['Utrai / Fodai (₹)', sum(lines, (l) => n(l.utrai_amount))],
      ['Mapai / Tolai (₹)', sum(lines, (l) => n(l.mapai_amount))],
      ['Hamali (₹)', sum(lines, (l) => n(l.hamali_amount))],
      ...(hasOther ? [['Mandi Charge – old bills (₹)', sum(lines, other)]] : []),
      ['Total Deductions (₹)', sum(lines, (l) => n(l.mandi_charge_amount))],
      ['Net Paid to Farmers (₹)', sum(lines, (l) => n(l.net_payable_amount))],
      [],
    )

    const billRows = fb.map((b) => {
      const L = b.lines || []
      return [
        i0(b.bill?.bill_no),
        dmy(b.bill?.bill_date),
        s(b.bill?.farmer_name),
        s(b.bill?.farmer_phone_number),
        s(b.bill?.payment_mode),
        L.map((l) => l.token_number).join(', '),
        sum(L, (l) => n(l.number_of_bags)),
        sum(L, (l) => n(l.total_weight_quintal)),
        sum(L, (l) => n(l.gross_amount)),
        sum(L, (l) => n(l.utrai_amount)),
        sum(L, (l) => n(l.mapai_amount)),
        sum(L, (l) => n(l.hamali_amount)),
        ...(hasOther ? [sum(L, other)] : []),
        sum(L, (l) => n(l.mandi_charge_amount)),
        sum(L, (l) => n(l.net_payable_amount)),
      ]
    })
    const tot = (k) => sum(lines, (l) => n(l[k]))
    sheets.push({
      name: 'Farmer Bills',
      title,
      sub: periodText,
      cols: [
        { title: 'Bill No.', type: 'int', width: 9 },
        { title: 'Bill Date', width: 12 },
        { title: 'Farmer', width: 24 },
        { title: 'Phone', width: 15 },
        { title: 'Payment', width: 9 },
        { title: 'Tokens', width: 14 },
        { title: 'Bags', type: 'int', width: 8 },
        { title: 'Weight (qtl)', type: 'num', width: 12 },
        { title: 'Gross (₹)', type: 'money', width: 14 },
        { title: 'Utrai (₹)', type: 'money', width: 11 },
        { title: 'Mapai (₹)', type: 'money', width: 11 },
        { title: 'Hamali (₹)', type: 'money', width: 11 },
        ...(hasOther ? [{ title: 'Mandi old (₹)', type: 'money', width: 12 }] : []),
        { title: 'Total Deduction (₹)', type: 'money', width: 16 },
        { title: 'Net Payable (₹)', type: 'money', width: 15 },
      ],
      rows: billRows,
      total: [
        'TOTAL', '', '', '', '', '',
        tot('number_of_bags'), tot('total_weight_quintal'), tot('gross_amount'),
        tot('utrai_amount'), tot('mapai_amount'), tot('hamali_amount'),
        ...(hasOther ? [sum(lines, other)] : []),
        tot('mandi_charge_amount'), tot('net_payable_amount'),
      ],
    })

    sheets.push({
      name: 'Farmer Bill Items',
      title,
      sub: periodText,
      cols: [
        { title: 'Bill No.', type: 'int', width: 9 },
        { title: 'Bill Date', width: 12 },
        { title: 'Farmer', width: 22 },
        { title: 'Token No.', type: 'int', width: 9 },
        { title: 'Token Date', width: 12 },
        { title: 'Commodity', width: 14 },
        { title: 'Buyer', width: 20 },
        { title: 'Bags', type: 'int', width: 8 },
        { title: 'Weight (qtl)', type: 'num', width: 12 },
        { title: 'Rate/Qtl (₹)', type: 'money', width: 12 },
        { title: 'Gross (₹)', type: 'money', width: 13 },
        { title: 'Charge Type', width: 11 },
        { title: 'Utrai (₹)', type: 'money', width: 11 },
        { title: 'Mapai (₹)', type: 'money', width: 11 },
        { title: 'Hamali (₹)', type: 'money', width: 11 },
        { title: 'Net (₹)', type: 'money', width: 13 },
      ],
      rows: lines.map((l) => [
        i0(l._b?.bill_no), dmy(l._b?.bill_date), s(l._b?.farmer_name), i0(l.token_number), dmy(l.token_date),
        s(l.commodity_name), s(l.buyer_name), n(l.number_of_bags), n(l.total_weight_quintal), n(l.rate_per_quintal),
        n(l.gross_amount), chargeOf(l), n(l.utrai_amount), n(l.mapai_amount), n(l.hamali_amount), n(l.net_payable_amount),
      ]),
    })

    const byC = new Map()
    for (const l of lines) {
      const c = byC.get(l.commodity_name) || { name: s(l.commodity_name), t: 0, bags: 0, q: 0, g: 0, d: 0, net: 0 }
      c.t += 1
      c.bags += n(l.number_of_bags)
      c.q += n(l.total_weight_quintal)
      c.g += n(l.gross_amount)
      c.d += n(l.mandi_charge_amount)
      c.net += n(l.net_payable_amount)
      byC.set(l.commodity_name, c)
    }
    sheets.push({
      name: 'Farmer Bills by Commodity',
      title,
      sub: periodText,
      cols: [
        { title: 'Commodity', width: 16 },
        { title: 'Tokens', type: 'int', width: 9 },
        { title: 'Bags', type: 'int', width: 9 },
        { title: 'Weight (qtl)', type: 'num', width: 12 },
        { title: 'Gross (₹)', type: 'money', width: 14 },
        { title: 'Deductions (₹)', type: 'money', width: 14 },
        { title: 'Net Paid (₹)', type: 'money', width: 14 },
        { title: 'Avg Rate (₹/qtl)', type: 'money', width: 15 },
      ],
      rows: [...byC.values()].map((c) => [c.name, c.t, c.bags, c.q, c.g, c.d, c.net, c.q > 0 ? c.g / c.q : 0]),
    })
  }

  // ----- buyer bills
  if (bb.length) {
    const lines = bb.flatMap((b) => (b.lines || []).map((l) => ({ ...l, _b: b.bill, _buyer: b.buyer?.name })))
    const T = (k) => sum(bb, (b) => n(b.bill?.[k]))
    summary.push(
      ['BUYER BILLS (खरीदार बिल)'],
      ['Buyer Bills', bb.length],
      ['Buyers', new Set(bb.map((b) => b.buyer?.name)).size],
      ['Tokens', lines.length],
      ['Weight (qtl)', sum(lines, (l) => n(l.weight_quintal))],
      ['Goods Amount (₹)', T('gross_amount')],
      ['Brokerage (₹)', T('brokerage_amount')],
      ['TDS on Brokerage (₹)', T('tds_amount')],
      ['Net Payable by Buyers (₹)', T('total_amount')],
      [],
    )
    sheets.push({
      name: 'Buyer Bills',
      title,
      sub: periodText,
      cols: [
        { title: 'Bill No.', type: 'int', width: 9 },
        { title: 'Bill Date', width: 12 },
        { title: 'Buyer', width: 24 },
        { title: 'Tokens', type: 'int', width: 9 },
        { title: 'Weight (qtl)', type: 'num', width: 12 },
        { title: 'Amount (₹)', type: 'money', width: 14 },
        { title: 'Brokerage %', type: 'num', width: 11 },
        { title: 'Brokerage (₹)', type: 'money', width: 13 },
        { title: 'TDS (₹)', type: 'money', width: 11 },
        { title: 'Net Payable (₹)', type: 'money', width: 15 },
      ],
      rows: bb.map((b) => [
        i0(b.bill?.bill_no), dmy(b.bill?.bill_date), s(b.buyer?.name), (b.lines || []).length,
        sum(b.lines || [], (l) => n(l.weight_quintal)), n(b.bill?.gross_amount), n(b.bill?.brokerage_percent),
        n(b.bill?.brokerage_amount), n(b.bill?.tds_amount), n(b.bill?.total_amount),
      ]),
      total: ['TOTAL', '', '', lines.length, sum(lines, (l) => n(l.weight_quintal)), T('gross_amount'), '', T('brokerage_amount'), T('tds_amount'), T('total_amount')],
    })
    sheets.push({
      name: 'Buyer Bill Items',
      title,
      sub: periodText,
      cols: [
        { title: 'Bill No.', type: 'int', width: 9 },
        { title: 'Bill Date', width: 12 },
        { title: 'Buyer', width: 22 },
        { title: 'Token No.', type: 'int', width: 9 },
        { title: 'Token Date', width: 12 },
        { title: 'Farmer', width: 20 },
        { title: 'Commodity', width: 14 },
        { title: 'Bags', type: 'int', width: 8 },
        { title: 'Weight (qtl)', type: 'num', width: 12 },
        { title: 'Rate/Qtl (₹)', type: 'money', width: 12 },
        { title: 'Amount (₹)', type: 'money', width: 14 },
      ],
      rows: lines.map((l) => [
        i0(l._b?.bill_no), dmy(l._b?.bill_date), s(l._buyer), i0(l.token_number), dmy(l.token_date), s(l.farmer_name),
        s(l.commodity_name), n(l.number_of_bags), n(l.weight_quintal), n(l.rate_per_quintal), n(l.amount),
      ]),
    })
  }

  // ----- transfers
  if (tr.length) {
    const sent = tr.filter((t) => t.direction === 'sent')
    const recv = tr.filter((t) => t.direction !== 'sent')
    const amt = (list) => sum(list, (t) => sum(t.lines || [], (l) => n(l.amount)))
    summary.push(
      ['TRANSFER BILLS (ट्रांसफर बिल)'],
      ['Transfers Sent', sent.length],
      ['Amount Sent (₹)', amt(sent)],
      ['Transfers Received', recv.length],
      ['Amount Received (₹)', amt(recv)],
      [],
    )
    const dir = (t) => (t.direction === 'sent' ? 'Sent' : 'Received')
    sheets.push({
      name: 'Transfer Bills',
      title,
      sub: periodText,
      cols: [
        { title: 'Transfer No.', type: 'int', width: 11 },
        { title: 'Date', width: 12 },
        { title: 'Direction', width: 10 },
        { title: 'From Broker', width: 20 },
        { title: 'To Broker', width: 20 },
        { title: 'Tokens', type: 'int', width: 8 },
        { title: 'Bags', type: 'int', width: 8 },
        { title: 'Weight (qtl)', type: 'num', width: 12 },
        { title: 'Amount (₹)', type: 'money', width: 14 },
      ],
      rows: tr.map((t) => [
        i0(t.transfer?.transfer_no), dmy(t.transfer?.transfer_date), dir(t), s(t.from), s(t.to), (t.lines || []).length,
        sum(t.lines || [], (l) => n(l.number_of_bags)), sum(t.lines || [], (l) => n(l.weight_quintal)), sum(t.lines || [], (l) => n(l.amount)),
      ]),
    })
    sheets.push({
      name: 'Transfer Items',
      title,
      sub: periodText,
      cols: [
        { title: 'Transfer No.', type: 'int', width: 11 },
        { title: 'Transfer Date', width: 12 },
        { title: 'Direction', width: 10 },
        { title: 'From Broker', width: 18 },
        { title: 'To Broker', width: 18 },
        { title: 'Token No.', type: 'int', width: 9 },
        { title: 'Token Date', width: 12 },
        { title: 'Farmer', width: 18 },
        { title: 'Commodity', width: 14 },
        { title: 'Buyer', width: 18 },
        { title: 'Bags', type: 'int', width: 8 },
        { title: 'Weight (qtl)', type: 'num', width: 12 },
        { title: 'Rate/Qtl (₹)', type: 'money', width: 12 },
        { title: 'Amount (₹)', type: 'money', width: 14 },
      ],
      rows: tr.flatMap((t) =>
        (t.lines || []).map((l) => [
          i0(t.transfer?.transfer_no), dmy(t.transfer?.transfer_date), dir(t), s(t.from), s(t.to), i0(l.token_number),
          dmy(l.token_date), s(l.farmer_name), s(l.commodity_name), s(l.buyer_name), n(l.number_of_bags),
          n(l.weight_quintal), n(l.rate_per_quintal), n(l.amount),
        ]),
      ),
    })
  }

  return buildXlsx([{ name: 'Summary', title, sub: periodText, rows: summary }, ...sheets])
}

// =============================================================================
// Buyer export workbook — Summary · Buyer Bills · Buyer Bill Items · By Broker
// data = result of buyer_web_export
// =============================================================================
export function buyerWorkbook(data, periodText) {
  const bb = data.buyer_bills || []
  const title = `${data.mandi || 'APMC Mandi'} — ${data.buyer || ''}`
  const lines = bb.flatMap((b) => (b.lines || []).map((l) => ({ ...l, _b: b.bill, _broker: b.broker_name })))
  const T = (k) => sum(bb, (b) => n(b.bill?.[k]))
  const weight = sum(lines, (l) => n(l.weight_quintal))

  const summary = [
    ['Buyer', data.buyer || '-'],
    ['Period', periodText],
    [],
    ['Bills', bb.length],
    ['Brokers', new Set(bb.map((b) => b.broker_name)).size],
    ['Tokens (lots)', lines.length],
    ['Total Weight (qtl)', weight],
    ['Goods Amount (₹)', T('gross_amount')],
    ['Brokerage (₹)', T('brokerage_amount')],
    ['TDS on Brokerage (₹)', T('tds_amount')],
    ['Net Payable (₹)', T('total_amount')],
    ['Average Rate (₹/qtl)', weight > 0 ? T('gross_amount') / weight : 0],
  ]

  const byBroker = new Map()
  for (const b of bb) {
    const k = b.broker_name || '-'
    const r = byBroker.get(k) || { name: k, bills: 0, lots: 0, q: 0, g: 0, br: 0, tds: 0, t: 0 }
    r.bills += 1
    r.lots += (b.lines || []).length
    r.q += sum(b.lines || [], (l) => n(l.weight_quintal))
    r.g += n(b.bill?.gross_amount)
    r.br += n(b.bill?.brokerage_amount)
    r.tds += n(b.bill?.tds_amount)
    r.t += n(b.bill?.total_amount)
    byBroker.set(k, r)
  }

  return buildXlsx([
    { name: 'Summary', title, sub: periodText, rows: summary },
    {
      name: 'Buyer Bills',
      title,
      sub: periodText,
      cols: [
        { title: 'Bill No.', type: 'int', width: 9 },
        { title: 'Bill Date', width: 12 },
        { title: 'Broker', width: 22 },
        { title: 'Tokens', type: 'int', width: 8 },
        { title: 'Weight (qtl)', type: 'num', width: 12 },
        { title: 'Amount (₹)', type: 'money', width: 14 },
        { title: 'Brokerage %', type: 'num', width: 11 },
        { title: 'Brokerage (₹)', type: 'money', width: 13 },
        { title: 'TDS (₹)', type: 'money', width: 11 },
        { title: 'Net Payable (₹)', type: 'money', width: 15 },
      ],
      rows: bb.map((b) => [
        i0(b.bill?.bill_no), dmy(b.bill?.bill_date), s(b.broker_name), (b.lines || []).length,
        sum(b.lines || [], (l) => n(l.weight_quintal)), n(b.bill?.gross_amount), n(b.bill?.brokerage_percent),
        n(b.bill?.brokerage_amount), n(b.bill?.tds_amount), n(b.bill?.total_amount),
      ]),
      total: ['TOTAL', '', '', lines.length, weight, T('gross_amount'), '', T('brokerage_amount'), T('tds_amount'), T('total_amount')],
    },
    {
      name: 'Buyer Bill Items',
      title,
      sub: periodText,
      cols: [
        { title: 'Bill No.', type: 'int', width: 9 },
        { title: 'Bill Date', width: 12 },
        { title: 'Broker', width: 20 },
        { title: 'Token No.', type: 'int', width: 9 },
        { title: 'Token Date', width: 12 },
        { title: 'Farmer', width: 20 },
        { title: 'Commodity', width: 14 },
        { title: 'Bags', type: 'int', width: 8 },
        { title: 'Weight (qtl)', type: 'num', width: 12 },
        { title: 'Rate/Qtl (₹)', type: 'money', width: 12 },
        { title: 'Amount (₹)', type: 'money', width: 14 },
      ],
      rows: lines.map((l) => [
        i0(l._b?.bill_no), dmy(l._b?.bill_date), s(l._broker), i0(l.token_number), dmy(l.token_date), s(l.farmer_name),
        s(l.commodity_name), n(l.number_of_bags), n(l.weight_quintal), n(l.rate_per_quintal), n(l.amount),
      ]),
    },
    {
      name: 'By Broker',
      title,
      sub: periodText,
      cols: [
        { title: 'Broker', width: 24 },
        { title: 'Bills', type: 'int', width: 8 },
        { title: 'Tokens', type: 'int', width: 8 },
        { title: 'Weight (qtl)', type: 'num', width: 12 },
        { title: 'Amount (₹)', type: 'money', width: 14 },
        { title: 'Brokerage (₹)', type: 'money', width: 13 },
        { title: 'TDS (₹)', type: 'money', width: 11 },
        { title: 'Net Payable (₹)', type: 'money', width: 15 },
        { title: 'Avg Rate (₹/qtl)', type: 'money', width: 14 },
      ],
      rows: [...byBroker.values()].map((r) => [r.name, r.bills, r.lots, r.q, r.g, r.br, r.tds, r.t, r.q > 0 ? r.g / r.q : 0]),
    },
  ])
}
