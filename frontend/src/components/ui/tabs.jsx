import React, { createContext, useContext, useState } from "react"

const TabsContext = createContext(null)

export const Tabs = ({ defaultValue, value, onValueChange, className, children, ...props }) => {
  const [activeTab, setActiveTab] = useState(defaultValue)
  
  const currentValue = value !== undefined ? value : activeTab
  const changeTab = onValueChange || setActiveTab

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: changeTab }}>
      <div className={`ui-tabs ${className || ""}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export const TabsList = ({ className, ...props }) => (
  <div className={`ui-tabs-list ${className || ""}`} {...props} />
)

export const TabsTrigger = ({ value, className, children, ...props }) => {
  const { value: activeTab, onValueChange } = useContext(TabsContext)
  const isActive = activeTab === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`ui-tabs-trigger ${isActive ? "active" : ""} ${className || ""}`}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ value, className, children, ...props }) => {
  const { value: activeTab } = useContext(TabsContext)
  
  if (activeTab !== value) return null

  return (
    <div role="tabpanel" className={`ui-tabs-content ${className || ""}`} {...props}>
      {children}
    </div>
  )
}
