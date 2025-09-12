import React from "react"
import React18JsonView from "react18-json-view"
import { Button } from "@/components/ui/button"
import "react18-json-view/src/style.css"
import { Toaster, toast } from "sonner"
const JsonViewer = ({ data, activeItem, setActiveItem, docId }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    toast.success("Copied to clipboard!!!📋")
  }
  console.log("JsonViewer props:", { activeItem, setActiveItem });
  const sendDataToReview = () => {
    setActiveItem("Review Queue")
    console.log(activeItem)
  }
  if (!data) return null

  const saveData = async () => {
    {

      const returnRes = {
        document_id: docId,
        consolidated_fields: {}
      };

      try {
        const response = await fetch("https://document-processing-langgraph.onrender.com/review-submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(returnRes)
        });

        if (!response.ok) throw new Error(`Failed to submit: ${response.status} `);

        const data = await response.json();
        console.log("Review submit response:", data);


        toast.success("Data has been saved!!!");

      } catch (error) {
        console.error(error);
        toast.error("Error submitting review! Gemini Api is down please try again after some time.");
      }
    };
    // toast.success("Data saved successfully!")
  }

  return (
    <>

      <div className="flex flex-col flex-1 mt-4 w-full h-full p-4 bg-gray-50   shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-md font-semibold ">ProcessedJson:</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="bg-gradient-to-r from-gray-100 to-white text-gray-800 border border-gray-300 rounded-lg shadow hover:bg-gray-200 hover:text-black transition-all duration-200 px-4 py-2 font-semibold"
          >
            Copy All
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={saveData}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border border-blue-600 rounded-lg shadow hover:from-blue-600 hover:to-blue-800 hover:scale-105 transition-all duration-200 px-4 py-2 font-semibold"
          >
            Save Data
          </Button>
        </div>

        {/* Scrollable JSON Viewer */}
        <div className="overflow-auto h-screen w-full bg-white p-3 rounded-lg border-4 border-solid border-black shadow-inner">
          <React18JsonView
            src={data}
            theme="vscode"
            collapsed={10}
            displaySize={false}
            enableClipboard={false}
          />
        </div>
      </div>
      <div>
        <Toaster
          position="bottom-right"
          theme="light"
          expand={true}
          richColors
          toastOptions={{
            duration: 2000,
          }} />
      </div>
    </>
  )
}


export default JsonViewer
