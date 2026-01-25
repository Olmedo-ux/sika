import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Check, CheckCheck, Image as ImageIcon, Mic, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  other_user: {
    id: string;
    name: string;
    role: string;
    company_name?: string;
  };
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  media_type?: 'text' | 'image' | 'audio';
  media_url?: string;
  seen: boolean;
  created_at: string;
}

const quickReplies = [
  "D'accord, merci !",
  "Je confirme",
  "Parfait",
  "À tout à l'heure",
];

interface ChatPanelProps {
  conversation: Conversation;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (content: string, mediaType?: 'text' | 'image' | 'audio', mediaFile?: File) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatPanel({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onBack,
  showBackButton = false,
}: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [audioDurations, setAudioDurations] = useState<{ [key: string]: number }>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    // Scroll to bottom on new messages with smooth behavior
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      setTimeout(() => {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onSendMessage('', 'image', file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
        onSendMessage('', 'audio', file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleQuickReply = (reply: string) => {
    onSendMessage(reply, 'text');
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const msgDate = new Date(date);
    const isToday = msgDate.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = msgDate.toDateString() === yesterday.toDateString();

    if (isToday) return "Aujourd'hui";
    if (isYesterday) return 'Hier';
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(msgDate);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';

    messages.forEach(msg => {
      const msgDate = new Date(msg.created_at).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: formatDate(new Date(msg.created_at)), messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const otherParticipant = conversation.other_user.company_name || conversation.other_user.name;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Sticky */}
      <div className="sticky top-0 z-10 flex items-center gap-2.5 p-3 border-b border-border bg-card/95 backdrop-blur-md shadow-sm">
        {/* Bouton Retour (Mobile uniquement) */}
        {showBackButton && onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="md:hidden rounded-full hover:bg-muted shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        {/* Avatar + Info */}
        <Avatar className="h-9 w-9 border-2 border-primary/30">
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
            {getInitials(otherParticipant)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{otherParticipant}</h3>
          {isTyping ? (
            <p className="text-xs text-primary font-medium animate-pulse">En train d'écrire...</p>
          ) : (
            <p className="text-xs text-muted-foreground">En ligne</p>
          )}
        </div>
      </div>

      {/* Zone Messages avec fond pattern */}
      <ScrollArea className="flex-1 p-3 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" ref={scrollRef}>
        <div className="space-y-4">
          {groupMessagesByDate(messages).map((group, groupIdx) => (
            <div key={groupIdx}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-3">
                <div className="bg-muted/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
                  <span className="text-[10px] font-medium text-muted-foreground">{group.date}</span>
                </div>
              </div>
              {/* Messages */}
              <div className="space-y-1.5">
                {group.messages.map((msg, idx) => {
                  const isOwn = msg.sender_id === currentUserId;
                  const showAvatar = !isOwn && (idx === group.messages.length - 1 || group.messages[idx + 1]?.sender_id !== msg.sender_id);
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300', isOwn ? 'justify-end' : 'justify-start')}
                    >
                      {!isOwn && (
                        <Avatar className={cn('h-7 w-7 shrink-0', showAvatar ? 'opacity-100' : 'opacity-0')}>
                          <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/70 text-secondary-foreground text-[10px]">
                            {getInitials(msg.sender_name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'max-w-[70%] shadow-sm',
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md'
                            : 'bg-white dark:bg-muted text-foreground rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
                        )}
                      >
                        {/* Image */}
                        {msg.media_type === 'image' && msg.media_url && (
                          <div className="relative">
                            <img 
                              src={msg.media_url} 
                              alt="Image partagée" 
                              onClick={() => setSelectedImage(msg.media_url)}
                              className={cn(
                                "w-full max-h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity",
                                msg.content ? "rounded-t-2xl" : isOwn ? "rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md" : "rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-2xl"
                              )}
                            />
                          </div>
                        )}
                        
                        {/* Audio */}
                        {msg.media_type === 'audio' && msg.media_url && (
                          <div className="flex items-center gap-2 px-2.5 py-2 min-w-[180px] max-w-[220px]">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (playingAudio === msg.id) {
                                  audioRefs.current[msg.id]?.pause();
                                  setPlayingAudio(null);
                                } else {
                                  Object.values(audioRefs.current).forEach(audio => audio?.pause());
                                  if (!audioRefs.current[msg.id]) {
                                    const audio = new Audio(msg.media_url);
                                    audio.onended = () => setPlayingAudio(null);
                                    audio.onloadedmetadata = () => {
                                      setAudioDurations(prev => ({
                                        ...prev,
                                        [msg.id]: audio.duration
                                      }));
                                    };
                                    audioRefs.current[msg.id] = audio;
                                  }
                                  audioRefs.current[msg.id]?.play();
                                  setPlayingAudio(msg.id);
                                }
                              }}
                              className="h-8 w-8 rounded-full shrink-0 bg-background/20 hover:bg-background/30 transition-colors"
                            >
                              {playingAudio === msg.id ? (
                                <div className="h-4 w-4 flex items-center justify-center">
                                  <div className="w-0.5 h-3 bg-current rounded-full mx-[1px]" />
                                  <div className="w-0.5 h-3 bg-current rounded-full mx-[1px]" />
                                </div>
                              ) : (
                                <div className="w-0 h-0 border-l-[6px] border-l-current border-y-[4px] border-y-transparent ml-0.5" />
                              )}
                            </Button>
                            <div className="flex-1 flex items-center gap-0.5 h-6">
                              {/* Waveform visuel optimisé */}
                              {[4, 6, 3, 7, 4, 8, 5, 6, 4, 7].map((height, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "w-0.5 rounded-full transition-all duration-150",
                                    playingAudio === msg.id ? "animate-pulse" : "",
                                    isOwn ? "bg-primary-foreground/70" : "bg-foreground/50"
                                  )}
                                  style={{ height: `${height * 2.5}px` }}
                                />
                              ))}
                            </div>
                            <span className={cn(
                              "text-[10px] font-medium shrink-0 tabular-nums",
                              isOwn ? "text-primary-foreground/80" : "text-muted-foreground"
                            )}>
                              {audioDurations[msg.id] 
                                ? `${Math.floor(audioDurations[msg.id] / 60)}:${Math.floor(audioDurations[msg.id] % 60).toString().padStart(2, '0')}`
                                : '0:00'
                              }
                            </span>
                          </div>
                        )}
                        
                        {/* Texte */}
                        {msg.content && (
                          <div className={cn(
                            "px-2.5",
                            msg.media_type === 'image' ? "pt-1.5 pb-1" : "py-1.5"
                          )}>
                            <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        )}
                        
                        {/* Timestamp + Checkmarks */}
                        <div
                          className={cn(
                            'flex items-center justify-end gap-1 px-2.5 pb-1',
                            msg.content || msg.media_type === 'audio' ? 'pt-0' : 'pt-1',
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}
                        >
                          <span className="text-[10px]">{formatTime(new Date(msg.created_at))}</span>
                          {isOwn && (
                            msg.seen ? (
                              <CheckCheck className="h-3.5 w-3.5" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Barre Input Sticky */}
      <div className="sticky bottom-0 p-2.5 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button 
            size="icon" 
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full shrink-0 h-9 w-9 hover:bg-primary/10 hover:text-primary"
            title="Envoyer une image"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost"
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "rounded-full shrink-0 h-9 w-9",
              isRecording ? "text-destructive hover:bg-destructive/10 animate-pulse" : "hover:bg-primary/10 hover:text-primary"
            )}
            title={isRecording ? "Arrêter l'enregistrement" : "Enregistrer un message vocal"}
          >
            {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Input
            placeholder={isRecording ? "🎤 Enregistrement..." : "Message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="rounded-full flex-1 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30 h-10"
            disabled={isRecording}
          />
          <Button 
            size="icon" 
            onClick={handleSend} 
            className="rounded-full shrink-0 h-10 w-10 bg-primary hover:bg-primary/90 shadow-md"
            disabled={!message.trim() || isRecording}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modal Image */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:bg-white/20 rounded-full"
            >
              <ChevronLeft className="h-6 w-6 rotate-180" />
            </Button>
            <img 
              src={selectedImage} 
              alt="Image en grand" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
