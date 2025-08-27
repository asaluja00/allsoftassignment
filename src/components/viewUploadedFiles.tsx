import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const categories = ["Personal", "Professional"];

const ViewUploadedFiles: React.FC = () => {
  const [majorHead, setMajorHead] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);

  const token = localStorage.getItem("token");

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSearch = async () => {
    const payload = {
      major_head: majorHead,
      minor_head: "",
      from_date: fromDate ? formatDate(fromDate) : "",
      to_date: toDate ? formatDate(toDate) : "",
      tags: tags.map((tag) => ({ tag_name: tag })),
      uploaded_by: "",
      start: 0,
      length: 500,
      filterId: "",
      search: {
        value: "",
      },
    };

    const res = await fetch("https://apis.allsoft.co/api/documentManagement/searchDocumentEntry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token || "",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setFiles(data.data || []);
    setSelectedFile(null);
  };

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = ""; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="w-full max-w-3xl bg-white shadow-xl rounded-xl p-8 flex flex-col items-center mt-4"
      style={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Search Uploaded Files</h2>

      <label className="w-full text-left mb-2 text-gray-700 font-medium">Category</label>
      <select
        value={majorHead}
        onChange={(e) => setMajorHead(e.target.value)}
        className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg text-gray-900 bg-white"
      >
        <option value="">-- Select Category --</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <label className="w-full text-left mb-2 text-gray-700 font-medium">Tags</label>
      <div className="flex gap-2 mb-2 w-full">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add tag"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg text-gray-900 bg-white"
        />
        <button
          onClick={handleAddTag}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          type="button"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4 w-full">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-2 text-indigo-500 hover:text-red-500 focus:outline-none"
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      <div className="w-full flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block mb-2 text-gray-700 font-medium">From Date</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg text-gray-900 bg-white"
            dateFormat="dd-MM-yyyy"
            placeholderText="Select From Date"
          />
        </div>
        <div className="flex-1">
          <label className="block mb-2 text-gray-700 font-medium">To Date</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg text-gray-900 bg-white"
            dateFormat="dd-MM-yyyy"
            placeholderText="Select To Date"
          />
        </div>
      </div>

      <button
        onClick={handleSearch}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition mb-8"
      >
        Search
      </button>

    
      <div className="w-full">
        {files.length > 0 && !selectedFile && (
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-2 text-indigo-700">Results:</h3>
            <div className="space-y-4">
              {files.map((file, idx) => (
                <div
                  key={file.document_id}
                  className="block border border-gray-200 rounded-lg p-4 hover:bg-indigo-50 transition cursor-pointer"
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="font-bold text-indigo-800 mb-1">File {idx + 1}</div>
                  <div className="text-sm text-gray-700">
                    <div>
                      <span className="font-semibold">Category:</span> {file.major_head}
                    </div>
                    <div>
                      <span className="font-semibold">Minor Head:</span> {file.minor_head}
                    </div>
                    <div>
                      <span className="font-semibold">Remarks:</span> {file.document_remarks}
                    </div>
                    <div>
                      <span className="font-semibold">Uploaded By:</span> {file.uploaded_by}
                    </div>
                    <div>
                      <span className="font-semibold">Upload Date:</span>{" "}
                      {file.upload_time?.slice(0, 10)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative">
              <button
                className="absolute top-2 right-2 text-xl text-gray-400 hover:text-red-500"
                onClick={() => setSelectedFile(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4 text-indigo-700">File Details</h3>
              <div className="mb-2">
                <span className="font-semibold">Category:</span> {selectedFile.major_head}
              </div>
              <div className="mb-2 text-black">
                <span className="font-semibold">Minor Head:</span> {selectedFile.minor_head}
              </div>
              <div className="mb-2 text-black">
                <span className="font-semibold">Remarks:</span> {selectedFile.document_remarks}
              </div>
              <div className="mb-2 text-black">
                <span className="font-semibold">Uploaded By:</span> {selectedFile.uploaded_by}
              </div>
              <div className="mb-2 text-black">
                <span className="font-semibold">Upload Date:</span>{" "}
                {selectedFile.upload_time?.slice(0, 10)}
              </div>
              <div className="mb-2 text-black">
                <span className="font-semibold">Document Date:</span>{" "}
                {selectedFile.document_date?.slice(0, 10)}
              </div>
            
              <div className="flex gap-4">
                <button
                  onClick={() => window.open(selectedFile.file_url, "_blank")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  View
                </button>
                <button
                  onClick={() => handleDownload(selectedFile.file_url)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUploadedFiles;