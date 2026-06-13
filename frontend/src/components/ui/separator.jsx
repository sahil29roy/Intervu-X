import React from "react"

export const Separator = ({ className, orientation = "horizontal", ...props }) => {
  return (
    <div
      role="none"
      className={`ui-separator ui-separator-${orientation} ${className || ""}`}
      {...props}
    />
  )
}
