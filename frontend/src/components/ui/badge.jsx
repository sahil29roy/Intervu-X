import React from "react"

export const Badge = ({ className, variant = "default", children, ...props }) => {
  return (
    <span className={`ui-badge ui-badge-${variant} ${className || ""}`} {...props}>
      {children}
    </span>
  )
}
