import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  fetchIPFSContent,
  pinContent,
  unpinContent,
  listMFSFiles,
  addToMFS,
  findIPFSVideos,
  importIPFSVideos,
  testGatewayConnection,
  getGatewayConfig,
  updateRpcApi,
  updatePublicGateway,
  updatePathGateway,
  IPFSVideoFile,
} from "@/lib/stratosSdk";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  FileText,
  FolderTree,
  Link,
  Pin,
  Video,
  Download,
  RefreshCw,
  Import,
  Wifi,
  CheckCircle,
  XCircle,
  Settings,
  Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const IPFSManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for inputs
  const [catCid, setCatCid] = useState("");
  const [catResult, setCatResult] = useState("");
  const [pinCid, setPinCid] = useState("");
  const [unpinCid, setUnpinCid] = useState("");
  const [mfsPath, setMfsPath] = useState("/");
  const [mfsAddCid, setMfsAddCid] = useState("");
  const [mfsAddPath, setMfsAddPath] = useState("/");

  // Loading states
  const [isLoadingCat, setIsLoadingCat] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    status?: string;
    message?: string;
  } | null>(null);

  // Gateway configuration states
  const [rpcApiInput, setRpcApiInput] = useState("");
  const [publicGatewayInput, setPublicGatewayInput] = useState("");
  const [pathGatewayInput, setPathGatewayInput] = useState("");
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  // Effect to load configs on component mount
  useEffect(() => {
    // Load the gateway configuration when the component mounts (silent mode - no toasts)
    handleFetchConfig(false);
  }, []);

  // Query for MFS files
  const {
    data: mfsFiles,
    isLoading: isLoadingMfs,
    isError: isMfsError,
    error: mfsError,
    refetch: refetchMfs,
  } = useQuery({
    queryKey: ["mfsFiles", mfsPath],
    queryFn: () => listMFSFiles(mfsPath),
    enabled: false,
  });

  // Mutations
  const pinMutation = useMutation({
    mutationFn: (cid: string) => pinContent(cid),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Content with CID ${pinCid} has been pinned.`,
      });
      setPinCid("");
    },
    onError: (error) => {
      toast({
        title: "Failed to pin content",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const unpinMutation = useMutation({
    mutationFn: (cid: string) => unpinContent(cid),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Content with CID ${unpinCid} has been unpinned.`,
      });
      setUnpinCid("");
    },
    onError: (error) => {
      toast({
        title: "Failed to unpin content",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const mfsAddMutation = useMutation({
    mutationFn: ({ cid, path }: { cid: string; path: string }) =>
      addToMFS(cid, path),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Added CID ${mfsAddCid} to MFS at ${mfsAddPath}`,
      });
      setMfsAddCid("");
      setMfsAddPath("/");

      // Refetch MFS files
      refetchMfs();
    },
    onError: (error) => {
      toast({
        title: "Failed to add to MFS",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  // Handle fetching IPFS content
  const handleCat = async () => {
    if (!catCid) {
      toast({
        title: "CID Required",
        description: "Please enter a valid CID to fetch content",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingCat(true);
    setCatResult("");

    try {
      const content = await fetchIPFSContent(catCid);
      setCatResult(content);
    } catch (error) {
      toast({
        title: "Failed to fetch content",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCat(false);
    }
  };

  // Handle pinning content
  const handlePin = () => {
    if (!pinCid) {
      toast({
        title: "CID Required",
        description: "Please enter a valid CID to pin",
        variant: "destructive",
      });
      return;
    }

    pinMutation.mutate(pinCid);
  };

  // Handle unpinning content
  const handleUnpin = () => {
    if (!unpinCid) {
      toast({
        title: "CID Required",
        description: "Please enter a valid CID to unpin",
        variant: "destructive",
      });
      return;
    }

    unpinMutation.mutate(unpinCid);
  };

  // Handle listing MFS files
  const handleMfsList = () => {
    refetchMfs();
  };

  // Handle adding to MFS
  const handleMfsAdd = () => {
    if (!mfsAddCid) {
      toast({
        title: "CID Required",
        description: "Please enter a valid CID to add to MFS",
        variant: "destructive",
      });
      return;
    }

    if (!mfsAddPath) {
      toast({
        title: "Path Required",
        description: "Please enter a valid MFS path",
        variant: "destructive",
      });
      return;
    }

    mfsAddMutation.mutate({
      cid: mfsAddCid,
      path: mfsAddPath,
    });
  };

  // Handle fetching gateway configuration
  const handleFetchConfig = async (showToasts = true) => {
    setIsLoadingConfig(true);

    try {
      const config = await getGatewayConfig();

      // Update the input fields with current values
      setRpcApiInput(config.rpcApi);
      setPublicGatewayInput(config.publicGateway);
      setPathGatewayInput(config.pathGateway);

      if (showToasts) {
        toast({
          title: "Configuration Loaded",
          description: "Gateway configuration loaded successfully",
        });
      }
    } catch (error) {
      if (showToasts) {
        toast({
          title: "Failed to Load Configuration",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingConfig(false);
    }
  };

  // Handle updating gateway configurations
  const handleUpdateConfig = async () => {
    setIsUpdatingConfig(true);

    try {
      let updated = false;

      // Update RPC API if provided
      if (rpcApiInput) {
        const result = await updateRpcApi(rpcApiInput);
        if (result.status === "success") {
          updated = true;
        }
      }

      // Update Public Gateway if provided
      if (publicGatewayInput) {
        const result = await updatePublicGateway(publicGatewayInput);
        if (result.status === "success") {
          updated = true;
        }
      }

      // Update Path Gateway if provided
      if (pathGatewayInput) {
        const result = await updatePathGateway(pathGatewayInput);
        if (result.status === "success") {
          updated = true;
        }
      }

      if (updated) {
        toast({
          title: "Configuration Updated",
          description: "Gateway configuration updated successfully",
        });
      } else {
        toast({
          title: "No Changes Made",
          description: "No configuration changes were submitted",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Update Configuration",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  // Handle testing gateway connection
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);

    try {
      const response = await testGatewayConnection();
      setConnectionStatus(response);

      if (response.status === "success") {
        toast({
          title: "Connection Test Successful",
          description:
            response.message || "Successfully connected to IPFS gateway",
        });
      } else {
        toast({
          title: "Connection Test Failed",
          description: response.message || "Failed to connect to IPFS gateway",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });

      toast({
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="cat">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              <span>Cat - Display IPFS File Contents</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Display IPFS File Contents</CardTitle>
                <CardDescription>
                  Retrieves and displays the contents of an IPFS object
                  identified by its CID.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Content Identifier (CID)
                  </label>
                  <Input
                    placeholder="bafybeiczsscdsbs7aaqkzycojjrg5o3pnlrpgfvxkjieghadas3kzwpuqe"
                    value={catCid}
                    onChange={(e) => setCatCid(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCat}
                  disabled={isLoadingCat}
                  className="w-full"
                >
                  {isLoadingCat && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Fetch Content
                </Button>
                {catResult && (
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      value={catResult}
                      readOnly
                      className="h-32 font-mono text-sm"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pin">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <Pin className="h-5 w-5 mr-2" />
              <span>Pin - Pin Objects to Local Storage</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Pin Content</CardTitle>
                <CardDescription>
                  Pins an IPFS object to the node, preventing it from being
                  garbage collected.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Content Identifier (CID)
                  </label>
                  <Input
                    placeholder="bafybeiczsscdsbs7aaqkzycojjrg5o3pnlrpgfvxkjieghadas3kzwpuqe"
                    value={pinCid}
                    onChange={(e) => setPinCid(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handlePin}
                  disabled={pinMutation.isPending}
                  className="w-full"
                >
                  {pinMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Pin Content
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="unpin">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <Pin className="h-5 w-5 mr-2" />
              <span>Unpin - Remove Pinned Objects</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Unpin Content</CardTitle>
                <CardDescription>
                  Removes the pin from an IPFS object, allowing it to be garbage
                  collected.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Content Identifier (CID)
                  </label>
                  <Input
                    placeholder="bafybeiczsscdsbs7aaqkzycojjrg5o3pnlrpgfvxkjieghadas3kzwpuqe"
                    value={unpinCid}
                    onChange={(e) => setUnpinCid(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleUnpin}
                  disabled={unpinMutation.isPending}
                  className="w-full"
                >
                  {unpinMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Unpin Content
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mfs">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <FolderTree className="h-5 w-5 mr-2" />
              <span>MFS - Mutable File System Operations</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>MFS Operations</CardTitle>
                <CardDescription>
                  Work with the Mutable File System (MFS) which acts like a
                  traditional filesystem.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      MFS Directory Path
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="/"
                        value={mfsPath}
                        onChange={(e) => setMfsPath(e.target.value)}
                      />
                      <Button onClick={handleMfsList} disabled={isLoadingMfs}>
                        {isLoadingMfs && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        List Files
                      </Button>
                    </div>
                  </div>

                  {mfsFiles && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Directory Contents
                      </label>
                      {mfsFiles.entries.length === 0 ? (
                        <div className="py-4 text-center text-muted-foreground">
                          No files found in this directory
                        </div>
                      ) : (
                        <div className="border rounded-md">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Type</th>
                                <th className="px-4 py-2 text-right">Size</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mfsFiles.entries.map((entry, i) => (
                                <tr key={i} className="border-b last:border-0">
                                  <td className="px-4 py-2">{entry.name}</td>
                                  <td className="px-4 py-2">{entry.type}</td>
                                  <td className="px-4 py-2 text-right">
                                    {entry.size
                                      ? `${(entry.size / 1024).toFixed(2)} KB`
                                      : "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-base font-medium mb-3">Add to MFS</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Content Identifier (CID)
                      </label>
                      <Input
                        placeholder="bafybeiczsscdsbs7aaqkzycojjrg5o3pnlrpgfvxkjieghadas3kzwpuqe"
                        value={mfsAddCid}
                        onChange={(e) => setMfsAddCid(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Destination Path in MFS
                      </label>
                      <Input
                        placeholder="/myfile.txt"
                        value={mfsAddPath}
                        onChange={(e) => setMfsAddPath(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleMfsAdd}
                      disabled={mfsAddMutation.isPending}
                      className="w-full"
                    >
                      {mfsAddMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Add to MFS
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="videos">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              <span>Videos - Find & Import IPFS Videos</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Video Import Operations</CardTitle>
                <CardDescription>
                  Find videos stored in IPFS and import them into your platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          // Find videos
                          queryClient.fetchQuery({
                            queryKey: ["ipfsVideos"],
                            queryFn: () => findIPFSVideos(),
                          });
                        }}
                        className="flex-1"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Scan for Videos
                      </Button>
                      <Button
                        onClick={() => {
                          // Import videos
                          queryClient.fetchQuery({
                            queryKey: ["importIPFSVideos"],
                            queryFn: () => importIPFSVideos(),
                          });
                        }}
                        variant="default"
                        className="flex-1"
                      >
                        <Import className="mr-2 h-4 w-4" /> Import All Videos
                      </Button>
                    </div>

                    <div className="text-center p-6 text-muted-foreground">
                      <Video className="mx-auto h-12 w-12 opacity-20 mb-2" />
                      <p>
                        Click "Scan for Videos" to search for video files in
                        your IPFS storage
                      </p>
                      <p className="text-sm mt-2">
                        Then use "Import All Videos" to add them to the platform
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="connection">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <Wifi className="h-5 w-5 mr-2" />
              <span>Connection - Test IPFS Gateway Connection</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Gateway Connection Test</CardTitle>
                <CardDescription>
                  Test connectivity to the IPFS gateway to verify that your
                  application can access the decentralized storage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="w-full"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Wifi className="mr-2 h-4 w-4" />
                      Test Gateway Connection
                    </>
                  )}
                </Button>

                {connectionStatus && (
                  <div
                    className={`mt-4 p-4 rounded-md border ${
                      connectionStatus.status === "success"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center">
                      {connectionStatus.status === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <div>
                        <h3
                          className={`font-medium ${
                            connectionStatus.status === "success"
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {connectionStatus.status === "success"
                            ? "Connection Successful"
                            : "Connection Failed"}
                        </h3>
                        <p className="text-sm mt-1">
                          {connectionStatus.message ||
                            (connectionStatus.status === "success"
                              ? "Successfully connected to IPFS gateway"
                              : "Failed to connect to IPFS gateway")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    This test verifies that your application can connect to the
                    IPFS gateway. If the test fails, check your network
                    connectivity or contact your administrator.
                  </p>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="config">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              <span>Configuration - IPFS Gateway Settings</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Gateway Configuration</CardTitle>
                <CardDescription>
                  Configure the IPFS gateway endpoints used by the application
                  for accessing the decentralized storage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      RPC API Endpoint
                    </label>
                    <Input
                      placeholder="https://sds-gateway-uswest.thestratos.org/spfs/xxxxxxxxxxxxxxxxxxxxxxxxx/api/v0"
                      value={rpcApiInput}
                      onChange={(e) => setRpcApiInput(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The IPFS RPC API endpoint for direct node interaction
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Public Gateway
                    </label>
                    <Input
                      placeholder="https://spfs-gateway.thestratos.net"
                      value={publicGatewayInput}
                      onChange={(e) => setPublicGatewayInput(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The public gateway for subdomain-style URLs
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Path Gateway</label>
                    <Input
                      placeholder="https://spfs-gateway.thestratos.net"
                      value={pathGatewayInput}
                      onChange={(e) => setPathGatewayInput(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The gateway for path-style URLs
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleFetchConfig(true);
                      }}
                      variant="outline"
                      className="flex-1"
                      disabled={isLoadingConfig}
                    >
                      {isLoadingConfig ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Load Current Config
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleUpdateConfig();
                      }}
                      disabled={isUpdatingConfig}
                      className="flex-1"
                    >
                      {isUpdatingConfig ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Configuration
                    </Button>
                  </div>
                </div>

                <div className="mt-2 text-sm text-muted-foreground">
                  <p>
                    These settings control how your application connects to the
                    Stratos SPFS (IPFS-compatible) system. Change these settings
                    only if you understand the implications.
                  </p>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="mt-6 bg-muted/50">
        <CardHeader>
          <CardTitle>About IPFS Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            These commands interact directly with the Stratos Protocol File
            System (SPFS), which is compatible with the InterPlanetary File
            System (IPFS) API. IPFS is a distributed system for storing and
            accessing files, websites, applications, and data.
          </p>
          <div className="mt-4 grid gap-2">
            <div className="flex items-start">
              <FileText className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">cat</p>
                <p className="text-sm text-muted-foreground">
                  Displays the content of a file stored in IPFS.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Pin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">pin</p>
                <p className="text-sm text-muted-foreground">
                  Pins objects to local storage, preventing them from being
                  garbage collected.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FolderTree className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">mfs</p>
                <p className="text-sm text-muted-foreground">
                  Mutable File System commands allow you to work with files and
                  directories as in a traditional filesystem.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Learn more about IPFS in{" "}
            <a
              href="https://docs.ipfs.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              the official documentation
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

// Video Import Panel Component
const VideoImportPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for the imported videos results
  const [importResults, setImportResults] = useState<{
    total: number;
    imported: number;
    skipped: number;
    videos: any[];
  } | null>(null);

  // Query for IPFS videos
  const {
    data: ipfsVideos,
    isLoading: isLoadingVideos,
    isError: isVideosError,
    refetch: refetchVideos,
  } = useQuery({
    queryKey: ["ipfsVideos"],
    queryFn: () => findIPFSVideos(),
    enabled: false,
  });

  // Mutation for importing videos
  const importMutation = useMutation({
    mutationFn: () => importIPFSVideos(),
    onSuccess: (data) => {
      setImportResults(data);

      toast({
        title: "Import Completed",
        description: `Successfully imported ${data.imported} videos out of ${data.total} found.`,
      });

      // Invalidate videos queries to refresh the video list
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle searching for IPFS videos
  const handleFindVideos = () => {
    setImportResults(null);
    refetchVideos();
  };

  // Handle importing videos
  const handleImportVideos = () => {
    if (!ipfsVideos || ipfsVideos.length === 0) {
      toast({
        title: "No Videos Found",
        description: "Please search for videos first before importing.",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate();
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={handleFindVideos}
            disabled={isLoadingVideos}
            className="flex-1"
          >
            {isLoadingVideos ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Scan for Videos
              </>
            )}
          </Button>
          <Button
            onClick={handleImportVideos}
            disabled={
              importMutation.isPending || !ipfsVideos || ipfsVideos.length === 0
            }
            variant="default"
            className="flex-1"
          >
            {importMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...
              </>
            ) : (
              <>
                <Import className="mr-2 h-4 w-4" /> Import All Videos
              </>
            )}
          </Button>
        </div>

        {ipfsVideos && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">
                Found Videos ({ipfsVideos.length})
              </label>
              {importResults && (
                <Badge variant="outline" className="ml-2">
                  Imported: {importResults.imported} / Skipped:{" "}
                  {importResults.skipped}
                </Badge>
              )}
            </div>

            {ipfsVideos.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Video className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <p>No video files found in IPFS.</p>
                <p className="text-sm">
                  Try uploading video files to your IPFS node first.
                </p>
              </div>
            ) : (
              <>
                {importMutation.isPending && (
                  <div className="mb-4">
                    <p className="text-sm mb-2">Importing videos...</p>
                    <Progress
                      value={
                        importResults
                          ? ((importResults.imported + importResults.skipped) /
                              importResults.total) *
                            100
                          : undefined
                      }
                      className="h-2"
                    />
                  </div>
                )}

                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-2 text-left">CID</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-right">Size</th>
                        <th className="px-4 py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ipfsVideos.map((video, i) => {
                        // Find status of this video in import results
                        let status = "Pending";
                        if (importResults) {
                          const found = importResults.videos.find(
                            (v) => v.fileHash === video.cid
                          );
                          if (found) {
                            status = "Imported";
                          } else if (importResults.skipped > 0) {
                            status = "Skipped";
                          }
                        }

                        return (
                          <tr key={i} className="border-b last:border-0">
                            <td className="px-4 py-2 font-mono text-xs">
                              {video.cid.substring(0, 16)}...
                            </td>
                            <td className="px-4 py-2">
                              {video.fileType || "video"}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {formatFileSize(video.size)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {status === "Imported" ? (
                                <Badge className="ml-auto bg-green-500 hover:bg-green-600">
                                  Imported
                                </Badge>
                              ) : status === "Skipped" ? (
                                <Badge variant="secondary" className="ml-auto">
                                  Skipped
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="ml-auto">
                                  Pending
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {importResults && importResults.imported > 0 && (
        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-md border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center">
            <Download className="h-4 w-4 mr-2" /> Import Successful
          </h4>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
            Successfully imported {importResults.imported} videos to your
            platform.
            {importResults.skipped > 0 &&
              ` (${importResults.skipped} videos were already in your library)`}
          </p>
        </div>
      )}
    </div>
  );
};

export default IPFSManager;
