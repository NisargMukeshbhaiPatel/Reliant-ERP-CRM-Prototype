"use client"
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/ui/components/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getProductImageUrl } from "@/constants/pb";
import { getProdPageById } from "@/lib/pb/products";
import { NumberInputDialog } from "./number-input-dialog";
import { SelectionDialog } from "./selection-dialog";
import { WindowSummaryDialog } from "./window-summary-dialog";
import { ProductGrid } from "./product-grid";
import CustomerDialog from "../customer-form/customer-dialog";
import { transformToQuotationItem } from "@/lib/utils";
import { saveQuotation } from "@/lib/pb/quotation";

export default function ProductList({ products }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isNewQuotation = searchParams.get("mode") === "new-quotation";

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPageData, setCurrentPageData] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);

  const [flowStack, setFlowStack] = useState([]);
  const [allFlowData, setAllFlowData] = useState([]);

  // storage for multiple configurations/products
  const [configuredProducts, setConfiguredProducts] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  // Customer information state
  const [customerInfo, setCustomerInfo] = useState(null);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

  // Show customer dialog on mount if it's a new quotation
  useEffect(() => {
    if (isNewQuotation && !customerInfo) {
      setShowCustomerDialog(true);
    }
  }, [isNewQuotation, customerInfo]);

  const handleCustomerComplete = (customer) => {
    setCustomerInfo(customer);
    setShowCustomerDialog(false);
    toast({
      title: "Customer information saved. Select Products",
      description: "Start adding products to the quotation",
    });
  };

  const handleProductClick = async (product) => {
    // If it's a new quotation and no customer info, show customer dialog first
    if (isNewQuotation && !customerInfo) {
      setShowCustomerDialog(true);
      toast({
        title: "Customer information required",
        description: "Please provide customer information before selecting products",
        variant: "destructive",
      });
      return;
    }

    setLoadingProductId(product.id);
    try {
      const pageData = await getProdPageById(product.page);
      console.log("Starting flow with page:", pageData);

      setSelectedProduct(product);
      setCurrentPageData(pageData);
      setIsDialogOpen(true);

      setFlowStack([{
        pages: [pageData.id],
        currentIndex: 0,
        completedSteps: []
      }]);
      setAllFlowData([]);

    } catch (error) {
      console.error("Error fetching product page data:", error);
      toast({
        title: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingProductId(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
    setCurrentPageData(null);
    setFlowStack([]);
    setAllFlowData([]);
    setIsLoadingNextPage(false);
  };

  const handleSubmit = async (userSelection) => {
    const stepData = {
      pageId: currentPageData.id,
      pageTitle: currentPageData.title,
      pageType: currentPageData.type,
      userInput: userSelection,
    };

    const updatedFlowStack = [...flowStack];
    const currentBranch = updatedFlowStack[updatedFlowStack.length - 1];
    currentBranch.completedSteps.push(stepData);

    if (currentPageData.type === "SELECTION") {
      if (userSelection.next_pages && userSelection.next_pages.length > 0) {
        console.log("Selected item has next_pages:", userSelection.next_pages);

        const newBranch = {
          pages: userSelection.next_pages,
          currentIndex: 0,
          completedSteps: []
        };
        updatedFlowStack.push(newBranch);

        if (currentPageData.next_pages && currentPageData.next_pages.length > 0) {
          console.log("Also queuing current page's next_pages:", currentPageData.next_pages);
          currentBranch.pages.push(...currentPageData.next_pages);
        }

        setFlowStack(updatedFlowStack);
        await loadPageById(userSelection.next_pages[0]);
        return;
      } else if (currentPageData.next_pages && currentPageData.next_pages.length > 0) {
        console.log("Adding current page's next_pages:", currentPageData.next_pages);
        currentBranch.pages.push(...currentPageData.next_pages);
      }
    } else if (currentPageData.type === "NUMBER" || currentPageData.type === "TEXT") {
      if (currentPageData.next_pages && currentPageData.next_pages.length > 0) {
        console.log("Adding page's next_pages:", currentPageData.next_pages);
        currentBranch.pages.push(...currentPageData.next_pages);
      }
    }

    setFlowStack(updatedFlowStack);
    await moveToNextPage();
  };

  const loadPageById = async (pageId) => {
    setIsLoadingNextPage(true);
    try {
      const pageData = await getProdPageById(pageId);
      console.log("Loaded page:", pageData);
      setCurrentPageData(pageData);
    } catch (error) {
      console.error("Error loading page:", error);
      toast({
        title: `Error loading page: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingNextPage(false);
    }
  };

  const moveToNextPage = async (stackOverride = null) => {
    console.log("MOVE TO NEXT PAGE START");
    const currentStack = stackOverride || flowStack;
    const currentBranch = currentStack[currentStack.length - 1];

    if (!currentBranch) {
      console.log("No current branch, completing flow");
      await completeFlow();
      return;
    }

    if (currentBranch.currentIndex < currentBranch.pages.length - 1) {
      const nextIndex = currentBranch.currentIndex + 1;
      const nextPageId = currentBranch.pages[nextIndex];

      console.log(`Moving to next page in branch: ${nextPageId} (index ${nextIndex})`);

      const updatedFlowStack = [...currentStack];
      updatedFlowStack[updatedFlowStack.length - 1] = {
        ...updatedFlowStack[updatedFlowStack.length - 1],
        currentIndex: nextIndex
      };

      setFlowStack(updatedFlowStack);
      await loadPageById(nextPageId);
    } else {
      console.log("Branch complete");

      if (currentStack.length === 1) {
        console.log("Last branch complete, finishing flow");
        await completeFlow();
      } else {
        console.log("Backtracking to parent");
        await backtrackToParent();
      }
    }
    console.log("=== MOVE TO NEXT PAGE END ===");
  };

  const backtrackToParent = async () => {
    console.log("=== BACKTRACK TO PARENT START ===");
    const completedBranch = flowStack[flowStack.length - 1];
    const remainingStack = flowStack.slice(0, -1);

    console.log("Completed branch:", completedBranch);
    console.log("Remaining stack:", remainingStack);

    setAllFlowData(prev => [...prev, ...completedBranch.completedSteps]);

    if (remainingStack.length === 0) {
      console.log("No more branches, completing flow");
      await completeFlow();
      return;
    }

    setFlowStack(remainingStack);

    const parentBranch = remainingStack[remainingStack.length - 1];
    console.log("Parent branch after backtrack:", parentBranch);

    await moveToNextPage(remainingStack);
  };

  const completeFlow = async () => {
    const finalData = [...allFlowData];

    flowStack.forEach(branch => {
      finalData.push(...branch.completedSteps);
    });

    console.log("Flow completed!");
    console.log("Final flow data:", finalData);

    const configuredProduct = {
      id: crypto.randomUUID(),
      product: selectedProduct,
      userSelections: finalData,
      quantity: 1
    };

    setConfiguredProducts(prev => [...prev, configuredProduct]);
    handleDialogClose();
    setShowSummary(true);
  };

  const handleDeleteProduct = (productId) => {
    setConfiguredProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: "Product removed",
      variant: "success"
    });
  };

  const handleSelectMoreProducts = () => {
    setShowSummary(false);
  };

  const handleViewSummary = () => {
    if (configuredProducts.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add some products to your selection to continue",
        variant: "destructive"
      });
      return;
    }
    setShowSummary(true);
  };

  const handleCompleteSummary = async () => {
    // If it's a new quotation, customer info already exists, so save directly
    if (isNewQuotation && customerInfo) {
      const quotationItems = transformToQuotationItem(configuredProducts);
      try {
        await saveQuotation(quotationItems, customerInfo);
        toast({
          title: "Quotation Created Successfully!",
          description: "We've received your request and will get back to you shortly",
        });

        router.push("/quotations");
      } catch (error) {
        console.error("Error saving quotation", error);
        toast({
          title: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handlePrevious = async () => {
    const currentBranch = flowStack[flowStack.length - 1];

    if (!currentBranch) return;

    if (currentBranch.currentIndex > 0) {
      const prevIndex = currentBranch.currentIndex - 1;
      const prevPageId = currentBranch.pages[prevIndex];

      const updatedFlowStack = [...flowStack];
      updatedFlowStack[updatedFlowStack.length - 1].completedSteps.pop();
      updatedFlowStack[updatedFlowStack.length - 1].currentIndex = prevIndex;
      setFlowStack(updatedFlowStack);

      await loadPageById(prevPageId);
    } else if (flowStack.length > 1) {
      const parentStack = flowStack.slice(0, -1);
      const parentBranch = parentStack[parentStack.length - 1];

      parentBranch.completedSteps.pop();

      setFlowStack(parentStack);

      const parentPageId = parentBranch.pages[parentBranch.currentIndex];
      await loadPageById(parentPageId);
    }
  };

  const canGoBack = () => {
    const currentBranch = flowStack[flowStack.length - 1];
    if (!currentBranch) return false;
    return currentBranch.currentIndex > 0 || flowStack.length > 1;
  };

  const getProgressInfo = () => {
    const totalCompleted = allFlowData.length +
      flowStack.reduce((sum, branch) => sum + branch.completedSteps.length, 0);
    return {
      currentStep: totalCompleted + 1,
      progressText: `Step ${totalCompleted + 1}`
    };
  };

  const progressInfo = getProgressInfo();

  return (
    <div>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-7 gap-4">
        <div className="flex items-center gap-4">
          <img
            src="https://reliant-windows.co.uk/wp-content/uploads/2024/12/Reliant_Windows_Logo-2.webp"
            alt="Reliant Windows Logo"
            className="h-16 w-auto object-contain"
          />
          <div className="text-left">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
              {isNewQuotation ? "New Quotation" : "Our Products"}
            </h1>
            {isNewQuotation && customerInfo && (
              <p className="text-sm text-muted-foreground mt-1">
                Customer: {customerInfo.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center sm:justify-end">
          <Button
            variant="outline"
            onClick={handleViewSummary}
            className="flex items-center gap-2 px-4 py-2 relative"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {configuredProducts.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {configuredProducts.length}
                </span>
              )}
            </div>
            View Selections
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <ProductGrid
        selections={products.map(product => ({
          id: product.id,
          title: product.title,
          desc: product.desc,
          image: getProductImageUrl(product.collectionId, product.id, product.image)
        }))}
        selectedId={loadingProductId}
        onSelectionChange={(productId) => {
          const product = products.find(p => p.id === productId);
          if (product) {
            handleProductClick(product);
          }
        }}
        isLoading={!!loadingProductId}
        variant="luxury"
        showButton={true}
        buttonText="Select"
        loadingText="Loading..."
        expandable={false}
        imageFit="cover"
      />

      {/* Dialog Components */}
      {currentPageData && currentPageData.type === "NUMBER" && (
        <NumberInputDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          product={currentPageData}
          onSubmit={handleSubmit}
          onPrevious={handlePrevious}
          showPrevious={canGoBack()}
          showNext={true}
          currentStep={progressInfo.currentStep}
          progressText={progressInfo.progressText}
          isLoading={isLoadingNextPage}
        />
      )}

      {currentPageData && currentPageData.type === "SELECTION" && (
        <SelectionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          product={currentPageData}
          onSubmit={handleSubmit}
          onPrevious={handlePrevious}
          showPrevious={canGoBack()}
          showNext={true}
          currentStep={progressInfo.currentStep}
          progressText={progressInfo.progressText}
          isLoading={isLoadingNextPage}
        />
      )}

      {currentPageData && currentPageData.type === "TEXT" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{currentPageData.title}</h2>
            <p className="text-gray-600 mb-4">{currentPageData.desc}</p>
            <input
              type="text"
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter your text..."
              id="textInput"
            />
            <div className="flex gap-2">
              {canGoBack() && (
                <Button variant="outline" onClick={handlePrevious} className="flex-1">
                  Previous
                </Button>
              )}
              <Button
                onClick={() => {
                  const textInput = document.getElementById('textInput');
                  const textValue = textInput ? textInput.value : '';
                  handleSubmit({ textValue });
                }}
                className="flex-1"
                disabled={isLoadingNextPage}
              >
                {isLoadingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Dialog - for initial customer info */}
      <CustomerDialog
        isOpen={showCustomerDialog}
        onClose={() => setShowCustomerDialog(false)}
        onComplete={handleCustomerComplete}
        isCollectingOnly={isNewQuotation}
      />

      {/* Window Summary Dialog */}
      <WindowSummaryDialog
        products={configuredProducts}
        setProducts={setConfiguredProducts}
        open={showSummary}
        onOpenChange={setShowSummary}
        onDelete={handleDeleteProduct}
        handleSelectMoreProducts={handleSelectMoreProducts}
        isNewQuotation={isNewQuotation}
        onCompleteSummary={handleCompleteSummary}
      />
    </div>
  );
}
