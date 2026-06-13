import React from "react"

export const Button = ({ className, variant = "default", type = "submit", disabled, children, ...props }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`ui-button ui-button-${variant} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  )
}
