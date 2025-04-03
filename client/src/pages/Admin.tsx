import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";

const AdminPage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Stratos Protocol File System content
          </p>
        </div>

        <Tabs defaultValue="ipfs" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ipfs">
              IPFS Management
              <Badge variant="secondary" className="ml-2">
                New
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="videos">Video Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="ipfs" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">IPFS Commands</h2>
              <p className="text-muted-foreground">
                Interact directly with the Stratos Protocol File System (SPFS)
                using these IPFS-compatible commands.
              </p>
            </div>
            {/* <IPFSManager /> */}
          </TabsContent>

          <TabsContent value="videos">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">Video Management</h3>
                  <p className="text-muted-foreground mt-1">
                    Manage videos from different sources including IPFS
                  </p>
                </div>
                <Button onClick={() => (window.location.href = "/admin#ipfs")}>
                  <Video className="h-4 w-4 mr-2" />
                  Import Videos from IPFS
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Video Sources</CardTitle>
                  <CardDescription>
                    The platform can import videos from various sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 rounded-md border">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">IPFS Videos</h4>
                        <p className="text-sm text-muted-foreground">
                          Find and import video files directly from your IPFS
                          storage.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            // Switch to IPFS tab
                            const tabsElement = document.querySelector(
                              '[data-state="active"][role="tabpanel"]'
                            );
                            const ipfsTab = document.querySelector(
                              '[data-value="ipfs"]'
                            );
                            if (ipfsTab && ipfsTab instanceof HTMLElement) {
                              ipfsTab.click();
                            }
                          }}
                        >
                          Go to IPFS Manager
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="text-center p-8">
              <h3 className="text-lg font-medium">User Management</h3>
              <p className="text-muted-foreground mt-2">
                This section is under development. Coming soon!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
