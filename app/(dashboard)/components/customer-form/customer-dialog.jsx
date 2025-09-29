"use client";

import { useState } from "react";
import { Check, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/components/dialog";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { toast } from "@/hooks/use-toast";
import { createCustomer, checkPostcode } from "@/lib/pb/customer";
import { getProductImageUrl } from "@/constants/pb";

export default function CustomerDialog({
  product,
  isOpen,
  onClose,
  onComplete
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    postcode: ''
  });
  const [postcodeStatus, setPostcodeStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPostcode, setIsCheckingPostcode] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePostcodeCheck = async () => {
    if (!formData.postcode.trim()) {
      toast({
        title: "Please enter a postcode",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingPostcode(true);
    try {
      const isValid = await checkPostcode(formData.postcode);
      setPostcodeStatus(isValid ? 'valid' : 'invalid');
      toast({
        title: isValid ? "Postcode is valid" : "Invalid postcode",
        variant: isValid ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error checking postcode",
        variant: "destructive",
      });
    } finally {
      setIsCheckingPostcode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const customer = await createCustomer(formData);
      toast({
        title: "Customer created successfully",
      });
      onComplete?.(customer);
      onClose();
    } catch (error) {
      toast({
        title: "Failed to create customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const imageUrl = product?.image ? getProductImageUrl(product.collectionId, product.id, product.image) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full max-h-[95vh]">
          {/* Image Section */}
          {imageUrl && (
            <div className="w-full md:w-2/5 flex-shrink-0">
              <div className="relative h-full w-full">
                <img
                  src={imageUrl}
                  alt={product.title || "Product"}
                  className="w-full h-[95vh] max-h-[1000px] object-cover"
                  style={{ maxHeight: '1000px' }}
                />
              </div>
            </div>
          )}

          {/* Form Section */}
          <div className="flex-1 flex flex-col p-6 justify-center">
            <div className="flex flex-col max-h-full">
              <DialogHeader className="flex-shrink-0 mb-4">
                <DialogTitle className="text-xl">Your Details</DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto min-h-0">
                <form onSubmit={handleSubmit} className="space-y-4 p-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-sm font-semibold text-gray-600">
                        First Name *
                      </label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-semibold text-gray-600">
                        Last Name *
                      </label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-600">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-600">
                      Phone *
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="07000 000000"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="postcode" className="block text-sm font-semibold text-gray-600">
                      Postcode
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="postcode"
                        placeholder="SW1A 1AA"
                        value={formData.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="default"
                        onClick={handlePostcodeCheck}
                        disabled={isCheckingPostcode || !formData.postcode.trim()}
                        className="px-3"
                      >
                        {isCheckingPostcode ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {postcodeStatus && (
                      <p className={`text-xs ${postcodeStatus === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
                        {postcodeStatus === 'valid' ? 'Valid postcode' : 'Invalid postcode'}
                      </p>
                    )}
                  </div>
                </form>
              </div>

              <DialogFooter className="flex gap-3 flex-shrink-0 mt-4">
                <Button
                  type="button"
                  variant="default"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Complete Selection
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
