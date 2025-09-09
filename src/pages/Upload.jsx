import React from 'react'
import FileUpload from '../components/fileUpload'

const Upload = ({file,setFile,fileUrl,setFileUrl,fileType,setFileType,activeItem,setActiveItem,processedData,setProcessedData,reviewJSON,setReviewJSON,docId,setDocId}) => {
  //  console.log("Upload props:", { activeItem, setActiveItem });
  return (
    <>
      
    <FileUpload
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
      setReviewJSON = {setReviewJSON}
      docId={docId}
      setDocId={setDocId}
    />
    </>
  )
}

export default Upload
