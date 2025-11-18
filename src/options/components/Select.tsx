import * as SelectPrimitive from "@radix-ui/react-select"
import clsx from "classnames"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react"

import "../styles/select.css"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "./icons"

type TriggerProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>

export const Select = forwardRef<ElementRef<typeof SelectPrimitive.Trigger>, TriggerProps>(
  ({ children, placeholder, ...props }, ref) => (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger ref={ref} className="select-trigger">
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="select-icon">
          <ChevronDownIcon className="icon" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="select-content">
          <SelectPrimitive.ScrollUpButton className="select-scroll-button">
            <ChevronUpIcon className="icon" />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="select-viewport">{children}</SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton className="select-scroll-button">
            <ChevronDownIcon className="icon" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
)

Select.displayName = "Select"

type ItemProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Item>

export const SelectItem = forwardRef<ElementRef<typeof SelectPrimitive.Item>, ItemProps>(
  ({ children, className, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={clsx("select-item", className)}
      {...props}>
      <SelectPrimitive.ItemIndicator className="select-indicator">
        <CheckIcon className="icon" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
)

SelectItem.displayName = "SelectItem"
