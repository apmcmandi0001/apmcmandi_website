// =============================================================================
// Bill texts — the words printed on the farmer bill and the buyer bill.
// The Mandi Admin can change any of them (Farmer Bills / Buyer Bills page →
// "Edit Bill Texts"). Only the changed words are saved (table bill_text);
// everything else prints the original word below.
//
// The SAME list is used by the admin panel, the website and the app — keep the
// keys the same everywhere.
// =============================================================================

/** [key, label shown in the editor, original word] grouped by part of the bill */
export const BILL_TEXT_FIELDS = {
  farmer: [
    ['Top of the bill', [
      ['header1', 'Line 1 (big) — empty = mandi header', ''],
      ['header2', 'Line 2 — empty = mandi header', ''],
      ['address', 'Address line — empty = mandi address', ''],
      ['subtitle', 'Title line', 'परिशिष्ट क्र. १/मार्गदर्शक तत्वे १५ - धान्य/तेलबिया हिशेब पट्टी'],
    ]],
    ['Names & date', [
      ['brokerLabel', 'Broker', 'अडत्याचे नांव :'],
      ['pattiLabel', 'Bill number', 'पट्टी नंबर :'],
      ['farmerLabel', 'Farmer', 'शेतकऱ्याचे नांव :'],
      ['villageLabel', 'Village', 'गांव :'],
      ['dateLabel', 'Date', 'दिनांक :'],
    ]],
    ['Table headings', [
      ['colCommodity', 'Commodity', 'शेतमालाचे प्रकार'],
      ['colBuyer', 'Buyer', 'खरेदीदाराचे नाव'],
      ['colBagsGroup', 'Bags (top heading)', 'शेतमालाचे पोते'],
      ['colBags', 'Bags — count', 'नग'],
      ['colLoose', 'Bags — loose kg', 'चुं.'],
      ['colBagKg', 'Bag weight', 'भरती किलो'],
      ['colWeight1', 'Net weight (line 1)', 'शेतमालाचे नक्की'],
      ['colWeight2', 'Net weight (line 2)', 'वजन क्विंटल किलो'],
      ['colRate', 'Rate', 'दर/भाव प्र. क्विंटल'],
      ['colAmount', 'Amount', 'एकुण रूपये'],
      ['total', 'Total row', 'Total'],
      ['continued', 'Continued on next page', 'पुढे चालू ...'],
    ]],
    ['Charges (left)', [
      ['utrai', 'Utrai / Fodai', 'उतराई/फोडाई :'],
      ['mapai', 'Mapai / Tolai', 'मापाई / तोलाई :'],
      ['hamali', 'Hamali', 'हमाली :'],
      ['mandiCharge', 'Mandi charge (old bills only)', 'मंडी शुल्क :'],
      ['expenses', 'Total charges', 'एकुण खर्च :'],
    ]],
    ['Totals (right)', [
      ['rExpenses', 'Charges', 'मापाई/हमाली रू'],
      ['rAmount', 'Amount', 'रक्कम रू'],
      ['rAdvance', 'Advance', 'ॲडव्हांस रू'],
      ['rNet', 'Net payable', 'नि. देय रक्कम रू'],
    ]],
    ['Bottom', [
      ['received', 'Payment received line', 'चुकारा नगदी/चेक द्वारे मिळाला.'],
      ['signFarmer', 'Farmer signature', 'शेतकऱ्याची सही'],
      ['amountLabel', 'Under farmer signature', 'Amount :'],
      ['signBroker', 'Broker signature', 'अडत्याची सही'],
      ['cheque', 'Under broker signature', 'चेक नंबर'],
    ]],
  ],

  buyer: [
    ['Top of the bill', [
      ['header1', 'Line 1 (big) — empty = mandi header', ''],
      ['header2', 'Line 2 — empty = mandi header', ''],
      ['address', 'Address line — empty = mandi address', ''],
      ['subtitle', 'Title line', 'परिशिष्ट क्र. ८/मार्गदर्शक तत्वे १४ - शेत मालाचे बिल - कास्तकाराचा शेत माल विकण्या बाबतचे बिल'],
    ]],
    ['Names & date', [
      ['brokerLabel', 'Broker', 'अडत्याचे नांव :'],
      ['noLabel', 'Bill number', 'No :'],
      ['buyerLabel', 'Buyer', 'खरेदीदाराचे नाव :'],
      ['dateLabel', 'Date', 'Date :'],
    ]],
    ['Table headings', [
      ['colCommodity', 'Commodity', 'शेतमालाचे नांव'],
      ['colBags', 'Bags', 'पोते'],
      ['colLoose', 'Loose kg', 'किला'],
      ['colBagKg', 'Bag weight', 'भरती किलो'],
      ['colWeight1', 'Net weight (line 1)', 'नक्की वजन'],
      ['colWeight2', 'Net weight (line 2)', 'क्विंटल किलो'],
      ['colRate1', 'Rate (line 1)', 'शेतमाल दर'],
      ['colRate2', 'Rate (line 2)', 'प्र.क्विंटल'],
      ['colAmount1', 'Amount (line 1)', 'रक्कम'],
      ['colAmount2', 'Amount (line 2)', 'रू.'],
      ['total', 'Total row', 'Total'],
      ['continued', 'Continued on next page', 'पुढे चालू ...'],
    ]],
    ['Totals (right)', [
      ['brokerage', 'Brokerage', 'अडत'],
      ['hamali', 'Hamali', 'हमाली'],
      ['tds', 'TDS', 'टी.डी.एस.'],
      ['grandTotal', 'Total', 'एकुण'],
    ]],
    ['Bottom', [
      ['panLabel', 'PAN', 'Pan No. :'],
      ['received', 'Copy received line', 'बिलाची प्रत मिळाली'],
      ['signBuyer', 'Buyer signature', 'खरीददाराची सही'],
      ['signBroker', 'Broker signature', 'अडत्याची सही'],
    ]],
  ],
}

/** { key: original word } for one bill type */
export function defaultBillTexts(billType) {
  const out = {}
  for (const [, fields] of BILL_TEXT_FIELDS[billType] || []) for (const [k, , def] of fields) out[k] = def
  return out
}

/** Original words + the mandi's changed words (empty changes are ignored) */
export function mergeBillTexts(billType, saved) {
  const out = defaultBillTexts(billType)
  for (const [k, v] of Object.entries(saved || {})) {
    if (k in out && typeof v === 'string' && v.trim() !== '') out[k] = v
  }
  return out
}

/** Only the words that differ from the original (what gets saved) */
export function changedBillTexts(billType, texts) {
  const def = defaultBillTexts(billType)
  const out = {}
  for (const [k, v] of Object.entries(texts || {})) {
    if (k in def && typeof v === 'string' && v.trim() !== '' && v !== def[k]) out[k] = v
  }
  return out
}
