import React, { useState } from "react";
import "./ActivityForm.css";
const ActivityForm = ({ onSubmit, initialData = {}, isSubmitting = false }) => {
  const [type, setType] = useState(initialData.type || "academic");
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [date, setDate] = useState(initialData.date || "");

  const isEditMode = !!initialData.title;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation: title and date required
    if (!title || !date) {
      // Create a floating error notification div
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
      errorMessage.textContent = '⚠️ Please provide both a Title and Date.';
      document.body.appendChild(errorMessage);
      setTimeout(() => {
        errorMessage.remove();
      }, 3000);
      return;
    }

    // Call onSubmit callback with form data
    onSubmit({ type, title, description, date });

    // Clear form fields if adding new activity (not editing)
    if (!isEditMode) {
      setType("academic");
      setTitle("");
      setDescription("");
      setDate("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Type */}
        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Activity Type
            </div>
            <select 
              value={type} 
              onChange={e => setType(e.target.value)}
              className="form-select"
            >
              <option value="academic">📚 Academic</option>
              <option value="co-curricular">🎯 Co-Curricular</option>
            </select>
          </label>
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Date
            </div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="form-input"
              required
            />
          </label>
        </div>
      </div>

      {/* Title */}
      <div className="form-group">
        <label className="form-label">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Title *
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter activity title"
            className="form-input"
            required
          />
        </label>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Description
            <span className="text-gray-400 text-xs">(optional)</span>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the activity, your role, achievements, or any additional details..."
            className="form-textarea"
            rows={4}
          />
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {isEditMode && (
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? (
            <div className="loading flex items-center gap-2">
              <div className="loading-spinner"></div>
              {isEditMode ? 'Updating...' : 'Saving...'}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEditMode ? 'Update Activity' : 'Save Activity'}
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

export default ActivityForm;
