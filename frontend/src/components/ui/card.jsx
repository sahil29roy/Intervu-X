import React from "react"

export const Card = ({ className, ...props }) => (
  <div className={`ui-card ${className || ""}`} {...props} />
)

export const CardHeader = ({ className, ...props }) => (
  <div className={`ui-card-header ${className || ""}`} {...props} />
)

export const CardTitle = ({ className, ...props }) => (
  <h3 className={`ui-card-title ${className || ""}`} {...props} />
)

export const CardDescription = ({ className, ...props }) => (
  <p className={`ui-card-description ${className || ""}`} {...props} />
)

export const CardContent = ({ className, ...props }) => (
  <div className={`ui-card-content ${className || ""}`} {...props} />
)

export const CardFooter = ({ className, ...props }) => (
  <div className={`ui-card-footer ${className || ""}`} {...props} />
)
