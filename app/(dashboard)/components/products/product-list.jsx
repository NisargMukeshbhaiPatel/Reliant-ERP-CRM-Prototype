"use client"
import { useState } from "react";
import { Button } from "@/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/components/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProductImageUrl } from "@/constants/pb";
import { getProdPageById } from "@/lib/pb/products";
import { NumberInputDialog } from "./number-input-dialog";
import { SelectionDialog } from "./selection-dialog";

export default function ProductList({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPageData, setCurrentPageData] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);

  // Flow management - simplified approach
  const [flowStack, setFlowStack] = useState([]); // Stack of branches to explore
  const [allFlowData, setAllFlowData] = useState([]); // All completed steps

  const { toast } = useToast();

  const handleProductClick = async (product) => {
    setLoadingProductId(product.id);
    try {
      const pageData = await getProdPageById(product.page);
      console.log("Starting flow with page:", pageData);

      setSelectedProduct(product);
      setCurrentPageData(pageData);
      setIsDialogOpen(true);

      // Initialize with first page only
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

    // Create step record
    const stepData = {
      pageId: currentPageData.id,
      pageTitle: currentPageData.title,
      pageType: currentPageData.type,
      userInput: userSelection,
      timestamp: new Date().toISOString()
    };

    // Add to current branch's completed steps
    const updatedFlowStack = [...flowStack];
    const currentBranch = updatedFlowStack[updatedFlowStack.length - 1];
    currentBranch.completedSteps.push(stepData);

    // Determine next actions based on page type and user input
    if (currentPageData.type === "SELECTION") {
      // Check if selected item has next_pages
      if (userSelection.next_pages && userSelection.next_pages.length > 0) {
        console.log("Selected item has next_pages:", userSelection.next_pages);

        // Create new branch for selected item's pages
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

        // Load first page of new branch
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

  const moveToNextPage = async () => {
    const currentBranch = flowStack[flowStack.length - 1];

    if (!currentBranch) {
      await completeFlow();
      return;
    }

    // Check if current branch has more pages
    if (currentBranch.currentIndex < currentBranch.pages.length - 1) {
      // Move to next page in current branch
      const nextIndex = currentBranch.currentIndex + 1;
      const nextPageId = currentBranch.pages[nextIndex];

      console.log(`Moving to next page in branch: ${nextPageId} (index ${nextIndex})`);

      // Update index
      const updatedFlowStack = [...flowStack];
      updatedFlowStack[updatedFlowStack.length - 1].currentIndex = nextIndex;
      setFlowStack(updatedFlowStack);

      await loadPageById(nextPageId);
    } else {
      // Current branch is complete, backtrack
      console.log("Branch complete, backtracking");
      await backtrackToParent();
    }
  };

  const backtrackToParent = async () => {
    const completedBranch = flowStack[flowStack.length - 1];
    const remainingStack = flowStack.slice(0, -1);

    // Add completed branch data to overall flow data
    setAllFlowData(prev => [...prev, ...completedBranch.completedSteps]);

    if (remainingStack.length === 0) {
      // No more branches, flow is complete
      await completeFlow();
      return;
    }

    // Continue with parent branch
    setFlowStack(remainingStack);
    await moveToNextPage();
  };

  const completeFlow = async () => {
    // Collect all remaining data
    const finalData = [...allFlowData];

    // Add any remaining branch data
    flowStack.forEach(branch => {
      finalData.push(...branch.completedSteps);
    });

    console.log("🎉 Flow completed!");
    console.log("Final flow data:", finalData);

    const submissionData = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      userSelections: finalData,
      completedAt: new Date().toISOString(),
    };

    console.log("Submission data:", submissionData);

    // TODO: Submit to your backend
    // await submitProductConfiguration(submissionData);

    toast({
      title: "Configuration completed successfully!",
      description: `Completed ${finalData.length} steps`,
    });

    handleDialogClose();
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

  // UI helper functions
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
      <div className="text-center mb-7">
        <h1 className="text-4xl font-bold text-gray-800">Our Products</h1>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Card key={product.id} onClick={() => handleProductClick(product)} className="group cursor-pointer">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="relative overflow-hidden rounded-t-3xl h-64">
                <img
                  src={getProductImageUrl(product.collectionId, product.id, product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-8 flex flex-col flex-1">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-2xl text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <p className="text-gray-600 text-base leading-relaxed mb-6 flex-1">
                  {product.desc}
                </p>
                <Button
                  variant="primary"
                  className="w-full mt-auto"
                  disabled={loadingProductId === product.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(product);
                  }}
                >
                  {loadingProductId === product.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Select"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
}

