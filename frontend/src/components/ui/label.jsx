import React from "react"

export const Label = ({ className, ...props }) => (
  <label className={`ui-label ${className || ""}`} {...props} />
)
