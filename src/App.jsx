import { act, useEffect,useState } from "react"
import Sidebar from "./components/Sidebar.jsx"
import Upload from "./pages/Upload.jsx"
import { Toaster, toast } from "sonner"
import Review from "./pages/Review.jsx"

export default function App() {

  const [activeItem,setActiveItem] = useState("Upload Center")
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [fileType,setFileType] = useState("")
  const [processedData, setProcessedData] = useState(null)
   const [reviewJSON, setReviewJSON] = useState([])
   const [docId,setDocId] = useState("")
  //  console.log("App props:", { activeItem, setActiveItem });
console.log("AppProps",{reviewJSON,setReviewJSON});
  return (
    <div className="flex">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem}/>
      <main className="ml-64 flex-1 flex items-center justify-start min-h-screen  bg-gray-50">
        {activeItem==="Upload Center" && (<Upload file={file} setFile={setFile} fileUrl={fileUrl} setFileUrl={setFileUrl} fileType={fileType} setFileType = {setFileType} activeItem = {activeItem} setActiveItem = {setActiveItem} processedData={processedData} setProcessedData={setProcessedData} reviewJSON={reviewJSON} setReviewJSON = {setReviewJSON} docId = {docId} setDocId={setDocId}/>)}
        {activeItem=== "Review Queue" && (<><Review file={file} setFile={setFile} fileUrl={fileUrl} setFileUrl={setFileUrl} fileType={fileType} processedData={processedData} setProcessedData ={setProcessedData} activeItem={activeItem} setActiveItem={setActiveItem} reviewJSON={reviewJSON} setReviewJSON = {setReviewJSON} docId = {docId} setDocId={setDocId}/></>)}
        {activeItem=== "Documents" && (<><h1 className="text-5xl">Document Page!!!</h1></>)}
        {activeItem=== "Settings" && (<><h1 className="text-5xl">Settings Page!!!</h1></>)}
      </main>



    </div>
  )
}
