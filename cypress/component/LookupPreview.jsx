import React, { useEffect, useState } from 'react'

export function LookupPreview() {
  const [label, setLabel] = useState('Loading…')

  useEffect(() => {
    fetch('/lookups/countries')
      .then((res) => res.json())
      .then((data) => {
        const count = data.countries?.length ?? 0
        setLabel(`${count} countries`)
      })
      .catch(() => setLabel('Lookup failed'))
  }, [])

  return (
    <span data-cy-hook="lookup-count" data-testid="lookup-count">
      {label}
    </span>
  )
}
