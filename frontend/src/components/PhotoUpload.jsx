import { useId, useRef, useState } from 'react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

export default function PhotoUpload({ preview, onSelect, onClear }) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  function handleFile(file) {
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file. Choose a JPEG, PNG, or WebP image. This is a basic frontend check, not server-side verification.')
      return
    }

    if (file.size > MAX_BYTES) {
      setError('The selected image is larger than 5 MB. Choose a smaller file.')
      return
    }

    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      onSelect(reader.result)
    }
    reader.readAsDataURL(file)
  }

  function handleChange(event) {
    const file = event.target.files?.[0]
    handleFile(file)
    event.target.value = ''
  }

  return (
    <div className="photo-panel">
      <div className="photo-frame">
        {preview ? (
          <img src={preview} alt="Uploaded photograph preview" />
        ) : (
          <p className="photo-placeholder">Selected photograph preview will appear here.</p>
        )}
      </div>

      {error ? <p className="field-error">{error}</p> : null}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="file-input"
        onChange={handleChange}
      />

      <div className="button-row">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => inputRef.current?.click()}
        >
          {preview ? 'Replace photograph' : 'Choose photograph'}
        </button>
        {preview ? (
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            Remove
          </button>
        ) : null}
      </div>
    </div>
  )
}
