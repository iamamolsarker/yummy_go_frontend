/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import { X, Plus } from 'lucide-react';

type ImageUploadModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: (url: string) => void;
    title: string;
    imageTypeLabel: string;
};

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
    isOpen,
    onClose,
    onUploadSuccess,
    title,
    imageTypeLabel,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_UPLOAD_API; // Make sure this is in .env

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setUploadError(null);
        }
    };

    const handleClose = () => {
        if (isUploading) return;
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadError(null);
        onClose();
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        if (!IMGBB_API_KEY) {
            setUploadError('Image upload service not configured.');
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed.');

            const data = await res.json();
            if (data.success && data.data?.url) {
                onUploadSuccess(data.data.url);
                handleClose();
            } else {
                throw new Error('Could not get image URL after upload.');
            }
        } catch (err: any) {
            setUploadError(err.message || 'Something went wrong.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300
                        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
            {/* Overlay */}
            <div
                className={`absolute inset-0 bg-black/90 opacity-80 transition-opacity duration-300 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`}
                onClick={handleClose}
            ></div>

            {/* Modal */}
            <div
                className={`relative bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300
                            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{imageTypeLabel}</label>

                    {previewUrl ? (
                        <div className="w-full min-h-[150px] border border-gray-200 rounded-md p-2 flex flex-col items-center">
                            <img src={previewUrl} alt="Preview" className="max-h-48 w-auto object-contain rounded-md" />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-3 text-sm font-semibold text-orange-600 hover:text-orange-800"
                            >
                                Change file
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <Plus size={16} />
                            <span>Choose file</span>
                        </button>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center px-6 py-4 bg-gray-50 border-t rounded-b-lg">
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className="px-8 py-2.5 bg-orange-500 text-white rounded-md font-semibold hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                    >
                        {isUploading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            'Update'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadModal;
