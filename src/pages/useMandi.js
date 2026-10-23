import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchMandi } from '../data'

/** Loads the mandi from the /m/:slug address */
export default function useMandi() {
  const { slug } = useParams()
  const [state, setState] = useState({ loading: true, mandi: null, sample: false })
  useEffect(() => {
    let alive = true
    setState({ loading: true, mandi: null, sample: false })
    fetchMandi(slug).then((r) => {
      if (alive) setState({ loading: false, ...r })
    })
    return () => {
      alive = false
    }
  }, [slug])
  return { slug, ...state }
}
