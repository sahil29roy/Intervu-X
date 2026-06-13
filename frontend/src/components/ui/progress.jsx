import React from "react"

export const Progress = ({ value = 0, className, ...props }) => {
  return (
    <div className={`ui-progress-track ${className || ""}`} {...props}>
      <div
        className="ui-progress-fill"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
