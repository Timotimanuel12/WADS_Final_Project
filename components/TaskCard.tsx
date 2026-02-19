import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TaskProps {
  title: string;
  due: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  subject: string;
}

export default function TaskCard({ title, due, priority, subject }: TaskProps) {
  // Color logic for AI Priority tags
  const priorityColors = {
    HIGH: 'bg-red-100 text-red-700 border-red-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    LOW: 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-3 flex justify-between items-center group">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${priorityColors[priority]}`}>
            {priority} PRIORITY
          </span>
          <span className="text-xs text-gray-500 font-medium">{subject}</span>
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <Clock size={14} />
          <span>Due: {due}</span>
        </div>
      </div>

      <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-bold">Start Focus</span>
      </button>
    </div>
  );
}