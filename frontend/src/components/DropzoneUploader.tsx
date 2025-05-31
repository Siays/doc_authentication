import { useDropzone } from 'react-dropzone';
import { useState, useEffect } from 'react';

type Props = {
  onFileSelect: (file: File) => void;
  fileType: {[mimeType: string]: string[]};
  message: string;
};

export default function DropzoneUploader({onFileSelect, fileType, message}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    // accept: {
    //   'image/jpeg': [],
    //   'image/jpg': [],
    //   'image/png': [],
    // },
    accept: fileType,
    multiple: false,
    onDrop: (acceptedFiles) => {
      const selected = acceptedFiles[0];
      if (selected) {
        onFileSelect(selected);
        setPreview(URL.createObjectURL(selected));
      }
    },
  });

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-md px-4 py-6 text-center cursor-pointer text-gray-500 text-sm h-[140px] flex flex-col justify-center"
      >
        <input {...getInputProps()} />

        {!preview ? (
          <>
            <p className="mb-1 font-medium text-gray-600">Drag & drop your file here, or click to select</p>
            <p className="text-xs text-gray-400">{message}</p>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-600 mb-1">Selected:</p>
            <img
              src={preview}
              alt="Preview"
              className="h-20 w-auto rounded border border-gray-200"
            />
          </div>
        )}
      </div>
    </div>
  );
}
