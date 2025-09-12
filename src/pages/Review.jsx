import React, { useState, useEffect } from 'react'
import Preview from '../components/Preview'
import ScoreBadgeTextArea from '../components/ScoreBadgeTextArea'
import { Switch } from "@/components/ui/switch"
import React18JsonView from "react18-json-view"
import { Toaster, toast } from "sonner"

const Review = ({
    file, setFile,
    fileUrl, setFileUrl,
    fileType, processedData, setProcessedData,
    activeItem, setActiveItem,
    reviewJSON, setReviewJSON,
    docId, setDocId
}) => {
    // State management
    const [extractedFields, setExtractedFields] = useState(reviewJSON || []);
    const [formData, setFormData] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isJsonViewerEnabled, setIsJsonViewerEnabled] = useState(false);

    // Initialize form data when reviewJSON changes
    useEffect(() => {
        if (reviewJSON && reviewJSON.length > 0) {
            const validFields = reviewJSON.filter(f => f.field_name);
            setExtractedFields(validFields);

            const initialFormData = {};
            validFields.forEach(field => {
                initialFormData[field.field_name] = field.current_value;
            });
            setFormData(initialFormData);
        }
    }, [reviewJSON]);

    // Handle field changes
    const handleFieldChange = (fieldName, newValue) => {
        setFormData(prevData => {
            const newData = {
                ...prevData,
                [fieldName]: newValue
            };

            const originalField = extractedFields.find(f => f.field_name === fieldName);
            const hasModifications = newValue !== originalField?.current_value;
            setHasChanges(
                hasModifications ||
                Object.keys(newData).some(key => {
                    const original = extractedFields.find(f => f.field_name === key);
                    return newData[key] !== original?.current_value;
                })
            );

            return newData;
        });
    };


    // Save changes
    const handleSave = async () => {
      
        const returnRes = {
            document_id: docId,          
            consolidated_fields: formData
        };

        try {
            const response = await fetch("https://document-processing-langgraph.onrender.com/review-submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(returnRes)
            });

            if (!response.ok) throw new Error(`Failed to submit: ${response.status}`);

            const data = await response.json();
            console.log("Review submit response:", data);

            setHasChanges(false);
              toast.success("Data has been saved!!!");

        } catch (error) {
            console.error(error);
            toast.error("Error submitting review!");
        }
    };

    // Reset to original values
    const handleReset = () => {
        const resetData = {};
        extractedFields.forEach(field => {
            resetData[field.field_name] = field.current_value;
        });
        setFormData(resetData);
        setHasChanges(false);
    };

    return (
        <>
            <div className="flex w-full h-screen">
                {/* Left side - Preview */}
                <div className="w-1/2 border-r border-gray-300">
                    <Preview fileUrl={fileUrl} fileType={fileType} />
                </div>

                {/* Right side - Form fields */}
                <div className="w-1/2 flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Review & Edit Fields</h2>
                            {hasChanges && (
                                <span className="text-orange-500 font-medium">
                                    ⚠️ Unsaved changes
                                </span>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                                >
                                    Reset
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">JSON Viewer</label>
                                <Switch
                                    checked={isJsonViewerEnabled}
                                    onCheckedChange={setIsJsonViewerEnabled}
                                    className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-red-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scrollable form fields */}
                    {isJsonViewerEnabled ? (
                        processedData && (
                            <div className="overflow-auto h-screen w-full bg-white p-3 rounded-lg border-4 border-solid border-black shadow-inner">
                                <React18JsonView
                                    src={processedData}
                                    theme="vscode"
                                    collapsed={10}
                                    displaySize={false}
                                    enableClipboard={false}
                                />
                            </div>
                        )
                    ) : (
                        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                            {extractedFields.length > 0 ? (
                                <div className="space-y-4">
                                    {extractedFields.map((field) => (
                                        <ScoreBadgeTextArea
                                            key={field.field_name}
                                            label={field.field_name}
                                            score={field.current_confidence}
                                            value={formData[field.field_name] || ''}
                                            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                                            placeholder={`Enter ${field.field_name ? field.field_name.replace(/\./g, ' ') : ''}`}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-lg">
                                    ✅ No fields require review.
                                </p>
                            )}

                        </div>
                    )}
                </div>
            </div>

            {/* Toaster outside main container */}
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

export default Review
