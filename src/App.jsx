
import { useState } from "react"
import Sidebar from "./components/Sidebar.jsx"
import Upload from "./pages/Upload.jsx"
import Review from "./pages/Review.jsx"

export default function App() {
  const [activeItem, setActiveItem] = useState("Upload Center")
  const [isOpen, setIsOpen] = useState(true)

  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [fileType, setFileType] = useState("")
  const [processedData, setProcessedData] = useState(null)
  const [reviewJSON, setReviewJSON] = useState([])
  const [docId, setDocId] = useState("")

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

    
      <main className="flex-1 flex flex-col items-start justify-start bg-gray-50  transition-all duration-300">
        {activeItem === "Upload Center" && (
          <Upload
            file={file}
            setFile={setFile}
            fileUrl={fileUrl}
            setFileUrl={setFileUrl}
            fileType={fileType}
            setFileType={setFileType}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            processedData={processedData}
            setProcessedData={setProcessedData}
            reviewJSON={reviewJSON}
            setReviewJSON={setReviewJSON}
            docId={docId}
            setDocId={setDocId}
          />
        )}

        {activeItem === "Review Queue" && (
          <Review
            file={file}
            setFile={setFile}
            fileUrl={fileUrl}
            setFileUrl={setFileUrl}
            fileType={fileType}
            processedData={processedData}
            setProcessedData={setProcessedData}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            reviewJSON={reviewJSON}
            setReviewJSON={setReviewJSON}
            docId={docId}
            setDocId={setDocId}
          />
        )}

        {activeItem === "Documents" && (
          <h1 className="text-5xl">Document Page!!!</h1>
        )}

        {activeItem === "Settings" && (
          <h1 className="text-5xl">Settings Page!!!</h1>
        )}
      </main>

    </div>
  )
}
