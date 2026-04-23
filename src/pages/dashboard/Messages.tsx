import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

type Conversation = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  last_message: string;
  last_at: string;
  unread: number;
};

const Messages = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const withId = params.get("with");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [peer, setPeer] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Load conversation list
  const loadConversations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, content, created_at, read_at")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    const map = new Map<string, Conversation>();
    for (const m of (data ?? []) as Msg[]) {
      const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
      if (!map.has(other)) {
        map.set(other, {
          user_id: other,
          display_name: null,
          avatar_url: null,
          last_message: m.content,
          last_at: m.created_at,
          unread: 0,
        });
      }
      if (m.recipient_id === user.id && !m.read_at) {
        map.get(other)!.unread += 1;
      }
    }
    const ids = [...map.keys()];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", ids);
      for (const p of profs ?? []) {
        const c = map.get(p.id);
        if (c) { c.display_name = p.display_name; c.avatar_url = p.avatar_url; }
      }
    }
    setConversations([...map.values()]);
  };

  // Load thread for selected peer
  const loadThread = async (peerId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, content, created_at, read_at")
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${peerId}),and(sender_id.eq.${peerId},recipient_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as Msg[]);
    const { data: p } = await supabase.from("profiles").select("display_name, avatar_url").eq("id", peerId).maybeSingle();
    setPeer(p ?? null);
    // mark unread as read
    await supabase.from("messages").update({ read_at: new Date().toISOString() })
      .eq("recipient_id", user.id).eq("sender_id", peerId).is("read_at", null);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      await loadConversations();
      if (withId) await loadThread(withId);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, withId]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("messages-" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as Msg;
        const involves = m.sender_id === user.id || m.recipient_id === user.id;
        if (!involves) return;
        const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
        if (other === withId) {
          setMessages((prev) => [...prev, m]);
        }
        loadConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, withId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!user || !withId || !text.trim()) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: withId,
      content: text.trim(),
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setText("");
  };

  const select = (uid: string) => {
    const next = new URLSearchParams(params);
    next.set("with", uid);
    setParams(next, { replace: true });
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">Chat with guides and travelers.</p>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-4 h-[60vh]">
        {/* Sidebar */}
        <Card className="overflow-hidden">
          <CardContent className="p-0 h-full overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-sm text-center text-muted-foreground">
                <MessageSquare className="size-6 mx-auto mb-2 opacity-60" />
                No conversations yet.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.user_id}
                  onClick={() => select(c.user_id)}
                  className={cn(
                    "w-full text-left p-3 border-b hover:bg-muted/50 transition flex items-center gap-3",
                    withId === c.user_id && "bg-muted"
                  )}
                >
                  <div className="size-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {c.avatar_url && <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{c.display_name ?? "User"}</p>
                      {c.unread > 0 && <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center">{c.unread}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.last_message}</p>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Thread */}
        <Card className="overflow-hidden flex flex-col">
          {!withId ? (
            <div className="flex-1 grid place-items-center text-sm text-muted-foreground">
              Select a conversation to start chatting.
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b flex items-center gap-3">
                <div className="size-9 rounded-full bg-muted overflow-hidden">
                  {peer?.avatar_url && <img src={peer.avatar_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <p className="font-semibold text-sm">{peer?.display_name ?? "User"}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Say hi 👋</p>}
                {messages.map((m) => {
                  const mine = m.sender_id === user!.id;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[70%] px-3 py-2 rounded-2xl text-sm",
                        mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"
                      )}>
                        {m.content}
                        <div className={cn("text-[10px] mt-1 opacity-70", mine ? "text-right" : "")}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <div className="border-t p-3 flex gap-2">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Type a message..."
                />
                <Button onClick={send} disabled={sending || !text.trim()} className="gradient-lava text-primary-foreground border-0 shadow-lava">
                  <Send className="size-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
