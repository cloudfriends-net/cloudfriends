'use client'

import { useDrop } from 'react-dnd'
import { Rack, RackComponent } from '../types'

interface RackPositionProps {
  position: number
  rack: Rack
  updateComponentPosition: (componentId: string, position: number) => void
}

export default function RackPosition({ 
  position, 
  rack, 
  updateComponentPosition 
}: RackPositionProps) {
  const [{ isOver, canDrop }, drop] = useDrop<
    { id: string; component: RackComponent }, 
    void, 
    { isOver: boolean; canDrop: boolean }
  >(() => ({
    accept: 'COMPONENT',
    drop: (item: { id: string, component: RackComponent }) => {
      // Check if there's enough space for the component
      const componentHeight = item.component.rackUnits || 1
      if (position + componentHeight - 1 <= rack.height) {
        updateComponentPosition(item.id, position)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    // Prevent dropping if there's not enough space or if a component is already in this position
    canDrop: (item: { component: RackComponent }) => {
      const componentHeight = item.component.rackUnits || 1
      if (position + componentHeight - 1 > rack.height) return false
      
      // Check if space is already occupied
      for (let j = 0; j < componentHeight; j++) {
        const checkPos = position + j
        const occupied = rack.components.some(c => {
          if (!c.position) return false
          return c.position <= checkPos && c.position + (c.rackUnits - 1) >= checkPos
        })
        if (occupied) return false
      }
      return true
    }
  }))
  
  // Calculate different visual states
  let bgClass = ''
  if (isOver && canDrop) {
    bgClass = 'bg-green-100'
  } else if (isOver && !canDrop) {
    bgClass = 'bg-red-100'
  } else if (canDrop) {
    bgClass = 'hover:bg-blue-50'
  }
  
  return (
    <div
      key={`pos-${position}`}
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`h-5 border-t border-gray-200 w-full ${bgClass}`}
      style={{ gridRow: rack.height - position + 1 }}
    />
  )
}
