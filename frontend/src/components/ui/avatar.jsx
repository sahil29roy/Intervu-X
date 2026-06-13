import React, { useState } from "react"

export const Avatar = ({ className, children, ...props }) => (
  <div className={`ui-avatar ${className || ""}`} {...props}>
    {children}
  </div>
)

export const AvatarImage = ({ src, alt, className, ...props }) => {
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) return null

  return (
    <img
      src={src}
      alt={alt}
      className={`ui-avatar-image ${className || ""}`}
      onError={() => setHasError(true)}
      {...props}
    />
  )
}

export const AvatarFallback = ({ className, children, ...props }) => (
  <div className={`ui-avatar-fallback ${className || ""}`} {...props}>
    {children}
  </div>
)
