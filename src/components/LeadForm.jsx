import { useState } from 'react'
import { useLang } from '../i18n'
import { brand } from '../config'
import { submitLead, waHref } from '../data'

/** "Request a demo" form — saved to the website_lead table */
export default function LeadForm() {
  const { t } = useLang()
  const f = t.form
  const [form, setForm] = useState({ name: '', phone: '', mandi_name: '', city: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    const phone = form.phone.replace(/\D/g, '').slice(-10)
    if (form.name.trim().length < 2 || phone.length !== 10) {
      setError(f.required)
      return
    }
    setError('')
    setStatus('sending')
    try {
      await submitLead({
        name: form.name.trim(),
        phone,
        mandi_name: form.mandi_name.trim() || null,
        city: form.city.trim() || null,
        message: form.message.trim() || null,
      })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return <div className="form-done">✓ {f.thanks}</div>
  }

  return (
    <form className="lead-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="lf-name">{f.name} *</label>
          <input id="lf-name" value={form.name} onChange={set('name')} autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="lf-phone">{f.phone} *</label>
          <input
            id="lf-phone"
            value={form.phone}
            onChange={set('phone')}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="98765 43210"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="lf-mandi">{f.mandi}</label>
          <input id="lf-mandi" value={form.mandi_name} onChange={set('mandi_name')} autoComplete="organization" />
        </div>
        <div className="field">
          <label htmlFor="lf-city">{f.city}</label>
          <input id="lf-city" value={form.city} onChange={set('city')} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="lf-msg">{f.message}</label>
        <textarea id="lf-msg" rows={3} value={form.message} onChange={set('message')} maxLength={1000} />
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {status === 'error' && (
        <p className="form-error" role="alert">
          {f.error}{' '}
          <a href={waHref(brand.whatsapp, t.contact.waText)} target="_blank" rel="noreferrer">
            WhatsApp →
          </a>
        </p>
      )}
      <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? f.sending : f.send}
      </button>
    </form>
  )
}
