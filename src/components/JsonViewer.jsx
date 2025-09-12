import React from "react"
import React18JsonView from "react18-json-view"
import { Button } from "@/components/ui/button"
import "react18-json-view/src/style.css"
import { Toaster, toast } from "sonner"
const JsonViewer = ({data,activeItem,setActiveItem }) => {
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
              consolidated_fields: []
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
  
              setHasChanges(false);
                toast.success("Data has been saved!!!");
  
          } catch (error) {
              console.error(error);
              toast.error("Error submitting review! Gemini Api is down please try again after some time.");
          }
      };
  toast.success("Data saved successfully!")
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
          className="bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/80 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300"
        >
          Copy All
        </Button>
         <Button
          variant="primary"
          size="sm"
          // onClick={sendDataToReview}
          onClick={saveData}
          className="bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/80 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300"
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
                }}/>
    </div>
    </>
  )
}


export default JsonViewer
