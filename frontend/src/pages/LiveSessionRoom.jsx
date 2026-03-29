import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, ExternalLink, MessageCircle, Radio, Send, Users, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const formatSchedule = (scheduledAt) => {
  if (!scheduledAt) return "Scheduling soon";
  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return scheduledAt;
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function LiveSessionRoom({ api }) {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageForm, setMessageForm] = useState({ display_name: "", email: "", message: "" });
  const [rsvpForm, setRsvpForm] = useState({ display_name: "", email: "" });
  const [sending, setSending] = useState(false);
  const [savingRsvp, setSavingRsvp] = useState(false);

  const questionMessages = useMemo(() => messages.filter((entry) => entry.kind === "question"), [messages]);
  const chatMessages = useMemo(() => messages.filter((entry) => entry.kind === "chat"), [messages]);
  const externalJoinUrl = session?.join_url || session?.stream_url;

  useEffect(() => {
    const loadSession = async () => {
      try {
        const [sessionResponse, messageResponse] = await Promise.all([
          api.get(`/live-sessions/${sessionId}`),
          api.get(`/live-sessions/${sessionId}/messages`),
        ]);
        setSession(sessionResponse.data);
        setMessages(messageResponse.data || []);
      } catch (error) {
        console.error("Failed to load live session room:", error);
        toast.error("Could not load this live client space");
        navigate("/live");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [api, navigate, sessionId]);

  const submitMessage = async (kind) => {
    if (!messageForm.display_name || !messageForm.message) {
      toast.error("Please add your name and message");
      return;
    }

    setSending(true);
    try {
      const response = await api.post(`/live-sessions/${sessionId}/messages`, {
        ...messageForm,
        email: messageForm.email.trim() || null,
        kind,
      });
      setMessages((current) => [...current, response.data]);
      setMessageForm((current) => ({ ...current, message: "" }));
      toast.success(kind === "question" ? "Question sent" : "Message sent");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Could not send that right now");
    } finally {
      setSending(false);
    }
  };

  const submitRsvp = async () => {
    if (!rsvpForm.display_name || !rsvpForm.email) {
      toast.error("Please add your name and email to RSVP");
      return;
    }

    setSavingRsvp(true);
    try {
      const response = await api.post(`/live-sessions/${sessionId}/rsvp`, rsvpForm);
      setSession((current) => ({ ...current, attendee_count: response.data.attendee_count }));
      toast.success("You’re on the RSVP list");
    } catch (error) {
      console.error("RSVP failed:", error);
      toast.error("Could not save your RSVP");
    } finally {
      setSavingRsvp(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background animate-pulse" data-testid="live-session-room-loading" />;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background" data-testid="live-session-room">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/live")} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="live-session-room-back-btn">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Client interaction space</p>
            <h1 className="text-xl font-serif" data-testid="live-session-room-title">{session.title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 overflow-hidden bg-card/60" data-testid="live-session-video-panel">
            <div className="aspect-video bg-black/60">
              {session.embed_url ? (
                <iframe
                  title={session.title}
                  src={session.embed_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  data-testid="live-session-embed"
                />
              ) : externalJoinUrl ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <Video className="w-14 h-14 text-primary/60 mb-4" />
                  <h2 className="text-2xl font-serif mb-2">Embedded stream not added yet</h2>
                  <p className="text-sm text-muted-foreground max-w-md mb-6">This session can still be joined using the direct session link below.</p>
                  <Button onClick={() => window.open(externalJoinUrl, "_blank")} data-testid="live-session-join-link-btn">
                    <ExternalLink className="w-4 h-4 mr-2" /> Open session link
                  </Button>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-6">
                  <div>
                    <Radio className="w-14 h-14 text-primary/60 mx-auto mb-4" />
                    <h2 className="text-2xl font-serif mb-2">This live room is being prepared</h2>
                    <p className="text-sm text-muted-foreground max-w-md">The host hasn’t added the live stream embed yet. Please check the schedule and RSVP to receive updates.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-card/60 p-6" data-testid="live-session-interaction-panel">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="w-full h-auto flex flex-wrap gap-2 bg-transparent p-0 justify-start">
                <TabsTrigger value="chat" className="rounded-full border border-white/10 bg-white/5 px-4 py-2" data-testid="live-session-tab-chat">Client Chat</TabsTrigger>
                <TabsTrigger value="qa" className="rounded-full border border-white/10 bg-white/5 px-4 py-2" data-testid="live-session-tab-qa">Q&A</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="space-y-5 mt-5" data-testid="live-session-chat-panel">
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                  {chatMessages.length === 0 ? (
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-sm text-muted-foreground">No chat messages yet — open the conversation.</div>
                  ) : chatMessages.map((entry) => (
                    <div key={entry.id} className="rounded-2xl bg-white/5 border border-white/10 p-4" data-testid={`live-session-chat-message-${entry.id}`}>
                      <p className="text-xs uppercase tracking-[0.16em] text-white/40 mb-2">{entry.display_name}</p>
                      <p className="text-sm text-white/80 leading-relaxed">{entry.message}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <input value={messageForm.display_name} onChange={(event) => setMessageForm((current) => ({ ...current, display_name: event.target.value }))} placeholder="Your name" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm" data-testid="live-session-chat-name-input" />
                  <input value={messageForm.email} onChange={(event) => setMessageForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email (optional)" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm" data-testid="live-session-chat-email-input" />
                </div>
                <textarea value={messageForm.message} onChange={(event) => setMessageForm((current) => ({ ...current, message: event.target.value }))} rows={4} placeholder="Share with the group..." className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm resize-none" data-testid="live-session-chat-message-input" />
                <Button onClick={() => submitMessage("chat")} disabled={sending} data-testid="live-session-chat-submit-btn">
                  <Send className="w-4 h-4 mr-2" /> Send to chat
                </Button>
              </TabsContent>

              <TabsContent value="qa" className="space-y-5 mt-5" data-testid="live-session-qa-panel">
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                  {questionMessages.length === 0 ? (
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-sm text-muted-foreground">No questions yet — invite your clients to ask one.</div>
                  ) : questionMessages.map((entry) => (
                    <div key={entry.id} className="rounded-2xl bg-white/5 border border-white/10 p-4" data-testid={`live-session-question-${entry.id}`}>
                      <p className="text-xs uppercase tracking-[0.16em] text-white/40 mb-2">{entry.display_name}</p>
                      <p className="text-sm text-white/80 leading-relaxed">{entry.message}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <input value={messageForm.display_name} onChange={(event) => setMessageForm((current) => ({ ...current, display_name: event.target.value }))} placeholder="Your name" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm" data-testid="live-session-qa-name-input" />
                  <input value={messageForm.email} onChange={(event) => setMessageForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email (optional)" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm" data-testid="live-session-qa-email-input" />
                </div>
                <textarea value={messageForm.message} onChange={(event) => setMessageForm((current) => ({ ...current, message: event.target.value }))} rows={4} placeholder="Ask your question for the host..." className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm resize-none" data-testid="live-session-qa-message-input" />
                <Button onClick={() => submitMessage("question")} disabled={sending} data-testid="live-session-qa-submit-btn">
                  <MessageCircle className="w-4 h-4 mr-2" /> Send question
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-card/60 p-6 space-y-4" data-testid="live-session-details-card">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">Session details</p>
              <p className="text-sm text-white/75 leading-relaxed">{session.description}</p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3"><Calendar className="w-4 h-4 mt-0.5" /><span>{formatSchedule(session.scheduled_at)}</span></div>
              <div className="flex items-start gap-3"><Clock className="w-4 h-4 mt-0.5" /><span>{session.duration_minutes || 60} minutes</span></div>
              <div className="flex items-start gap-3"><Users className="w-4 h-4 mt-0.5" /><span>{session.attendee_count || 0} RSVPs</span></div>
            </div>

            {session.what_to_bring && (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4" data-testid="live-session-what-to-bring">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2">What to bring</p>
                <p className="text-sm text-white/75 leading-relaxed">{session.what_to_bring}</p>
              </div>
            )}

            {session.client_instructions && (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4" data-testid="live-session-client-instructions">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2">Client instructions</p>
                <p className="text-sm text-white/75 leading-relaxed">{session.client_instructions}</p>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-card/60 p-6 space-y-4" data-testid="live-session-rsvp-card">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-2">RSVP</p>
              <h2 className="text-2xl font-serif">Join this client space</h2>
              <p className="text-sm text-muted-foreground mt-2">Add yourself to the attendee list so the host can plan the room and send follow-up details.</p>
            </div>

            <input value={rsvpForm.display_name} onChange={(event) => setRsvpForm((current) => ({ ...current, display_name: event.target.value }))} placeholder="Your name" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm" data-testid="live-session-rsvp-name-input" />
            <input value={rsvpForm.email} onChange={(event) => setRsvpForm((current) => ({ ...current, email: event.target.value }))} placeholder="Your email" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm" data-testid="live-session-rsvp-email-input" />

            <Button onClick={submitRsvp} disabled={savingRsvp} data-testid="live-session-rsvp-submit-btn">
              {savingRsvp ? "Saving RSVP..." : "Reserve my space"}
            </Button>

            {externalJoinUrl && (
              <Button variant="outline" onClick={() => window.open(externalJoinUrl, "_blank")} data-testid="live-session-direct-link-btn">
                <ExternalLink className="w-4 h-4 mr-2" /> Open direct session link
              </Button>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}