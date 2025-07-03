import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, ExternalLink, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NewsEvent {
  id: string;
  title: string;
  time: string;
  impact: "high" | "medium" | "low";
  currency: string;
  actual?: string;
  forecast?: string;
  previous?: string;
  sentiment: "bullish" | "bearish" | "neutral";
  description?: string;
}

interface CustomNote {
  id: string;
  eventId: string;
  score: number;
  notes: string;
  createdAt: string;
}

export default function News() {
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [customNotes, setCustomNotes] = useState<CustomNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null);
  const [noteScore, setNoteScore] = useState(3);
  const [noteText, setNoteText] = useState("");
  const { toast } = useToast();

  // Simulasi data berita ekonomi
  const mockEvents: NewsEvent[] = [
    {
      id: "1",
      title: "US Non-Farm Payrolls",
      time: "08:30 GMT+7",
      impact: "high",
      currency: "USD",
      actual: "275K",
      forecast: "200K",
      previous: "150K",
      sentiment: "bullish",
      description: "Monthly change in the number of employed people during the previous month"
    },
    {
      id: "2", 
      title: "FOMC Interest Rate Decision",
      time: "02:00 GMT+7",
      impact: "high",
      currency: "USD",
      forecast: "5.50%",
      previous: "5.25%",
      sentiment: "neutral",
      description: "Federal Reserve's decision on interest rates"
    },
    {
      id: "3",
      title: "ECB Press Conference",
      time: "20:30 GMT+7",
      impact: "high",
      currency: "EUR",
      sentiment: "bearish",
      description: "European Central Bank President's press conference"
    },
    {
      id: "4",
      title: "UK GDP Growth Rate",
      time: "14:00 GMT+7",
      impact: "medium",
      currency: "GBP",
      actual: "0.3%",
      forecast: "0.2%",
      previous: "0.1%",
      sentiment: "bullish",
      description: "Quarterly gross domestic product growth rate"
    },
    {
      id: "5",
      title: "Gold Weekly Inventory",
      time: "22:30 GMT+7",
      impact: "medium",
      currency: "XAU",
      sentiment: "neutral",
      description: "Weekly gold inventory data"
    }
  ];

  useEffect(() => {
    // Simulasi fetch data
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const refreshEvents = () => {
    setLoading(true);
    setTimeout(() => {
      setEvents([...mockEvents]);
      setLoading(false);
      toast({
        title: "Events Updated",
        description: "Latest economic events have been fetched.",
      });
    }, 1000);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-loss text-white";
      case "medium":
        return "bg-warning text-black";
      case "low":
        return "bg-profit/20 text-profit";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="h-4 w-4 text-profit" />;
      case "bearish":
        return <TrendingDown className="h-4 w-4 text-loss" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleAddNote = () => {
    if (!selectedEvent || !noteText.trim()) return;

    const newNote: CustomNote = {
      id: Date.now().toString(),
      eventId: selectedEvent.id,
      score: noteScore,
      notes: noteText,
      createdAt: new Date().toISOString(),
    };

    setCustomNotes(prev => [...prev, newNote]);
    setNoteText("");
    setSelectedEvent(null);
    
    toast({
      title: "Note Added",
      description: "Your custom note has been saved.",
    });
  };

  const getEventNotes = (eventId: string) => {
    return customNotes.filter(note => note.eventId === eventId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Economic Calendar & News</h2>
        <Button 
          onClick={refreshEvents}
          className="bg-info text-white hover:bg-blue-600"
          disabled={loading}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events List */}
        <div className="space-y-4">
          <Card className="bg-dark-200 border-dark-300">
            <CardHeader>
              <CardTitle className="text-white">Today's Economic Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event) => {
                const eventNotes = getEventNotes(event.id);
                
                return (
                  <div 
                    key={event.id} 
                    className="p-4 bg-dark-300 rounded-lg hover:bg-dark-400 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getImpactColor(event.impact)}>
                            {event.impact.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-gray-300 border-gray-600">
                            {event.currency}
                          </Badge>
                          {getSentimentIcon(event.sentiment)}
                        </div>
                        
                        <h3 className="font-semibold text-white mb-1">{event.title}</h3>
                        
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.time}
                        </div>

                        {(event.actual || event.forecast || event.previous) && (
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Actual:</span>
                              <span className="text-white ml-1">{event.actual || "-"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Forecast:</span>
                              <span className="text-white ml-1">{event.forecast || "-"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Previous:</span>
                              <span className="text-white ml-1">{event.previous || "-"}</span>
                            </div>
                          </div>
                        )}

                        {eventNotes.length > 0 && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="bg-info/20 text-info">
                              {eventNotes.length} note{eventNotes.length > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Note Entry & Details */}
        <div className="space-y-4">
          {selectedEvent ? (
            <Card className="bg-dark-200 border-dark-300">
              <CardHeader>
                <CardTitle className="text-white">Add Custom Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">{selectedEvent.title}</h4>
                  {selectedEvent.description && (
                    <p className="text-sm text-gray-400 mb-4">{selectedEvent.description}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-400">Sentiment Score (1-5)</Label>
                  <Select value={noteScore.toString()} onValueChange={(value) => setNoteScore(parseInt(value))}>
                    <SelectTrigger className="bg-dark-300 border-dark-400 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-300 border-dark-400">
                      <SelectItem value="1">1 - Very Bearish</SelectItem>
                      <SelectItem value="2">2 - Bearish</SelectItem>
                      <SelectItem value="3">3 - Neutral</SelectItem>
                      <SelectItem value="4">4 - Bullish</SelectItem>
                      <SelectItem value="5">5 - Very Bullish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-400">Custom Notes</Label>
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add your analysis or observations about this event..."
                    className="bg-dark-300 border-dark-400 text-white"
                    rows={4}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleAddNote} className="bg-profit text-white hover:bg-green-600">
                    Save Note
                  </Button>
                  <Button 
                    onClick={() => setSelectedEvent(null)} 
                    variant="outline"
                    className="border-dark-400 text-gray-300 hover:bg-dark-300"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-dark-200 border-dark-300">
              <CardContent className="p-6 text-center">
                <p className="text-gray-400">Select an economic event to add custom notes and analysis</p>
              </CardContent>
            </Card>
          )}

          {/* Existing Notes */}
          {customNotes.length > 0 && (
            <Card className="bg-dark-200 border-dark-300">
              <CardHeader>
                <CardTitle className="text-white">Your Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customNotes.slice(-5).map((note) => {
                  const event = events.find(e => e.id === note.eventId);
                  return (
                    <div key={note.id} className="p-3 bg-dark-300 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-white">
                          {event?.title || "Unknown Event"}
                        </h5>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            note.score >= 4 ? "bg-profit/20 text-profit" :
                            note.score <= 2 ? "bg-loss/20 text-loss" :
                            "bg-warning/20 text-warning"
                          )}
                        >
                          Score: {note.score}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300">{note.notes}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}