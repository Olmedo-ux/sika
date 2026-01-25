import { useState, useEffect, useRef } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useAuth } from '@/contexts/AuthContext';
import { chatApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Search, Send, Mic, StopCircle, Image as ImageIcon, ArrowLeft, Info, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';

interface Conversation {
  id: string;
  other_user: {
    id: string;
    name: string;
    role: string;
    company_name?: string;
    responsible_name?: string;
    avatar?: string;
    phone?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
  updated_at: string;
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

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(true);

  // Charger les conversations depuis l'API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await chatApi.getConversations();
        const conversationsData = Array.isArray(response.data) ? response.data : [];
        setConversations(conversationsData);
        
        // Ouvrir automatiquement la conversation depuis l'URL
        const conversationId = searchParams.get('conversation');
        if (conversationId && conversationsData.length > 0) {
          const conversation = conversationsData.find(c => c.id === conversationId);
          if (conversation) {
            setSelectedConversation(conversation);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les conversations',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user, toast, searchParams]);

  // Charger les messages d'une conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      try {
        const response = await chatApi.getMessages(selectedConversation.id);
        const messagesData = Array.isArray(response.data) ? response.data : [];
        setMessages(prev => ({
          ...prev,
          [selectedConversation.id]: messagesData,
        }));
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les messages',
          variant: 'destructive',
        });
      }
    };

    fetchMessages();
  }, [selectedConversation, toast]);

  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'À l\'instant';
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}j`;
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
  };

  const formatMessageTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSendMessage = async (content: string, mediaType: 'text' | 'image' | 'audio' = 'text', mediaFile?: File) => {
    if (!selectedConversation || !user) return;
    if (!content.trim() && !mediaFile) return;

    try {
      const response = await chatApi.sendMessage(selectedConversation.id, content, mediaType, mediaFile);
      const newMessage = response.data;

      setMessages(prev => ({
        ...prev,
        [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMessage],
      }));

      const lastMessageContent = mediaType === 'image' ? '📷 Image' : mediaType === 'audio' ? '🎤 Message vocal' : content;
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { 
              ...c, 
              last_message: {
                content: lastMessageContent,
                created_at: newMessage.created_at,
                sender_id: user.id,
              },
              updated_at: newMessage.created_at,
            }
          : c
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      handleSendMessage(message.trim(), 'text');
      setMessage('');
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
        handleSendMessage('', 'audio', file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'accéder au microphone',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleSendMessage('', 'image', file);
    }
  };

  const getOtherParticipantName = (conv: Conversation) => {
    // Pour les entreprises (collector/recycler), afficher le nom du responsable
    if (conv.other_user.role === 'collector' || conv.other_user.role === 'recycler') {
      return conv.other_user.responsible_name || conv.other_user.company_name || conv.other_user.name;
    }
    return conv.other_user.name;
  };

  const filteredConversations = conversations.filter(conv => 
    getOtherParticipantName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = selectedConversation ? messages[selectedConversation.id] || [] : [];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header Desktop uniquement */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      {/* Mobile: Liste ou Chat (conditionnel) */}
      <div className="md:hidden h-screen flex flex-col">
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Header Liste Mobile */}
            <div className="p-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
              <h1 className="text-2xl font-bold mb-3 text-primary">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-full bg-muted/50"
                />
              </div>
            </div>
            {/* Liste Conversations Mobile */}
            <ScrollArea className="flex-1">
              <div className="p-1">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Aucune conversation</p>
                    <p className="text-sm">Vos messages apparaîtront ici</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/70 cursor-pointer transition-all relative"
                      onClick={() => setSelectedConversation(conv)}
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-background">
                          {conv.other_user.avatar ? (
                            <img src={conv.other_user.avatar} alt={getOtherParticipantName(conv)} className="w-full h-full object-cover" />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg">
                              {getInitials(getOtherParticipantName(conv))}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                      {/* Contenu */}
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-base truncate">{getOtherParticipantName(conv)}</p>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {conv.last_message ? formatTime(new Date(conv.last_message.created_at)) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate pr-2">
                            {conv.last_message?.content || 'Nouvelle conversation'}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center shrink-0">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <BottomNav />
          </div>
        ) : (
          <ChatPanel
            conversation={selectedConversation}
            messages={currentMessages}
            currentUserId={user?.id || ''}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedConversation(null)}
            showBackButton={true}
          />
        )}
      </div>

      {/* Desktop: Split-View (Liste + Chat) */}
      <div className="hidden md:flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Sidebar Liste (Desktop) */}
        <div className="w-72 border-r border-border flex flex-col bg-card/50 backdrop-blur-sm h-full overflow-hidden">
          {/* Header Liste Desktop */}
          <div className="p-3 border-b border-border bg-card/80">
            <h1 className="text-xl font-bold mb-2 text-primary flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full bg-muted/50"
              />
            </div>
          </div>
          {/* Liste Conversations Desktop */}
          <ScrollArea className="flex-1">
            <div className="p-1">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Aucune conversation</p>
                  <p className="text-sm">Vos messages apparaîtront ici</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = selectedConversation?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      className={cn(
                        'flex items-center gap-2.5 p-2.5 cursor-pointer transition-all relative',
                        isActive ? 'bg-muted' : 'hover:bg-muted/50'
                      )}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      {/* Barre verte à gauche si actif */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                      )}
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-background">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold text-sm">
                            {getInitials(getOtherParticipantName(conv))}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-semibold text-sm truncate">{getOtherParticipantName(conv)}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                            {conv.last_message ? formatTime(new Date(conv.last_message.created_at)) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate pr-2">
                            {conv.last_message?.content || 'Nouvelle conversation'}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shrink-0">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area (Desktop) */}
        {selectedConversation ? (
          <div className="flex-1">
            <ChatPanel
              conversation={selectedConversation}
              messages={currentMessages}
              currentUserId={user?.id || ''}
              onSendMessage={handleSendMessage}
              showBackButton={false}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
            <div className="text-center p-8">
              <div className="bg-primary/10 rounded-full p-6 inline-block mb-4">
                <MessageSquare className="h-20 w-20 text-primary" />
              </div>
              <p className="text-2xl font-bold mb-2">SikaGreen Messagerie</p>
              <p className="text-muted-foreground">Sélectionnez une conversation pour commencer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
