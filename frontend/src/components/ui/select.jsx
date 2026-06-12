import React, { createContext, useContext, useState, useRef, useEffect } from "react"

const SelectContext = createContext(null)

export const Select = ({ children, defaultValue, value, onValueChange }) => {
  const [val, setVal] = useState(defaultValue || "")
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedVal = value !== undefined ? value : val

  const selectVal = (v) => {
    if (onValueChange) onValueChange(v)
    setVal(v)
    setIsOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value: selectedVal, selectVal, isOpen, setIsOpen }}>
      <div className="ui-select-container">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = ({ className, children, ...props }) => {
  const { isOpen, setIsOpen } = useContext(SelectContext)
  const triggerRef = useRef(null)

  return (
    <button
      type="button"
      ref={triggerRef}
      onClick={() => setIsOpen(!isOpen)}
      className={`ui-select-trigger ${isOpen ? "active" : ""} ${className || ""}`}
      aria-expanded={isOpen}
      {...props}
    >
      {children}
      <span className="ui-select-chevron">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.18182 6.18182L7.5 9.5L10.8182 6.18182" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </button>
  )
}

export const SelectValue = ({ placeholder }) => {
  const { value } = useContext(SelectContext)
  
  const displayMap = {
    candidate: "Candidate",
    interviewer: "Interviewer",
    admin: "Admin"
  }

  return <span>{displayMap[value] || value || placeholder}</span>
}

export const SelectContent = ({ children, className }) => {
  const { isOpen, setIsOpen } = useContext(SelectContext)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(e.target) && 
        !e.target.closest('.ui-select-trigger')
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div ref={containerRef} className={`ui-select-content ${className || ""}`}>
      <div className="ui-select-viewport">
        {children}
      </div>
    </div>
  )
}

export const SelectItem = ({ value, children, className }) => {
  const { value: selectedVal, selectVal } = useContext(SelectContext)
  const isSelected = selectedVal === value

  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={`ui-select-item ${isSelected ? "selected" : ""} ${className || ""}`}
      onClick={() => selectVal(value)}
    >
      <span>{children}</span>
      {isSelected && (
        <span className="ui-select-check">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 4.5L5.5 10.5L3.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
    </div>
  )
}
