'use client'

import { useState } from 'react'
import { decodeJwt } from '@/lib/tools/jwt'
import { Output, textareaClass, ToolField } from '@/windows/tools/field'

export default function JwtTool() {
  const [token, setToken] = useState('')
  // When the token was typed, so expiry is judged against a moment, not every render.
  const [readAt, setReadAt] = useState(0)
  const decoded = token.trim() === '' ? null : decodeJwt(token)

  return (
    <div className="flex flex-col gap-3">
      <ToolField label="token">
        {(id) => (
          <textarea
            id={id}
            rows={3}
            spellCheck={false}
            className={textareaClass}
            value={token}
            onChange={(event) => {
              setToken(event.target.value)
              setReadAt(Date.now())
            }}
          />
        )}
      </ToolField>
      {decoded && !decoded.ok && (
        <p role="status" className="text-xs text-warn">
          {decoded.error}
        </p>
      )}
      {decoded?.ok && (
        <>
          <Output label="header" value={decoded.header} />
          <Output label="payload" value={decoded.payload} />
          {decoded.expiresAt && (
            <p className="text-xs text-ink-dim">
              {decoded.expiresAt.getTime() < readAt ? 'expired' : 'expires'}{' '}
              {decoded.expiresAt.toISOString()}
            </p>
          )}
        </>
      )}
      <p className="text-xs text-ink-dim">Signature not verified. Decoding is not trusting.</p>
    </div>
  )
}
