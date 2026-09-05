"use client";
import { Bell } from "lucide-react";

const SAMPLE_NOTIFICATIONS = [
  {
    id: "1",
    title: "Offre spéciale!",
    body: "Profitez de -20% sur tous les produits jusqu'à dimanche.",
    date: "2026-09-05",
  },
  {
    id: "2",
    title: "Nouveaux produits",
    body: "Découvrez notre nouvelle collection d'électronique.",
    date: "2026-09-04",
  },
];

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Notifications</h1>

      {SAMPLE_NOTIFICATIONS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Bell className="w-12 h-12 mb-4" />
          <p>Pas de notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {SAMPLE_NOTIFICATIONS.map((notif) => (
            <div key={notif.id} className="bg-white rounded-xl border border-[#E5E5EA] p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#FF6B00]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{notif.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{notif.body}</p>
                  <p className="text-[10px] text-gray-400 mt-2">{notif.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
