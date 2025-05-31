import { usePageTitles } from "../hooks/usePageTitle";
import { FaPlus, FaEdit , FaFilter} from "react-icons/fa";
import { MdOutlineDocumentScanner  } from "react-icons/md";

export default function HomePage() {
  usePageTitles("Home", "Home Page");

  const recentDocs = Array(9).fill({
    docType: "IC",
    ownerName: "Sia Yeong Sheng Sia Yeong",
    ownerIC: "123456-78-9012",
    uploadedBy: "Sia Yeong Sheng",
    uploadedOn: "22/5/2025",
    uploadedTime: "11.25AM",
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Action Buttons */}
        <div className="flex flex-col gap-6 w-full md:w-1/4">
          <ActionButton icon={<FaPlus size={35}/>} text="New Document" />
          <ActionButton icon={<FaEdit size={35}/>} text="Edit Document" />
          <ActionButton icon={<MdOutlineDocumentScanner size={35}/>} text="Authenticate Document" />
        </div>

        {/* Right: Recent List Table */}
        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent list</h2>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-blue-600 rounded hover:bg-blue-300 transition-colors">
              <FaFilter size={16}/>
            </button>
          </div>
          </div>
          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-3 border">Doc Type</th>
                  <th className="p-3 border">Owner Name</th>
                  <th className="p-3 border">Owner IC</th>
                  <th className="p-3 border">Uploaded By</th>
                  <th className="p-3 border">Uploaded Time</th>
                  <th className="p-3 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc, index) => (
                  <tr key={index} className="odd:bg-blue-50">
                    <td className="p-3 border">{doc.docType}</td>
                    <td className="p-3 border">{doc.ownerName}</td>
                    <td className="p-3 border">{doc.ownerIC}</td>
                    <td className="p-3 border">{doc.uploadedBy}</td>
                    <td className="p-3 border">{`${doc.uploadedOn} ${doc.uploadedTime}`}</td>
                    <td className="p-3 border text-blue-600 underline cursor-pointer">View</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component for Action Buttons
function ActionButton({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <button className="flex flex-col items-center justify-center w-full h-[163px] border-2 border-blue-500 rounded text-blue-600 hover:bg-blue-50 transition-all">
    <div className="text-2xl mb-1">{icon}</div>
    <span className="mt-3 text-sm font-bold text-black">{text}</span>
  </button>
  );
}
