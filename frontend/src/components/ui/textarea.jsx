import React from "react"

export const Textarea = React.forwardRef(({ className, rows = 3, ...props }, ref) => {
  return (
    <textarea
      rows={rows}
      className={`ui-textarea ${className || ""}`}
      ref={ref}
      {...props}
    />
  )
})

Textarea.displayName = "Textarea"
