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
import { getProductImageUrl } from "@/constants/pb"

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

    if (errors[inputId]) {
      setErrors((prev) => ({ ...prev, [inputId]: "" }))
    }
  }

  const getValidationRules = (input) => {
    if (input.minimum === 0 && input.maximum === 0) {
      return {
        min: 0,
        max: undefined,
        requiresPositive: true
      }
    }

    return {
      min: input.minimum,
      max: input.maximum,
      requiresPositive: false
    }
  }

  const validateInputs = () => {
    const newErrors = {}

    product.number_inputs.forEach((input) => {
      const value = values[input.id]
      const rules = getValidationRules(input)

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

        if (rules.requiresPositive && numValue <= 0) {
          newErrors[input.id] = "Value must be greater than 0"
          return
        }

        if (!rules.requiresPositive) {
          if (numValue < rules.min) {
            newErrors[input.id] = `Value must be at least ${rules.min}`
            return
          }

          if (rules.max !== undefined && numValue > rules.max) {
            newErrors[input.id] = `Value must be at most ${rules.max}`
            return
          }
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
          numericValues[input.id] = {
            title: input.title,
            value: Number.parseFloat(value)
          }
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

  const getInputProps = (input) => {
    const rules = getValidationRules(input)

    if (rules.requiresPositive) {
      return {
        min: input.decimals ? "0.1" : "1",
        max: undefined
      }
    }

    return {
      min: rules.min,
      max: rules.max
    }
  }

  const getPlaceholderText = (input) => {
    const rules = getValidationRules(input)

    if (rules.requiresPositive) {
      return "Enter value"
    }

    return `${rules.min} - ${rules.max}`
  }

  const getRangeText = (input) => {
    const rules = getValidationRules(input)

    if (rules.requiresPositive) {
      return "Range: Any Dimension"
    }

    return `Range: ${rules.min} - ${rules.max}`
  }

  const imageUrl = product.bg_image ? getProductImageUrl(product.collectionId, product.id, product.bg_image) : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full max-h-[95vh]">
          {/* Image Section */}
          {imageUrl && (
            <div className="w-full md:w-2/5 flex-shrink-0 max-h-[40vh] md:max-h-full">
              <div className="relative h-full w-full">
                <img
                  src={imageUrl}
                  alt={product.title}
                  className="w-full h-[98vh] object-cover"
                  style={{ maxHeight: '1000px' }}
                />
              </div>
            </div>
          )}

          {/* Form Section */}
          <div className="flex-1 flex flex-col p-6 justify-center">
            <div className="flex flex-col max-h-full">
              <DialogHeader className="flex-shrink-0 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl">{product.title}</DialogTitle>
                    <DialogDescription className="text-pretty">{product.desc}</DialogDescription>
                  </div>
                  {totalSteps > 1 && (
                    <div className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full flex-shrink-0">
                      Step {currentStep} of {totalSteps}
                    </div>
                  )}
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-4 pr-2">
                  {product.number_inputs.map((input) => {
                    const inputProps = getInputProps(input)

                    return (
                      <div key={input.id} className="space-y-2">
                        <Label htmlFor={input.id} className="text-sm font-medium">
                          {input.title}
                          {input.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                          id={input.id}
                          type="number"
                          step={input.decimals ? "0.1" : "1"}
                          min={inputProps.min}
                          max={inputProps.max}
                          value={values[input.id] || ""}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          placeholder={getPlaceholderText(input)}
                          className={errors[input.id] ? "border-destructive" : ""}
                        />
                        {errors[input.id] && <p className="text-sm text-destructive">{errors[input.id]}</p>}
                        <p className="text-xs text-muted-foreground">
                          {getRangeText(input)}
                          {input.decimals ? " (decimals allowed)" : " (whole numbers only)"}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between flex-shrink-0 mt-4">
                <div className="flex gap-2">
                  {showPrevious && (
                    <Button onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </div>

                <Button variant="primary" onClick={handleSubmit}>
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
