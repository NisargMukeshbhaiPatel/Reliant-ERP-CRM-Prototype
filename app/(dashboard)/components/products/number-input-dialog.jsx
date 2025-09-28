"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function NumberInputDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  onPrevious,
  showPrevious = false,
  showNext = true,
  isLastStep = false,
  currentStep = 1,
  totalSteps = 1,
}) {
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})

  const handleInputChange = (inputId, value) => {
    setValues((prev) => ({ ...prev, [inputId]: value }))

    // Clear error when user starts typing
    if (errors[inputId]) {
      setErrors((prev) => ({ ...prev, [inputId]: "" }))
    }
  }

  const validateInputs = () => {
    const newErrors = {}

    product.number_inputs.forEach((input) => {
      const value = values[input.id]

      if (input.required && (!value || value.trim() === "")) {
        newErrors[input.id] = "This field is required"
        return
      }

      if (value) {
        const numValue = Number.parseFloat(value)

        if (isNaN(numValue)) {
          newErrors[input.id] = "Please enter a valid number"
          return
        }

        if (numValue < input.minimum) {
          newErrors[input.id] = `Value must be at least ${input.minimum}`
          return
        }

        if (numValue > input.maximum) {
          newErrors[input.id] = `Value must be at most ${input.maximum}`
          return
        }

        if (!input.decimals && numValue % 1 !== 0) {
          newErrors[input.id] = "Decimal values are not allowed"
          return
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateInputs()) {
      const numericValues = {}

      product.number_inputs.forEach((input) => {
        const value = values[input.id]
        if (value) {
          numericValues[input.id] = Number.parseFloat(value)
        }
      })

      onSubmit(numericValues)
    }
  }

  const handleClose = () => {
    setValues({})
    setErrors({})
    onOpenChange(false)
  }

  const handlePrevious = () => {
    if (onPrevious) {
      setValues({})
      setErrors({})
      onPrevious()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-balance">{product.title}</DialogTitle>
              <DialogDescription className="text-pretty">{product.description}</DialogDescription>
            </div>
            {totalSteps > 1 && (
              <div className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                Step {currentStep} of {totalSteps}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {product.number_inputs.map((input) => (
            <div key={input.id} className="space-y-2">
              <Label htmlFor={input.id} className="text-sm font-medium">
                {input.title}
                {input.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Input
                id={input.id}
                type="number"
                step={input.decimals ? "0.1" : "1"}
                min={input.minimum}
                max={input.maximum}
                value={values[input.id] || ""}
                onChange={(e) => handleInputChange(input.id, e.target.value)}
                placeholder={`${input.minimum} - ${input.maximum}`}
                className={errors[input.id] ? "border-destructive" : ""}
              />
              {errors[input.id] && <p className="text-sm text-destructive">{errors[input.id]}</p>}
              <p className="text-xs text-muted-foreground">
                Range: {input.minimum} - {input.maximum}
                {input.decimals ? " (decimals allowed)" : " (whole numbers only)"}
              </p>
            </div>
          ))}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            {showPrevious && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>

          <Button onClick={handleSubmit}>
            {showNext ? (
              <>
                {isLastStep ? "Complete" : "Next"}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

