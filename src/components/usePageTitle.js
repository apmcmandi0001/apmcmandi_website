import { useEffect } from 'react'
import { brand } from '../config'

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${brand.name}` : `${brand.name} — Mandi software & market rates`
  }, [title])
}
