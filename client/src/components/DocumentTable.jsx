import { Link } from 'react-router-dom';
import Badge from './Badge';
import { formatBytes, formatDate, roleLabel } from '../utils/format';

export default function DocumentTable({ documents }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Access</th>
              <th className="px-4 py-3 font-medium">Visibility</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-t border-stone-100 hover:bg-stone-50/70">
                <td className="px-4 py-3">
                  <Link to={`/documents/${doc.id}`} className="font-semibold text-ink hover:text-accent">
                    {doc.title}
                  </Link>
                  <div className="text-xs text-stone-500">{doc.originalFilename}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge value={doc.access?.role} />
                  <span className="sr-only">{roleLabel(doc.access?.role)}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge value={doc.visibility} />
                </td>
                <td className="px-4 py-3 text-stone-600">{formatBytes(doc.size)}</td>
                <td className="px-4 py-3 text-stone-600">{formatDate(doc.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
