import { fetchFarmerBillPrint, fetchBuyerBillPrint, fetchTransferPrint } from './brokerHomeApi'
import { printFarmerBill } from './farmerBillPrint'
import { printBuyerBill } from './buyerBillPrint'
import { printTransfer } from './transferPrint'

// Reprint a saved bill (from the Bills list).
// The print window is opened FIRST (on the click), then filled — otherwise
// the browser blocks it as a pop-up. Returns 'ok' | 'expired' | 'popup' | 'error'.
async function reprint(load, draw) {
  const w = window.open('', '_blank', 'width=1000,height=800')
  if (!w) return 'popup'
  w.document.write('<p style="font-family:system-ui;padding:24px">Loading bill…</p>')
  try {
    const d = await load()
    if (!d?.ok) {
      w.close()
      return 'error'
    }
    draw(d, w)
    return 'ok'
  } catch (e) {
    w.close()
    return e?.message === 'SESSION_EXPIRED' ? 'expired' : 'error'
  }
}

export const reprintFarmerBill = (token, billId) => reprint(() => fetchFarmerBillPrint(token, billId), printFarmerBill)

export const reprintBuyerBill = (token, billId) => reprint(() => fetchBuyerBillPrint(token, billId), printBuyerBill)

export const reprintTransfer = (token, transferId) => reprint(() => fetchTransferPrint(token, transferId), printTransfer)
