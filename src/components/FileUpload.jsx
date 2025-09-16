import React, { useState, useEffect, useCallback } from "react"
import Preview from "./Preview"
import { Toaster, toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trio } from 'ldrs/react'
import 'ldrs/react/Trio.css'
import JsonViewer from "./JsonViewer"
import { 
    Upload, 
    FileText, 
    Image, 
    X, 
    Download, 
    CheckCircle2, 
    AlertCircle,
    ArrowLeft,
    RefreshCw
} from "lucide-react"

const FileUpload = ({ 
    file, 
    setFile, 
    fileUrl, 
    setFileUrl, 
    fileType, 
    setFileType, 
    activeItem, 
    setActiveItem, 
    processedData, 
    setProcessedData, 
    reviewJSON, 
    setReviewJSON,
    docId,
    setDocId 
}) => {
    const [uploadedFile, setUploadedFile] = useState(null)
    const [showUp, setShowUp] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [isDragActive, setIsDragActive] = useState(false)
    const [isReviewLoading, setIsReviewLoading] = useState(false)
    const [fieldsNeedingReview, setFieldsNeedingReview] = useState([])

    // File validation
    const validateFile = (selectedFile) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!selectedFile) {
            toast.error("Please select a file");
            return false;
        }
        
        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error("Only PDF and image files are allowed");
            return false;
        }
        
        if (selectedFile.size > maxSize) {
            toast.error("File size must be less than 10MB");
            return false;
        }
        
        return true;
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Drag and drop handlers
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            const selectedFile = droppedFiles[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
                toast.success(`Selected: ${selectedFile.name}`);
            }
        }
    }, [setFile]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (validateFile(selectedFile)) {
            setFile(selectedFile);
            toast.success(`Selected: ${selectedFile.name}`);
        }
        e.target.value = null;
    };

    const simulateProgress = () => {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 200);
        return interval;
    };

    const handleUpload = async () => {
        if (!file) {
            toast.warning("Please select a file first!");
            return;
        }

        setIsUploading(true);
        const progressInterval = simulateProgress();

        const formData = new FormData();
        formData.append("files", file);

        try {
            const response = await fetch("https://document-processing-langgraph.onrender.com/process-init", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            setUploadedFile(data);
            setUploadProgress(100);
            
            clearInterval(progressInterval);
            toast.success(`Uploaded successfully: ${data.results[0].filename}`);
            
        } catch (error) {
            console.error(error);
            clearInterval(progressInterval);
            setUploadProgress(0);
            toast.error("Error uploading file!");
        } finally {
            setIsUploading(false);
        }
    };

    const handleProcessDocument = async () => {
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

    const resetUpload = () => {
        setShowUp(true);
        setFile(null);
        setUploadedFile(null);
        setFileUrl(null);
        setProcessedData(null);
        setUploadProgress(0);
        setIsUploading(false);
        setIsDragActive(false);
    };

    // Auto-process document after upload
    useEffect(() => {
        if (uploadedFile) {
            handleProcessDocument();
        }
    }, [uploadedFile]);

    // Check for review queue
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

    // Fetch uploaded file
    useEffect(() => {
        if (uploadedFile) {
            const fetchFile = async () => {
                try {
                    const response = await fetch(`https://document-processing-langgraph.onrender.com/raw-document/${uploadedFile.results[0].document_id}`);
                    if (!response.ok) throw new Error("Failed to fetch uploaded file");

                    const blob = await response.blob();
                    setFileUrl(URL.createObjectURL(blob));
                    setShowUp(false);

                } catch (error) {
                    console.error(error);
                    toast.error("Error fetching uploaded file!");
                }
            };

            fetchFile();
        }
    }, [uploadedFile]);

    useEffect(() => {
        if (file?.type) setFileType(file.type);
    }, [file]);

    const getFileIcon = (fileType) => {
        if (fileType?.startsWith('image/')) {
            return <Image className="w-8 h-8 text-blue-500" />;
        }
        return <FileText className="w-8 h-8 text-red-500" />;
    };

    return (
        <>
            {showUp && (
                <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                    <Upload className="w-8 h-8 text-blue-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    Upload Document
                                </h2>
                                <p className="text-gray-600">
                                    Drag and drop your files or click to browse
                                </p>
                            </div>

                            {/* Drag and Drop Zone */}
                            <div
                                className={`
                                    relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer
                                    ${isDragActive 
                                        ? 'border-blue-500 bg-blue-50 scale-105' 
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                                    }
                                `}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="application/pdf,image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <div className="space-y-6">
                                    {/* File Icons */}
                                    <div className="flex justify-center space-x-4">
                                        <div className="p-3 bg-red-100 rounded-lg">
                                            <FileText className="w-6 h-6 text-red-600" />
                                        </div>
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <Image className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>

                                    {isDragActive ? (
                                        <div className="text-blue-600">
                                            <Upload className="w-12 h-12 mx-auto mb-4 animate-bounce" />
                                            <p className="text-xl font-semibold">Drop your file here!</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-lg font-medium text-gray-700 mb-2">
                                                Choose files or drag and drop
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                PDF, PNG, JPG, GIF up to 10MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selected File Display */}
                            {file && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {getFileIcon(file.type)}
                                            <div>
                                                <p className="font-medium text-gray-900">{file.name}</p>
                                                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFile(null)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Progress Bar */}
                                    {(isUploading || uploadProgress > 0) && (
                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                <span>
                                                    {uploadProgress === 100 ? 'Upload Complete' : 'Uploading...'}
                                                </span>
                                                <span>{Math.round(uploadProgress)}%</span>
                                            </div>
                                            <Progress value={uploadProgress} className="h-2" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Upload Button */}
                            {file && !isUploading && uploadProgress !== 100 && (
                                <Button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="w-full mt-6 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    {isUploading ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 mr-2" />
                                            Upload File
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* Upload Success */}
                            {uploadProgress === 100 && !isUploading && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                                        <span className="text-green-800 font-medium">
                                            File uploaded successfully!
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Split Screen Layout */}
            {!showUp && (
                <div className="flex h-screen w-full">
                    {/* Left Panel - Document Preview */}
                    <div className="w-1/2 h-screen border-r border-gray-300">
                        <Preview fileUrl={fileUrl} fileType={fileType} />
                    </div>
                    
                    {/* Right Panel - Your Original Processing Logic */}
                    <div className="w-1/2 h-screen flex flex-col">
                        {isReviewLoading ? (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <Trio size="40" speed="1.3" color="black" />
                                <p className="text-gray-600 text-2xl">
                                    There are {fieldsNeedingReview.length} fields which require review, so pushing the document to review queue.
                                </p>
                            </div>
                        ) : isProcessing ? (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <Trio size="40" speed="1.3" color="black" />
                                <p className="text-gray-600 text-2xl">Processing document...</p>
                            </div>
                        ) : (
                            <>
                                {processedData ? (
                                    <div className="h-full w-full">
                                        <JsonViewer
                                            data={processedData}
                                            activeItem={activeItem}
                                            setActiveItem={setActiveItem}
                                            docId={docId}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col justify-center items-center bg-gray-50 p-6">
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
                                                onClick={resetUpload}
                                            >
                                                Back to Upload
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            <Toaster
                position="bottom-right"
                theme="light"
                expand={true}
                richColors
                toastOptions={{
                    duration: 3000,
                }}
            />
        </>
    );
};

export default FileUpload;
