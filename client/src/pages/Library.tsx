import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchVideos, addVideoByCID } from '@/lib/stratosSdk';
import VideoGrid from '@/components/VideoGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const videoCategories = [
  'All',
  'Travel',
  'Music',
  'Entertainment',
  'Technology',
  'Gaming',
  'Sports',
  'Education',
  'Other'
];

function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cidInput, setCidInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all videos
  const { data: videos, isLoading } = useQuery({
    queryKey: ['/api/videos'],
    queryFn: fetchVideos
  });

  // Filter videos by category if needed
  const filteredVideos = videos?.filter(video => 
    selectedCategory === 'All' || video.category === selectedCategory
  ) || [];

  // When we have uploads, sort with newest first
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    // Sort by creation date (descending)
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  
  // Handle adding a video by CID
  const handleAddByCID = async () => {
    if (!cidInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid CID",
        variant: "destructive"
      });
      return;
    }
    
    setIsAdding(true);
    
    try {
      const result = await addVideoByCID(cidInput.trim());
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Video added to your library successfully"
        });
        
        // Refresh the videos list
        queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
        setCidInput(''); // Clear the input field
      } else {
        toast({
          title: "Failed to add video",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Video Library</h1>
          <p className="text-muted-foreground mt-2">
            Browse all uploaded videos including your recently added content
          </p>
        </div>
        
        {/* Add video by CID card */}
        <Card className="bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Add video by CID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter Stratos IPFS Content ID (CID)"
                value={cidInput}
                onChange={(e) => setCidInput(e.target.value)}
                className="flex-grow"
              />
              <Button 
                onClick={handleAddByCID} 
                disabled={isAdding || !cidInput.trim()}
              >
                {isAdding ? "Adding..." : "Add Video"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Enter a CID starting with "Qm" or "bafy" to add an existing IPFS video to your library
            </p>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-background border overflow-x-auto flex-wrap">
            {videoCategories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category.toLowerCase()}
                onClick={() => setSelectedCategory(category)}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <VideoGrid 
              videos={sortedVideos} 
              loading={isLoading}
            />
          </TabsContent>
          
          {videoCategories.slice(1).map(category => (
            <TabsContent key={category} value={category.toLowerCase()} className="mt-0">
              <VideoGrid 
                videos={sortedVideos} 
                loading={isLoading}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export default LibraryPage;