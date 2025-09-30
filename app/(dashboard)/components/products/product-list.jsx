"use client"
import { useState } from "react";
import { Button } from "@/ui/components/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getProductImageUrl } from "@/constants/pb";
import { getProdPageById } from "@/lib/pb/products";
import { NumberInputDialog } from "./number-input-dialog";
import { SelectionDialog } from "./selection-dialog";
import { WindowSummaryDialog } from "./window-summary-dialog";
import { ProductGrid } from "./product-grid";

export default function ProductList({ products }) {
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

  const handleProductClick = async (product) => {
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
    console.log("User submitted:", userSelection);

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
      // Check if selected item has next_pages
      if (userSelection.next_pages && userSelection.next_pages.length > 0) {
        console.log("Selected item has next_pages:", userSelection.next_pages);

        const newBranch = {
          pages: userSelection.next_pages,
          currentIndex: 0,
          completedSteps: []
        };
        updatedFlowStack.push(newBranch);

        // Add current page's next_pages to current branch (for after selection branch completes)
        if (currentPageData.next_pages && currentPageData.next_pages.length > 0) {
          console.log("Also queuing current page's next_pages:", currentPageData.next_pages);
          currentBranch.pages.push(...currentPageData.next_pages);
        }

        setFlowStack(updatedFlowStack);

        await loadPageById(userSelection.next_pages[0]);
        return;
      } else if (currentPageData.next_pages && currentPageData.next_pages.length > 0) {
        // Selected item has no next_pages, but current page does
        console.log("Adding current page's next_pages:", currentPageData.next_pages);
        currentBranch.pages.push(...currentPageData.next_pages);
      }
    } else if (currentPageData.type === "NUMBER" || currentPageData.type === "TEXT") {
      // For number/text pages, add page's next_pages
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
    // Check if current branch has more pages
    if (currentBranch.currentIndex < currentBranch.pages.length - 1) {
      // Move to next page in current branch
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
      // Current branch is complete
      console.log("Branch complete");

      // Check if this is the last branch
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

    // Add completed branch data to overall flow data
    setAllFlowData(prev => [...prev, ...completedBranch.completedSteps]);

    if (remainingStack.length === 0) {
      // No more branches, flow is complete
      console.log("No more branches, completing flow");
      await completeFlow();
      return;
    }

    // Update stack first
    setFlowStack(remainingStack);

    const parentBranch = remainingStack[remainingStack.length - 1];
    console.log("Parent branch after backtrack:", parentBranch);

    // Move to next page in parent branch, passing the updated stack
    await moveToNextPage(remainingStack);
  };

  const completeFlow = async () => {
    // Collect all remaining data
    const finalData = [...allFlowData];

    // Add any remaining branch data
    flowStack.forEach(branch => {
      finalData.push(...branch.completedSteps);
    });

    console.log("Flow completed!");
    console.log("Final flow data:", finalData);

    // Create configured product object
    const configuredProduct = {
      id: selectedProduct.id, // Generate unique ID
      product: selectedProduct,
      userSelections: finalData,
      quantity: 1
    };

    // Add to configured products list
    setConfiguredProducts(prev => [...prev, configuredProduct]);

    // Close current dialog and show summary
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

  const handlePrevious = async () => {
    const currentBranch = flowStack[flowStack.length - 1];

    if (!currentBranch) return;

    if (currentBranch.currentIndex > 0) {
      // Go back within current branch
      const prevIndex = currentBranch.currentIndex - 1;
      const prevPageId = currentBranch.pages[prevIndex];

      // Remove last completed step from current branch
      const updatedFlowStack = [...flowStack];
      updatedFlowStack[updatedFlowStack.length - 1].completedSteps.pop();
      updatedFlowStack[updatedFlowStack.length - 1].currentIndex = prevIndex;
      setFlowStack(updatedFlowStack);

      await loadPageById(prevPageId);
    } else if (flowStack.length > 1) {
      // Go back to parent branch
      const parentStack = flowStack.slice(0, -1);
      const parentBranch = parentStack[parentStack.length - 1];

      // Remove last step from parent branch
      parentBranch.completedSteps.pop();

      setFlowStack(parentStack);

      // Load parent's current page
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
        {/* Logo and Title section */}
        <div className="flex items-center gap-4">
          <img
            src="https://reliant-windows.co.uk/wp-content/uploads/2024/12/Reliant_Windows_Logo-2.webp"
            alt="Reliant Windows Logo"
            className="h-16 w-auto object-contain"
          />
          <div className="text-left">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800">Our Products</h1>
          </div>
        </div>

        {/* Cart Button */}
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

      {/* Window Summary Dialog */}
      <WindowSummaryDialog
        products={configuredProducts}
        open={showSummary}
        onOpenChange={setShowSummary}
        onDelete={handleDeleteProduct}
        handleSelectMoreProducts={handleSelectMoreProducts}
      />
    </div>
  );
}

