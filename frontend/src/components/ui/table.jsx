import React from "react"

export const Table = ({ className, ...props }) => (
  <div className="table-responsive">
    <table className={`ui-table ${className || ""}`} {...props} />
  </div>
)

export const TableHeader = ({ className, ...props }) => (
  <thead className={`ui-table-header ${className || ""}`} {...props} />
)

export const TableBody = ({ className, ...props }) => (
  <tbody className={`ui-table-body ${className || ""}`} {...props} />
)

export const TableFooter = ({ className, ...props }) => (
  <tfoot className={`ui-table-footer ${className || ""}`} {...props} />
)

export const TableRow = ({ className, ...props }) => (
  <tr className={`ui-table-row ${className || ""}`} {...props} />
)

export const TableHead = ({ className, ...props }) => (
  <th className={`ui-table-head ${className || ""}`} {...props} />
)

export const TableCell = ({ className, ...props }) => (
  <td className={`ui-table-cell ${className || ""}`} {...props} />
)

export const TableCaption = ({ className, ...props }) => (
  <caption className={`ui-table-caption ${className || ""}`} {...props} />
)
