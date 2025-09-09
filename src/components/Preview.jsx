import React from "react"

const Preview = ({ fileUrl, fileType }) => {
  if (!fileUrl) return null

  return (
    <>
    <div className="mt-4 w-full h-full p-4">
      <h4 className="text-md font-semibold mb-2">Preview:</h4>

      {fileType === "application/pdf" ? (
        <iframe
          src={`${fileUrl}#toolbar=0`}
          title="PDF Preview"
          className="w-full h-[95vh] border rounded-md"
          style={{ minHeight: "500px" }}
        ></iframe>
      ) : (
        <img
          src={fileUrl}
          alt="Preview"
          className="w-full max-h-[95vh] object-contain border rounded-md"
        />
      )}

    </div>
    </>
  )
}

export default Preview
