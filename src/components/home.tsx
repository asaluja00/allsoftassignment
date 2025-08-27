import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
 
//Varibale for form fields
const personalNames = ["Anmol", "Riya", "Amit", "Priya"];
const professionalDepartments = ["IT", "Admin", "HR", "Finance"];

const FileUpload: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | null>(new Date());
  const [majorHead, setMajorHead] = useState("Personal");
  const [minorOptions, setMinorOptions] = useState<string[]>(personalNames);
  const [minorHead, setMinorHead] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<{ id: string; label: string }[]>([]);
  const [newTag, setNewTag] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("token");

  // Update minor options based on majorHead based on selection
  useEffect(() => {
    if (majorHead === "Personal") {
      setMinorOptions(personalNames);
    } else {
      setMinorOptions(professionalDepartments);
    }
    setMinorHead(""); // Reset minor head on change
  }, [majorHead]);

  // Fetch tag suggestions as user types
  useEffect(() => {
    const fetchTags = async () => {
      if (!newTag.trim()) {
        setTagSuggestions([]);
        return;
      } 
      try {
        const res = await fetch(
          "https://apis.allsoft.co/api/documentManagement/documentTags",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { "token": token } : {}),
            },
            body: JSON.stringify({ term: newTag }),
          }
        );
        const data = await res.json();
        // Expecting data.data to be an array of { id, label }
        setTagSuggestions(data.data || []);
      } catch {
        setTagSuggestions([]);
      }
    };

    const timeout = setTimeout(fetchTags, 300); // debounce
    return () => clearTimeout(timeout);
  }, [newTag, token]);

  const handleAddTag = (tagToAdd?: string) => {
    const tag = tagToAdd ?? newTag;
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag("");
      setTagSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && (selected.type === "application/pdf" || selected.type.startsWith("image/"))) {
      setFile(selected);
      setError("");
    } else {
      setError("Only PDF and image files are allowed.");
    }
  };

  const handleSubmit = async () => {
    if (!file || !minorHead || !date) {
      setError("Please fill all required fields.");
      return;
    }
    const data = {
        document_date: date.toISOString(),
        major_head: majorHead,
        minor_head: minorHead,
        tags: tags, 
        document_remarks: remarks,
        user_id: "anmol" 
};

    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    formData.append("file", file);

    try {
      const res = await fetch("https://apis.allsoft.co/api/documentManagement/uploadDocument", {
        method: "POST",
         headers: {
              "Content-Type": "application/json",
              ...(token ? { "token": token } : {}),
            },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert("File uploaded successfully!");
      } else {
        setError(data.message || "Upload failed.");
      }
    } catch {
      setError("Server error during upload.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Handle keyboard navigation for tag suggestions
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      handleAddTag();
      e.preventDefault();
    }
    if (e.key === "ArrowDown" && tagSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-blue-100 to-indigo-200 min-h-screen min-w-screen">
      <nav className="w-full flex items-center justify-between bg-white shadow-md px-8 py-4">
        <span className="text-2xl font-bold text-indigo-700 tracking-wide">allsoft</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold text-white"
        >
          Logout
        </button>
      </nav>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-xl bg-white shadow-xl rounded-xl p-8 flex flex-col items-center mt-4">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">Upload Document</h2>
          <label className="w-full text-left mb-2 text-gray-700 font-medium">Select Date</label>
          <div className="w-full">
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg text-gray-900 bg-white"
            />
          </div>

          <label className="w-full text-left mb-2 text-gray-700 font-medium">Category</label>
          <select
            value={majorHead}
            onChange={(e) => setMajorHead(e.target.value)}
            className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg text-gray-900 bg-white"
          >
            <option value="Personal">Personal</option>
            <option value="Professional">Professional</option>
          </select>

          
          <label className="w-full text-left mb-2 text-gray-700 font-medium">
            {majorHead === "Personal" ? "Select Name" : "Select Department"}
          </label>
          <select
            value={minorHead}
            onChange={(e) => setMinorHead(e.target.value)}
            className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg text-gray-900 bg-white"
          >
            <option value="">-- Select --</option>
            {minorOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>

        
          <label className="w-full text-left mb-2 text-gray-700 font-medium">Tags</label>
          <div className="relative w-full mb-2">
            <div className="flex gap-2">
              <input
                ref={tagInputRef}
                type="text"
                value={newTag}
                onChange={(e) => {
                  setNewTag(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add tag"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg text-gray-900 bg-white"
              />
              <button
                onClick={() => handleAddTag()}
                className="bg-indigo-600 text-black px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                type="button"
              >
                Add
              </button>
            </div>
            {showSuggestions && tagSuggestions.length > 0 && (
              <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow">
                {tagSuggestions.map((suggestion, idx) => (
                  <li
                    key={suggestion.id}
                    className="px-4 py-2 cursor-pointer hover:bg-indigo-100 text-black"
                    onMouseDown={() => handleAddTag(suggestion.label)}
                  >
                    {suggestion.label}
                  </li>
                ))}
              </ul>
            )}
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

          <label className="w-full text-left mb-2 text-gray-700 font-medium">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            className="w-full px-2 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg text-gray-900 bg-white"
            placeholder="Enter remarks..."
          />

          <label className="w-full text-left mb-2 text-gray-700 font-medium">Upload File</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="mb-4 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />


          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Upload
          </button>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;

