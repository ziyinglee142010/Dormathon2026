import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import * as FR from "flowbite-react";

// SAFETY: use Flowbite if present, else fallback to simple HTML
const Navbar = FR.Navbar ?? (({ children }) => (
  <div className="border-b bg-white px-4 py-3">{children}</div>
));
const Button = FR.Button ?? (({ children, className = "", ...rest }) => (
  <button
    className={`px-3 py-1.5 rounded-md border hover:bg-gray-100 ${className}`}
    {...rest}
  >
    {children}
  </button>
));
const Card = FR.Card ?? (({ children, className = "" }) => (
  <div className={`bg-white border rounded-xl p-4 ${className}`}>{children}</div>
));

function fmtHM(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
function diffMins(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 60000);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [username] = useState(localStorage.getItem("username") || "Therapist");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
        setLoading(true);
        const response = await api.get("/api/sessions/").then((response) => {
            if (response.status !== 200) {
                toast.error("Failed to fetch sessions: " + response.data.error);
                throw new Error("Failed to fetch sessions");
            } else {
                setSessions(response.data);
                setLoading(false);
            }

        }).catch((error) => {
            console.error("Error fetching sessions:", error);
            toast.error("Failed to fetch sessions: " + error.message + ". Please refresh the page.");
            setLoading(false);
        });
  }

  useEffect(() => {
    fetchSessions();
  }, []);



  // 🔹 Hard-coded demo sessions
  // const sessions = [
  //   {
  //     id: 1,
  //     patient: { name: "John Doe" },
  //     description: "Weekly therapy session",
  //     date: todayISO(),
  //     time: "14:00",
  //     zoom_link: "https://zoom.us/j/123456789",
  //   },
  //   {
  //     id: 2,
  //     patient: { name: "Jane Smith" },
  //     description: "Follow-up check-in",
  //     date: todayISO(),
  //     time: "16:30",
  //     zoom_link: "https://zoom.us/j/987654321",
  //   },
  // ];

  const todays = useMemo(() => {
    const iso = todayISO();
    const now = new Date();
    return (sessions || [])
      .filter((s) => s.date === iso)
      .map((s) => {
        const startStr = s.time || "00:00";
        const start = new Date(`${s.date}T${startStr}`);
        const mins = diffMins(start, now);
        return {
          ...s,
          _start: start,
          _minsToStart: mins,
          _canJoin: mins <= 10 && mins >= -120,
        };
      })
      .sort((a, b) => a._start - b._start);
  }, [sessions]);

  const handleJoin = async (s) => {
    try {
      const res = await api.post("/api/sessions/start/", {
        patient: s.patient.id,
      });
      const zoomLink = res.data.zoom_link;
      if (zoomLink) {
        window.open(zoomLink, "_blank", "noopener,noreferrer");
      } else {
        toast.error("No Zoom link returned.");
      }
    } catch (err) {
      console.error("Error joining session:", err);
      toast.error("Failed to join session: " + err.message);
    }
};

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="min-h-screen dark:bg-gray-800 bg-gray-50">
      {/* Top Nav */}
      <Navbar fluid rounded>
        <div className="flex w-full items-center justify-between">
          <div className="text-xl font-semibold">
            AI-Assisted Emotion Tagging Tool
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Hello, <b>{username}</b>
            </span>
            <Button color="light" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </Navbar>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="text-sm font-semibold text-gray-500">
          {new Date().toLocaleDateString(undefined, {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </h2>
        <h1 className="mt-1 text-2xl font-bold">Today’s Sessions</h1>

        {todays.length === 0 ? (
          <p className="mt-6 text-gray-500">No sessions scheduled today.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {todays.map((s) => (
              <Card key={s.id} className="border rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Session with</p>
                    <p className="text-lg font-semibold">
                      {s.patient?.name || "Patient"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {fmtHM(s._start)} • {s.description || "No description"}
                    </p>
                  </div>
                  {s._canJoin ? (
                    <Button onClick={() => handleJoin(s)}>Start</Button>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Starts in{" "}
                      {s._minsToStart > 0 ? `${s._minsToStart}m` : "later"}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Button color="light" onClick={() => navigate("/patients")}>
            View My Patients
          </Button>
        </div>
      </main>
    </div>
  );
}
