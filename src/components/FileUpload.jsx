import React, { useState, useEffect } from "react"
import Preview from "./Preview"
import { Toaster, toast } from "sonner"
import { Button } from "@/components/ui/button"

import { Trio } from 'ldrs/react'
import 'ldrs/react/Trio.css'
import JsonViewer from "./JsonViewer"




const FileUpload = ({ file, setFile, fileUrl, setFileUrl, fileType, setFileType, activeItem, setActiveItem, processedData, setProcessedData, reviewJSON, setReviewJSON,docId,setDocId }) => {
    // const [file, setFile] = useState(null)
    const [uploadedFile, setUploadedFile] = useState(null)
    // const [fileUrl, setFileUrl] = useState(null)
    const [showUp, setShowUp] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [displayBtns, setDisplayBtns] = useState(true)
    // const [reviewMsg, setReviewMsg] = useState("")
    const [isReviewLoading, setIsReviewLoading] = useState(false)
    const [fieldsNeedingReview, setFieldsNeedingReview] = useState([])
    console.log("ReviewProps",{reviewJSON,setReviewJSON})
    // const [processedData, setProcessedData] = useState(null)
    // console.log("FileUpload props:", { processedData, setProcessedData });

    const handleProcessDocument = async () => {
        // console.log("Process docccc");

        if (!uploadedFile || !uploadedFile.results?.[0]?.document_id) {
            toast.warning("No document ID available to process!");
             return;
        }

        try {
            setIsProcessing(true);

            const response = await fetch(
                `https://document-processing-langgraph.onrender.com/extraction-structured/${uploadedFile.results[0].document_id}`,
                {
                    method: "GET",
                    headers: { "Accept": "application/json" },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const data = await response.json();
            console.log("Structured extraction result:", data);
            setDocId(data?.document_id);
            console.log(docId);
            const mockData = data?.fields || {};
           
            setProcessedData(mockData);

            toast.success("Document processed successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Error processing document!");
        } finally {
            setIsProcessing(false);
        }
    };



    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]

        if (
            !selectedFile ||
            !(
                selectedFile.type === "application/pdf" ||
                selectedFile.type.startsWith("image/")
            )
        ) {
            toast.warning("Only PDF or image files are allowed!")
            e.target.value = null
            setFile(null)
            return
        }

        setFile(selectedFile)
        toast.info(`Selected: ${selectedFile.name}`)
    }

    const handleUpload = async () => {
        if (!file) {
            toast.warning("Please select a PDF/image first!")
            return
        }

        const formData = new FormData()
        formData.append("files", file)

        try {
            const response = await fetch("https://document-processing-langgraph.onrender.com/process-init", { //   http://127.0.0.1:8000/files/upload
                method: "POST",
                body: formData,
            })

            if (!response.ok) throw new Error("Upload failed")

            const data = await response.json()
            setUploadedFile(data) // { filename, url }
            // console.log(data)
            toast.success(`Uploaded successfully: ${data.results[0].filename}`)   //data.filename
            console.log("uploadedFile from handleUpload:")
            console.log(uploadedFile)
            //  handleProcessDocument()
        } catch (error) {
            console.error(error)
            toast.error("Error uploading file!")
        }
    }
    useEffect(() => {
        if (uploadedFile) {
            handleProcessDocument()
        }
    }, [uploadedFile])

    useEffect(() => {
        if (processedData && uploadedFile?.results?.[0]?.document_id) {
            const checkReview = async () => {
                try {
                    const response = await fetch(
                        `https://document-processing-langgraph.onrender.com/review-low-confidence/${uploadedFile.results[0].document_id}`
                    );

                    if (!response.ok) {
                        throw new Error(`Failed to fetch review data: ${response.status}`);
                    }

                    const data = await response.json();

                    if (data.status === "not_found") {
                        toast.success("Document processed successfully with no fields requiring review");
                    } else {
                        const reviewFields = data?.segments?.[0]?.fields_needing_review || [];

                        if (reviewFields.length > 0) {

                            setFieldsNeedingReview(reviewFields);
                            setIsReviewLoading(true);
                            setReviewJSON(reviewFields);

                            setTimeout(() => {
                                setIsReviewLoading(false);
                                setActiveItem("Review Queue");
                            }, 3000);
                        }
                    }
                } catch (error) {
                    console.error(error);
                    toast.error("Error checking review queue!");
                }
            };

            checkReview();
        }
    }, [processedData, uploadedFile]);




    // ``

    // 
    //http://127.0.0.1:8000${uploadedFile.url}

    useEffect(() => {
        if (uploadedFile) {
            const fetchFile = async () => {
                try {
                    const response = await fetch(`https://document-processing-langgraph.onrender.com/raw-document/${uploadedFile.results[0].document_id}`)
                    if (!response.ok) throw new Error("Failed to fetch uploaded file")

                    const blob = await response.blob()
                    setFileUrl(URL.createObjectURL(blob))
                    setShowUp(false)

                    // // 👉 Trigger processing here after preview is ready
                    // handleProcessDocument()
                } catch (error) {
                    console.error(error)
                    toast.error("Error fetching uploaded file!")
                }
            }

            fetchFile()
        }
    }, [uploadedFile])

    useEffect(() => {
        if (file?.type) setFileType(file.type);
    }, [file]);

    return (
        <>
            {showUp && (
                <div className="flex justify-center items-center h-screen w-full bg-grey-50">
                    <div className="p-6 border rounded-xl bg-white   shadow-sm max-w-md ">
                        <h3 className="text-lg font-semibold mb-4">📂 Upload a pdf document or image</h3>

                        <input
                            type="file"
                            accept="application/pdf,image/*"
                            onChange={handleFileChange}
                            className="mb-4 block w-full text-sm text-gray-700 
                                file:mr-4 file:py-2 file:px-4 
                                file:rounded-md file:border-0 
                                file:text-sm file:font-semibold 
                                file:bg-blue-50 file:text-blue-700 
                                hover:file:bg-blue-100"
                        />

                        <button
                            onClick={handleUpload}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Upload
                        </button>
                    </div>
                </div>
            )}

            {/* {setFileType(file?.type)} */}
            {!showUp && (
                <>
                    <div className="h-screen w-1/2 border-r border-gray-300">
                        <Preview fileUrl={fileUrl} fileType={fileType} />
                    </div>
                    {isReviewLoading ? (
                        <div className="w-1/2 flex flex-col items-center">
                            <Trio size="40" speed="1.3" color="black" />
                            <p className="text-gray-600 text-2xl">
                                There are {fieldsNeedingReview.length} fields which require review, so pushing the document to review queue.
                            </p>
                        </div>


                    ) : isProcessing ? (
                        <div className="w-1/2 flex flex-col items-center">
                            <Trio size="40" speed="1.3" color="black" />
                            <p className="text-gray-600 text-2xl">Processing document...</p>
                        </div>
                    ) : (
                        <>
                            {processedData ? (
                                <div className="h-screen w-1/2">
                                    <JsonViewer
                                        data={processedData}
                                        activeItem={activeItem}
                                        setActiveItem={setActiveItem}
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 p-6">
                                    <div className="space-y-4 w-56">
                                        <Button
                                            className="w-full rounded-xl py-6 text-lg font-semibold shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={handleProcessDocument}
                                        >
                                            Process Document
                                        </Button>

                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full rounded-xl py-6 text-lg font-medium border-2 hover:bg-gray-100"
                                        >
                                            <a href={`https://document-processing-langgraph.onrender.com/${uploadedFile?.url}`} download>
                                                Download Original
                                            </a>
                                        </Button>

                                        <Button
                                            className="w-full rounded-xl py-6 text-lg font-medium bg-red-500 hover:bg-red-600 text-white"
                                            onClick={() => {
                                                setShowUp(true)
                                                setFile(null)
                                                setUploadedFile(null)
                                                setFileUrl(null)
                                                setDisplayBtns(false)
                                                setProcessedData(null)
                                            }}
                                        >
                                            Back to Upload
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}



                </>
            )}
            <Toaster
                position="bottom-right"
                theme="light"
                expand={true}
                richColors
                toastOptions={{
                    duration: 2000,
                }}
            />
        </>
    )
}

export default FileUpload
